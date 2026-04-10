import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "./auth";

export const useCalendarStore = defineStore("calendar", {
  state: () => ({
    history: [], // db.json의 history 데이터 저장하는 배열
    budget: 0, // 예산
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
  }),

  actions: {
    // 데이터를 서버(db.json)에서 불러오는 함수
    async fetchHistory() {
      try {
        const response = await axios.get(
          "http://localhost:3000/history?user_no=" + useAuthStore().user.id,
        ); // 윤재야 프록시 설정 해야한다 나중에 반드시 꼬
        this.history = response.data;
      } catch (error) {
        console.error("데이터 로드 실패 : ", error);
      }
    },

    setCurrentDate(year, month) {
      this.currentYear = year;
      this.currentMonth = month;
    },

    setBudget(amount) {
      this.budget = amount;
    },
  },

  getters: {
    // 날짜별로 지출/수입 합계를 구하는 로직 -> 확인해봐라 윤재야
    dailyTotals: (state) => {
      return state.history.reduce((acc, item) => {
        const date = item.history_date;
        if (!acc[date]) acc[date] = { expense: 0, income: 0 };

        const money = Number(item.history_money);
        if (item.history_type === "out") {
          acc[date].expense += money;
        } else {
          acc[date].income += money;
        }
        return acc;
      }, {});
    },

    monthlyStats: (state) => {
      const yearStr = String(state.currentYear);
      const monthStr = String(state.currentMonth).padStart(2, "0");
      const targetMonth = `${yearStr}-${monthStr}`;

      return state.history
        .filter((item) => item.history_date.startsWith(targetMonth))
        .reduce(
          (acc, item) => {
            const money = Number(item.history_money);
            if (item.history_type === "out") {
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
