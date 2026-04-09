import { ref, computed, reactive, compile } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useMainStore = defineStore('main', () => {
  const states = reactive({
    history: [],
    recent: {},
  });

  const calcMoney = (type) => {
    const moneyData = states.history.filter((item) => {
      return (
        // type이 같은것 & 달이 같은 것 필터링
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

  const recentHistory = async () => {
    try {
      // history 데이터 다 가져오기
      const response = await axios.get('/api/history');
      states.history = response.data;

      // 날짜 최근순으로 정렬
      const sortData = [...response.data].sort((a, b) => {
        return new Date(b.history_date) - new Date(a.history_date);
      });

      // 가장 최근 날짜에 해당하는 거래 내역 저장
      states.recent = sortData[0];
    } catch (e) {
      console.log(e.message);
    }
  };

  return { states, recentHistory, total, totalIn, totalOut };
});
