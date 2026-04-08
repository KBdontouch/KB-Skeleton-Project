<template>
  <div>
    <!-- 상단 섹션 : 최근 거래 확인 -->
    <div>
      최근 거래 내역
      <!-- 최근 거래내역 데이터 -->
      <div>
        <div>{{ recentData.history_type == 'in' ? '수입' : '지출' }}</div>
        <div>{{ recentData.history_title }}</div>
        <div>{{ recentData.history_money }}</div>
      </div>
    </div>

    <hr />

    <!-- 중간 섹션 : 요약 카드 -->
    <div>
      <!-- 이번달 총 수입 -->
      <div>
        <div>이번달 총 수입</div>
        <div>{{ totalMonthlyIn }}</div>
        <div>도넛 차트</div>
        <div>차트 범례</div>
      </div>
      <!-- 이번달 총 지출 -->
      <div>
        <div>이번달 총 지출</div>
        <div>{{ totalMonthlyOut }}</div>
        <div>도넛 차트</div>
        <div>차트 범례</div>
      </div>
      <!-- 순수익 -->
      <div>
        <div>순수익</div>
        <div>{{ totalMonthlyIn - totalMonthlyOut }}</div>
      </div>
    </div>

    <hr />

    <!-- 하단 섹션 : 빠른 거래버튼 -->
    <div>+ 거래내역 추가</div>
    <!-- @click = "거래내역 페이지" -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// data
// methods
// (ai) - 1 ~ 5
// 1. 데이터를 담을 반응형 변수 선언 (초기값은 빈 배열)
const historyDatas = ref([]);
const historyUrl = '/api/History';

// 2. 데이터를 가져오는 함수 (비동기 처리)
const fetchHistory = async () => {
  try {
    const response = await axios.get(historyUrl);
    // axios 결과의 data를 historyDatas에 할당
    historyDatas.value = response.data;
    console.log('데이터 로드 완료:', historyDatas.value);
  } catch (error) {
    console.error('데이터를 가져오는데 실패했습니다:', error);
  }
};

// 3. 필터링된 데이터는 computed 사용 : historyDatas가 변할 때마다 자동으로 계산
const monthlyIn = computed(() => {
  return historyDatas.value.filter((i) => i.history_type === 'in');
});

const monthlyOut = computed(() => {
  return historyDatas.value.filter((i) => i.history_type === 'out');
});

// 4. 컴포넌트가 마운트될 때 데이터 요청
onMounted(() => {
  fetchHistory();
});

// 5. 월별 총수입/총지출 계산
// 5.1 이번달 총 수입 합계
const totalMonthlyIn = computed(() => {
  return monthlyIn.value.reduce((acc, cur) => {
    return acc + Number(cur.history_money);
  }, 0); // 0 : 초기값
});

// 5.2 이번달 총 지출 합계
const totalMonthlyOut = computed(() => {
  return monthlyOut.value.reduce(
    (acc, cur) => acc + Number(cur.history_money),
    0,
  );
});

// 6. 최근 거래 내역
const recentData = computed(() => {
  // 6.1 최근 거래내역이 없는 경우
  if (historyDatas.value.length === 0) return null;

  // 6.2 원본 배열 정렬
  // [...historyDatas.value] : 연산자 이용해 배열 복사
  const sorted = [...historyDatas.value].sort((a, b) => {
    // Date 생성자에 넣어 숫자로 비교가능
    return new Date(b.history_date) - new Date(a.history_date);
  });
  // 6.3 최신 항목 반환
  return sorted[0];
});

// * 데이터 콘솔 확인용 임시 함수
const check = () => {
  console.log('콘솔데이터 확인 :', monthlyIn);
};

check();
</script>

<style scoped></style>
