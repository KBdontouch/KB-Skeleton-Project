import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    history: [],
    budget: 0,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
  }),

  actions: {
    async fetchHistory() {
      try {
        // 매번 동적으로 현재 사용자의 ID를 이용해서 URL 생성
        const authStore = useAuthStore();
        const response = await axios.get(
          '/api/history?user_no=' + authStore.user.id,
        );
        this.history = response.data;
      } catch (error) {
        console.error('데이터 로드 실패 : ', error);
      }
    },

    setCurrentDate(year, month) {
      this.currentYear = year;
      this.currentMonth = month;
    },

    setBudget(amount) {
      this.budget = amount;
    },

    resetState() {
      this.history = [];
      this.budget = 0;
      this.currentYear = new Date().getFullYear();
      this.currentMonth = new Date().getMonth() + 1;
    },
  },

  getters: {
    dailyTotals: (state) => {
      return state.history.reduce((acc, item) => {
        const date = item.history_date;
        // 데이터 없으면 초기값 설정
        if (!acc[date]) acc[date] = { expense: 0, income: 0 };

        // 수입/지출 나누기
        const money = Number(item.history_money);
        if (item.history_type === 'out') {
          acc[date].expense += money;
        } else {
          acc[date].income += money;
        }
        return acc;
      }, {});
    },

    monthlyStats: (state) => {
      const yearStr = String(state.currentYear);
      const monthStr = String(state.currentMonth).padStart(2, '0');
      const targetMonth = `${yearStr}-${monthStr}`;

      return state.history
        .filter((item) => item.history_date.startsWith(targetMonth))
        .reduce(
          (acc, item) => {
            const money = Number(item.history_money);
            if (item.history_type === 'out') {
              acc.totalExpense += money;
            } else {
              acc.totalIncome += money;
            }
            return acc;
          },
          { totalExpense: 0, totalIncome: 0 },
        );
    },

    weeklyTotals: (state) => {
      return state.dailyTotals;
    },
  },
});
