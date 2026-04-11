import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useMainStore = defineStore('main', () => {
  const authStore = useAuthStore();

  const states = reactive({
    history: [],
    category: [],
  });

  const dataInit = async () => {
    try {
      const history = await axios.get(
        '/api/history?user_no=' + authStore.user.id,
      );
      const category = await axios.get('/api/category');
      states.history = history.data;
      states.category = category.data;
    } catch (e) {
      console.log(e);
    }
  };

  const recentHistory = computed(() => {
    if (states.history.length === 0) return {};
    // 날짜 최근순으로 정렬
    const sortData = [...states.history].sort((a, b) => {
      return new Date(b.history_date) - new Date(a.history_date);
    });

    // 가장 최근 날짜에 해당하는 거래 내역 저장
    return sortData[0];
  });

  const calcMoney = (type) => {
    const moneyData = states.history.filter((item) => {
      return (
        // type이 같은것 & 월이 같은 것 필터링
        item.history_type === type &&
        new Date(item.history_date).getMonth() === new Date().getMonth() &&
        new Date(item.history_date).getFullYear() === new Date().getFullYear()
      );
    });

    const total = moneyData.reduce(
      (amount, item) => amount + parseInt(item.history_money || 0, 10),
      0,
    );

    return total;
  };

  const totalIn = computed(() => calcMoney('in'));
  const totalOut = computed(() => calcMoney('out'));
  const total = computed(() => totalIn.value - totalOut.value);

  // 차트용
  const chartIn = computed(() => {
    // 1. 이번 달 지출('in') 내역만 필터링
    const inHistory = states.history.filter(
      (h) =>
        h.history_type === 'in' &&
        new Date(h.history_date).getMonth() === new Date().getMonth() &&
        new Date(h.history_date).getFullYear() === new Date().getFullYear(),
    );

    // 2. 카테고리별로 금액 합치기
    const grouped = inHistory.reduce((acc, cur) => {
      // 카테고리 이름 찾기
      const cat = states.category.find(
        (c) => Number(c.id) === Number(cur.category_no),
      );
      const catName = cat ? cat.category_name : '미분류';

      // 해당 카테고리에 금액 누적
      acc[catName] = (acc[catName] || 0) + Number(cur.history_money);
      return acc;
    }, {});

    // 3. Chart.js 형식에 맞게 label과 data 분리
    return {
      labels: Object.keys(grouped),
      data: Object.values(grouped),
    };
  });

  const chartOut = computed(() => {
    // 1. 이번 달 지출('out') 내역만 필터링
    const outHistory = states.history.filter(
      (h) =>
        h.history_type === 'out' &&
        new Date(h.history_date).getMonth() === new Date().getMonth() &&
        new Date(h.history_date).getFullYear() === new Date().getFullYear(),
    );

    // 2. 카테고리별로 금액 합치기
    const grouped = outHistory.reduce((acc, cur) => {
      // 카테고리 이름 찾기
      const cat = states.category.find(
        (c) => Number(c.id) === Number(cur.category_no),
      );
      const catName = cat ? cat.category_name : '미분류';

      // 해당 카테고리에 금액 누적
      acc[catName] = (acc[catName] || 0) + Number(cur.history_money);
      return acc;
    }, {});

    // 3. Chart.js 형식에 맞게 label과 data 분리
    return {
      labels: Object.keys(grouped),
      data: Object.values(grouped),
    };
  });

  const resetState = () => {
    states.history = [];
    states.category = [];
  };

  return {
    states,
    dataInit,
    recentHistory,
    total,
    totalIn,
    totalOut,
    chartIn,
    chartOut,
    resetState,
  };
});
