import { ref, computed, onMounted } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useSearchStore = defineStore('search', () => {
  const authStore = useAuthStore();

  // 1. db.json에서 거래 내역 데이터 가져오기
  // 1.1 history/inquiry 배열 생성
  const history = ref([]);
  // 1.2 데이터 가져오는 함수
  const fetchHistory = async () => {
    try {
      // 매번 동적으로 현재 사용자의 ID를 이용해서 URL 생성
      const historyURL = '/api/history?user_no=' + authStore.user.id;
      const response = await axios.get(historyURL);
      // axios 결과의 data를 historyDatas에 할당
      history.value = response.data;
      // console.log('데이터 로드 완료:', history.value);
    } catch (error) {
      console.error('데이터를 가져오는데 실패했습니다:', error);
    }
  };
  //1.3 데이터 최신순 정렬
  const sortedHistory = computed(() => {
    return [...history.value].sort((a, b) => {
      // 날짜 문자열 Date 객체로 변환하여 비교(내림차순)
      return new Date(b.history_date) - new Date(a.history_date);
    });
  });

  // 2. 전체/수입/지출 필터링
  const inquiry = ref([]);

  const showAll = () => {
    inquiry.value = sortedHistory.value;
  };
  const showIn = () => {
    inquiry.value = sortedHistory.value.filter((i) => i.history_type === 'in');
  };
  const showOut = () => {
    inquiry.value = sortedHistory.value.filter((i) => i.history_type === 'out');
  };

  // 3. 카테고리 항목
  const selectedCategories = ref([]);

  const resetState = () => {
    history.value = [];
    inquiry.value = [];
    selectedCategories.value = [];
  };

  // 2. category 데이터
  // 2.1 category 배열 생성
  const category = ref([]);

  // 2.2 데이터 가져오는 함수
  const fetchCategory = async () => {
    try {
      const categoryURL = '/api/category';
      const response = await axios.get(categoryURL);
      // axios 결과의 data를 categoryDatas에 할당
      category.value = response.data;
      console.log('category 데이터 로드 완료:', category.value);
    } catch (error) {
      console.error('데이터를 가져오는데 실패했습니다:', error);
    }
  };

  return {
    history,
    fetchHistory,
    sortedHistory,
    inquiry,
    selectedCategories,
    showAll,
    showIn,
    showOut,
    resetState,
    category,
    fetchCategory,
  };
});
