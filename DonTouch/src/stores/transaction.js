import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useTransactionStore = defineStore('transaction', () => {
  const history = reactive({
    history_title: '',
    history_content: '',
    history_money: 0,
    history_type: 'in',
    category_no: '0',
    history_date: new Date().toISOString().slice(0, 16),
    user_no: 0,
    history_state: 0,
  });

  // 수입, 지출 버튼 눌렀을 때 history_type 설정하는 함수
  const changeType = (e) => {
    history.history_type = e.target.value;
  };

  // +1000, ,+5000, +10000 버튼
  const plusBtn = (num) => {
    history.history_money = Number(history.history_money) + num;
  };

  return {
    history,
    changeType,
    plusBtn,
  };
});
