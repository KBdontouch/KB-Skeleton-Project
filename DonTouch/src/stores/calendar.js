import { defineStore } from "pinia";
import axios from "axios";

export const useTransactionStore = defineStore("tranaction", {
  state: () => ({
    history: [], // db.json의 history 데이터 저장하는 배열
  }),

  actions: {
    // 데이터를 서버(db.json)에서 불러오는 함수
    async fetchHistory() {
      try {
        const response = await axios.get("http://localhos:3000/history"); // 윤재야 프록시 설정 해야한다 나중에 반드시 꼬
        this.history = response.data;
      } catch (error) {
        console.error("데이터 로드 실패 : ", error);
      }
    },
  },

  getters: {
    // 날짜별로 지출/수입 합계를 구하는 로직 -> 확인해봐라 윤재야
    dailyTotals: (state) => {
      return state.history.reduce((acc, item) => {
        const date = item.history_date;
        if (!acc[date]) acc[data] = { expense: 0, income: 0 };

        if (item.history_type === "out") {
          acc[date].expense += item.history_money;
        } else {
          acc[date].income += item.history_money;
        }
        return acc;
      }, {});
    },
  },
});
