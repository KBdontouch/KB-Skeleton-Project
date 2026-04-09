<template>
  <div>
    <!-- 제목 -->
    <div>거래 내역 조회</div>

    <!-- 검색창 -->
    <div>
      <span>(아이콘)검색</span>
      <input type="text" />
      <button>검색</button>
    </div>

    <!-- 검색 필터바 -->
    <div>
      <!-- 거래 타입 -->
      <div>
        <button>전체</button>
        <button>수입</button>
        <button>지출</button>
      </div>

      <!-- 조회 기간 필터 -->
      <div>
        <span>조회기간</span>
        <!-- 버튼 눌렀을 때 시작/ 끝 각각 캘린더 떠서 선택가능 -->
        <!-- 캘린더에도 완료버튼 -->
        <button>토글버튼</button>
      </div>
    </div>

    <!-- 거래내역 리스트 : scroll 사용, db에서 axios-->
    <div>
      <!-- 개별 거래 항목 -->
      <div>
        <!-- 거래 내역 정보 -->
        <div v-for="trans in sortedHistory" :key="trans.history_no">
          <div>icon {{ trans.category_no }}</div>
          <div>거래 제목 {{ trans.history_title }}</div>
          <div>거래 메모{{ trans.history_content }}</div>
          <!--거래 금액  -->
          <div>{{ trans.history_money }}</div>
        </div>

        <!-- 수정/삭제 버튼 -->
        <div>
          <button>수정</button>
          <button>삭제</button>
        </div>
      </div>
      <!-- 개별 거래항목 끝 -->
    </div>
    <!-- 거래내역 리스트 끝 -->

    <!-- 거래유형 조회 바 : 오른쪽 floating, scroll사용 -->
    <div>
      <div>거래유형 별 조회</div>
      <!-- 거래 타입 버튼 -->
      <div>
        <button @click="activeTab = 'TypeIn'">수입</button>
        <button @click="activeTab = 'TypeOut'">지출</button>
        <hr />

        <component :is="tabs[activeTab]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import TypeIn from './transactionslistmenu/TypeIn.vue';
import TypeOut from './transactionslistmenu/TypeOut.vue';

// data
const state = ref(null);

// methods

// 0. db.json data API
const historyURL = '/api/history';
// 1. db.json에서 거래 내역 데이터 가져오기
// 1.1 history 배열 생성
const history = ref([]);
// 1.2 데이터 가져오는 함수
const fetchHistory = async () => {
  try {
    const response = await axios.get(historyURL);
    // axios 결과의 data를 historyDatas에 할당
    history.value = response.data;
    console.log('데이터 로드 완료:', history.value);
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

// 1.4 컴포넌트 Mount시 요청
onMounted(() => {
  fetchHistory();
});

// 2. 수입/지출 카테고리 동적 컴포넌트
// 2.1 (ai) 컴포넌트 넣을 변수 지정(ref)
const activeTab = ref('TypeIn'); // 기본값
const tabs = { TypeIn, TypeOut };

// 3. 카테고리 필터

// 999. 콘솔 확인용
const check = () => console.log('코드 확인', sortedHistory);
check();
</script>

<style scoped></style>
