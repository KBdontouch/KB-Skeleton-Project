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
          <!-- 기본 정보창 -->
          <div v-if="editingId !== trans.id">
            <div>거래 제목: {{ trans.history_title }}</div>
            <div>거래 메모: {{ trans.history_content }}</div>
            <div>금액: {{ trans.history_money }}원</div>
          </div>
          <!-- 수정창 -->
          <div v-else>
            <div>거래 제목: <input v-model="trans.history_title" /></div>
            <div>거래 메모: <input v-model="trans.history_content" /></div>
            <div>
              금액: <input v-model.number="trans.history_money" type="number" />
            </div>
          </div>
          <!-- 수정/삭제 버튼 -->
          <div>
            <button @click="editInquiry(trans)">
              {{ editingId === trans.id ? '저장' : '수정' }}
            </button>

            <button v-if="editingId === trans.id" @click="cancelEdit">
              취소
            </button>
            <button v-else @click="deleteInquiry(trans.id)">삭제</button>
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
// 3.1 수정 이벤트 (ai)
const editingId = ref(null); // 현재 어떤 항목을 수정 중인지 저장

const editInquiry = async (item) => {
  // 상황 1: 현재 수정 중이 아님 -> 수정창을 띄운다
  if (editingId.value !== item.id) {
    editingId.value = item.id;
    return; // 여기서 함수 종료 (창만 띄움)
  }

  // 상황 2: 이미 수정창이 떠 있음 -> 서버에 PUT 요청을 보낸다
  try {
    if (!confirm('수정된 내용을 저장하시겠습니까?')) return;

    await axios.put(`/api/history/${item.id}`, item);
    alert('수정되었습니다.');

    editingId.value = null; // 수정 완료 후 다시 조회 모드로 변경
    await searchStore.fetchHistory(); // 목록 새로고침
  } catch (e) {
    alert('수정 실패: ' + e);
  }
};
// 3.1.1 수정 취소 이벤트
const cancelEdit = async () => {
  editingId.value = null;
  // v-model로 이미 변해버린 로컬 데이터를 원상복구하기 위해 서버에서 다시 읽어옴
  await searchStore.fetchHistory();
  searchStore.inquiry = searchStore.sortedHistory;
};

// 3.2 삭제 이벤트
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
      alert('삭제가 취소되었습니다.');
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
