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
        <button @click="searchStore.showAll">전체</button>
        <button @click="searchStore.showIn">수입</button>
        <button @click="searchStore.showOut">지출</button>
      </div>

      <!-- 조회 기간 필터 -->
      <div>
        <span>조회기간 :</span>
        <!-- 버튼 눌렀을 때 시작/ 끝 각각 캘린더 떠서 선택가능 -->
        <!-- 캘린더에도 완료버튼 -->
        <input type="date" />
        <input type="date" />
        <button>조회</button>
      </div>
    </div>

    <!-- 거래내역 리스트 : scroll 사용, db에서 axios-->
    <div>
      <!-- 개별 거래 항목 -->
      <div>
        <!-- 거래 내역 정보 -->
        <div v-for="trans in searchStore.inquiry" :key="trans.id">
          <div>icon {{ trans.category_no }}</div>
          <div>거래 제목 {{ trans.history_title }}</div>
          <div>거래 메모{{ trans.history_content }}</div>
          <!-- 거래 금액  -->
          <div>{{ trans.history_money }}</div>
          <!-- 수정/삭제 버튼 -->
          <div>
            <button>수정</button>
            <button @click="deleteInquiry(trans.id)">삭제</button>
          </div>
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
        <!-- <button @click="activeTab = 'TypeIn'">수입</button>
        <button @click="activeTab = 'TypeOut'">지출</button>
        <hr />

        <component :is="tabs[activeTab]" :inquiry="inquiry" /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { defineProps } from 'vue';
import { useSearchStore } from '@/stores/transactionsearch';
import TypeIn from './transactionslistmenu/TypeIn.vue';
import TypeOut from './transactionslistmenu/TypeOut.vue';

// data
const searchStore = useSearchStore();

// 1.4 컴포넌트 Mount시 요청
onMounted(async () => {
  await searchStore.fetchHistory();
  searchStore.inquiry = searchStore.sortedHistory;
});
// methods

// 1. 수입/지출 카테고리 동적 컴포넌트
// 1.1 (ai) 컴포넌트 넣을 변수 지정(ref)
const activeTab = ref('TypeIn'); // 기본값
const tabs = { TypeIn, TypeOut };

// 3. 수정/삭제 버튼 이벤트
const edtiInquiry = () => {};
const deleteInquiry = async (id) => {
  console.log(id);

  try {
    if (confirm('거래 내역을 삭제하겠습니까?')) {
      // (ai) CRUD 삭제
      await axios.delete('/api/history/' + id);

      // (ai) 스토어에 만들어둔 데이터 로드 함수를 다시 실행
      await searchStore.fetchHistory();
      alert('삭제 되었습니다.');
    } else {
      alert('삭제가 취소되었씁니다.');
    }
  } catch (e) {
    alert('오류 발생: ' + e);
  }
};

// 999. 콘솔 확인용
// const check = () => console.log('코드 확인', sortedHistory);
// check();
</script>

<style scoped></style>
