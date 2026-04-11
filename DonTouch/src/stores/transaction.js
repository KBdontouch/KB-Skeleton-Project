import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useTransactionStore = defineStore('transaction', () => {
  const history = reactive({
    id: 0,
    history_title: '',
    history_content: '',
    history_money: 0,
    history_type: 'in',
    category_no: '0',
    history_date: new Date(),
    user_no: 0,
    history_state: 0,
  });

  // +1000, ,+5000, +10000 버튼
  const plusBtn = (num) => {
    history.history_money = Number(history.history_money) + num;
  };

  const resetState = () => {
    history.id = 0;
    history.history_title = '';
    history.history_content = '';
    history.history_money = 0;
    history.history_type = 'in';
    history.category_no = '0';
    history.history_date = new Date();
    history.user_no = 0;
    history.history_state = 0;
  };

  return {
    history,
    plusBtn,
    resetState,
  };
});
