import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useBudgetStore = defineStore('budget', () => {
  const authStore = useAuthStore();
  const budget = ref([]);
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
  };

  // 이전 달
  const prevMonth = () => {
    activeMonth.value--;
    if (activeMonth.value < 1) {
      activeMonth.value = 12;
      activeYear.value--;
    }
    changeMonth(activeYear.value, activeMonth.value);
  };

  // 다음 달
  const nextMonth = () => {
    activeMonth.value++;
    if (activeMonth.value > 12) {
      activeMonth.value = 1;
      activeYear.value++;
    }
    changeMonth(activeYear.value, activeMonth.value);
  };

  const changeMonth = async (year, month) => {
    const res = await axios.get(
      `/api/budget?user_no=${authStore.user.id}&budget_date=${year + '-' + String(month).padStart(2, '0')}`,
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
    const res = await axios.get(
      `/api/budget?user_no=${authStore.user.id}&budget_date=${activeYear.value + '-' + String(activeMonth.value).padStart(2, '0')}`,
    );

    let update = {
      id: 0,
      budget_date: '',
      budget_money: 0,
      user_no: 0,
    };

    if (res.data.length == 0) {
      update.id = parseInt(budget.value[budget.value.length - 1].id) + 1;
      update.budget_date =
        activeYear.value + '-' + String(activeMonth.value).padStart(2, '0');
      update.budget_money = updateMoney.value;
      update.user_no = authStore.user.id;

      if (update.budget_money <= 0 || update.budget_money == '') {
        alert('예산을 입력하세요 음수는 예산 설정이 불가능합니다.');
      } else {
        if (confirm('예산을 설정하시겠습니까?')) {
          const postResult = await axios.post('/api/budget', update);
          if (postResult.status === 201) {
            alert('예산 설정이 완료되었습니다.');
            initBudget();
          } else {
            alert('예산 설정에 실패하였습니다.');
          }
        }
      }
    } else {
      update = { ...activeBudget.value };
      update.budget_money = updateMoney.value;
      if (update.budget_money <= 0 || update.budget_money == '') {
        alert('예산을 입력하세요 음수는 예산 설정이 불가능합니다.');
      } else {
        if (confirm('예산을 설정하시겠습니까?')) {
          const updateResult = await axios.put(
            '/api/budget/' + update.id,
            update,
          );
          if (updateResult.status === 200) {
            alert('예산 설정이 완료되었습니다.');
            initBudget();
          } else {
            alert('예산 설정에 실패하였습니다.');
          }
        }
      }
    }
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
      (h) =>
        new Date(h.history_date).getFullYear() +
          '-' +
          String(new Date(h.history_date).getMonth() + 1).padStart(2, '0') ==
        formatDate.value,
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

  const handleDateChange = async (newDate) => {
    if (!newDate) return;

    const [y, m] = newDate.split('-');

    activeYear.value = parseInt(y);
    activeMonth.value = parseInt(m);

    await changeMonth(activeYear.value, activeMonth.value);
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
    handleDateChange,
  };
});
