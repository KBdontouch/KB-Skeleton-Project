import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useBudgetStore = defineStore('budget', () => {
  const authStore = useAuthStore();
  const budget = ref([]);
  const budgetId = ref();
  const activeBudget = ref(null);

  const now = new Date();

  // 2. 연도와 월 추출
  const year = now.getFullYear();
  // 월은 0부터 시작하므로 1을 더하고, 10보다 작을 경우 앞에 '0'을 붙여 2자리로 만듭니다.
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // 3. YYYY-MM 형식으로 조합
  const formatDate = computed(
    () => `${activeYear.value}-${String(activeMonth.value).padStart(2, '0')}`,
  );

  const activeYear = ref(parseInt(year));
  const activeMonth = ref(parseInt(month));

  const updateMoney = ref(0);

  const initBudget = async () => {
    const res = await axios.get('/api/budget?user_no=' + authStore.user.id);

    budget.value = res.data;
    const findBudget = budget.value.find((i) => {
      return (
        new Date(i.budget_date).getMonth() + 1 == new Date().getMonth() + 1 &&
        new Date(i.budget_date).getFullYear() == new Date().getFullYear()
      );
    });
    if (findBudget) {
      activeBudget.value = findBudget;
      updateMoney.value = activeBudget.value.budget_money;
    }

    const id = await axios.get('/api/budget');
    budgetId.value = id.data[id.data.length - 1].id + 1;
  };

  const fetchDate = async () => {
    await changeMonth();
  };

  // 이전 달
  const prevMonth = () => {
    activeMonth.value--;
    if (activeMonth.value < 1) {
      activeMonth.value = 12;
      activeYear.value--;
    }
    fetchDate();
  };

  // 다음 달
  const nextMonth = () => {
    activeMonth.value++;
    if (activeMonth.value > 12) {
      activeMonth.value = 1;
      activeYear.value++;
    }
    fetchDate();
  };

  const changeMonth = async () => {
    const res = await axios.get(
      `/api/budget?user_no=${authStore.user.id}&budget_date=${formatDate.value}`,
    );
    if (res.data.length == 0) {
      activeBudget.value = null;
      updateMoney.value = 0;
    } else {
      activeBudget.value = res.data[0];
      updateMoney.value = activeBudget.value.budget_money;
    }
    await getChartData();
  };

  const updateBudget = async () => {
    if (updateMoney.value <= 0 || updateMoney.value == '') {
      return alert('예산을 입력하세요 음수는 예산 설정이 불가능합니다.');
    }

    if (!confirm('예산을 설정하시겠습니까?')) return;

    const res = await axios.get(
      `/api/budget?user_no=${authStore.user.id}&budget_date=${formatDate.value}`,
    );

    let serverData;

    if (res.data.length == 0) {
      const newBudget = {
        id: budgetId.value,
        budget_date: formatDate.value,
        budget_money: updateMoney.value,
        user_no: authStore.user.id,
      };
      serverData = await axios.post('/api/budget', newBudget);
    } else {
      const updateBudget = {
        ...activeBudget.value,
        budget_money: updateMoney.value,
      };
      serverData = await axios.put(
        '/api/budget/' + updateBudget.id,
        updateBudget,
      );
    }
    activeBudget.value = serverData.data;
    alert('예산 설정이 완료되었습니다.');
    await getChartData();
  };

  const chartData = ref({
    labels: [],
    datasets: [],
  });

  const getChartData = async () => {
    const res = await axios.get(
      `/api/budget?user_no=${authStore.user.id}&budget_date=${formatDate.value}`,
    );
    const budgetMoney = res.data[0]?.budget_money || 0;

    const historyRes = await axios.get(
      `/api/history?user_no=${authStore.user.id}`,
    );

    const historyData = historyRes.data.filter(
      (h) => h.history_date.substring(0, 7) == formatDate.value,
    );

    const totalSpend = historyData.reduce(
      (acc, cur) => acc + cur.history_money,
      0,
    );

    chartData.value = {
      labels: ['예산', '지출금액'],
      datasets: [
        {
          label: `${formatDate.value} 현황`,
          backgroundColor: ['#42A5F5', '#FF7043'],
          data: [budgetMoney, totalSpend],
        },
      ],
    };
  };

  return {
    budget,
    activeBudget,
    formatDate,
    activeYear,
    activeMonth,
    updateMoney,
    initBudget,
    prevMonth,
    nextMonth,
    updateBudget,
    chartData,
    getChartData,
    fetchDate,
  };
});
