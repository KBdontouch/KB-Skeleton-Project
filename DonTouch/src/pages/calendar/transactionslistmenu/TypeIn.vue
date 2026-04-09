<template>
  <div>
    <!-- 각 유형 -->
    <div>
      <div>수입</div>

      <div v-for="i in categoryIn" :key="i.category_no">
        <input type="checkbox" />
        <span>{{ i.category_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSearchStore } from '@/stores/transactionsearch';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

//const searchStore = useSearchStore();

// 2. category 데이터
const categoryURL = '/api/category';
// 2.1 category 배열 생성
const category = ref([]);

// 2.2 데이터 가져오는 함수
const fetchCategory = async () => {
  try {
    const response = await axios.get(categoryURL);
    // axios 결과의 data를 categoryDatas에 할당
    category.value = response.data;
    console.log('category 데이터 로드 완료:', category.value);
  } catch (error) {
    console.error('데이터를 가져오는데 실패했습니다:', error);
  }
};
// 2.3 컴포넌트 Mount시 요청
onMounted(() => {
  fetchCategory();
});

// 3. categoryIn 필터링 (computed 사용 : 실시간으로 변동 데이터 받아옴)
const categoryIn = computed(() => {
  return category.value.filter((i) => i.category_type === 'in');
});

//999. 콘솔 확인용
// const check = () => console.log('카테고리', categoryIn);
// check();
</script>

<style scoped></style>
