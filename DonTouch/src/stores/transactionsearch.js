import { ref, computed, onMounted } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useSearchStore = defineStore('search', () => {
  // 0. db.json data API
  const historyURL = '/api/history?user_no=1';
  // 1. db.json에서 거래 내역 데이터 가져오기
  // 1.1 history/inquiry 배열 생성
  const history = ref([]);
  // 1.2 데이터 가져오는 함수
  const fetchHistory = async () => {
    try {
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

  return {
    history,
    fetchHistory,
    sortedHistory,
    inquiry,
    selectedCategories,
    showAll,
    showIn,
    showOut,
  };
});
