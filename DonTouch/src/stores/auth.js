import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useBudgetStore } from './budget';
import { useCalendarStore } from './calendar';
import { useMainStore } from './main';
import { useTransactionStore } from './transaction';
import { useSearchStore } from './transactionsearch';

export const useAuthStore = defineStore('auth', () => {
  // 초기값은 로컬 스토리지에서 가져오거나 null
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);

  const isLoggedIn = computed(() => !!user.value);

  const login = (userData, userToken) => {
    user.value = userData;
    token.value = userToken;

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    // 인증 정보 초기화
    user.value = null;
    token.value = null;

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // 모든 store의 상태 초기화
    const budgetStore = useBudgetStore();
    const calendarStore = useCalendarStore();
    const mainStore = useMainStore();
    const transactionStore = useTransactionStore();
    const searchStore = useSearchStore();

    budgetStore.resetState();
    calendarStore.resetState();
    mainStore.resetState();
    transactionStore.resetState();
    searchStore.resetState();
  };

  // 컴포넌트에서 사용할 수 있도록 반환
  return { user, token, isLoggedIn, login, logout };
});
