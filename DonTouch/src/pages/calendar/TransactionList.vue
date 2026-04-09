<template>
  <div>
    <!-- 제목 -->
    <div>거래 내역 조회</div>

    <!-- 검색창 -->
    <div>
      <span>(아이콘)검색</span>
      <input
        class="searchbox"
        type="text"
        v-model="searchKeyword"
        @keyup.enter="searchFilter"
        placeholder="검색어를 입력하고 엔터를 누르세요"
      />
      <button @click="searchFilter">검색</button>
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
        <input type="date" class="start_date" v-model="startDate" />
        <input type="date" class="end_date" v-model="endDate" />
        <button @click="periodFilter">조회</button>
      </div>
    </div>
    <!-- 검색필터바 끝 -->

    <!-- 거래내역 리스트 : scroll 사용, db에서 axios-->
    <div>
      <!-- 개별 거래 항목 -->
      <div>
        <!-- 거래 내역 정보 -->
        <div
          v-if="searchStore.inquiry.length > 0"
          v-for="trans in searchStore.inquiry"
          :key="trans.id"
        >
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
        <!-- 조회된 거래 내역이 없을 경우 -->
        <div v-else class="no-data-message">
          <div style="text-align: center; padding: 50px; color: #888">
            <p>(!) 조회된 거래 내역이 없습니다.</p>
            <small>다른 기간을 선택하거나 검색어를 확인해 주세요.</small>
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
        <button @click="activeTab = 'TypeIn'">수입</button>
        <button @click="activeTab = 'TypeOut'">지출</button>
        <hr />

        <component :is="tabs[activeTab]" :inquiry="searchStore.inquiry" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

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
// 3.1 (ai) 수정 이벤트
const editingId = ref(null); // 현재 어떤 항목을 수정 중인지 저장

const editInquiry = async (item) => {
  // 3.1.1 수정 버튼 클릭시 수정창 변경
  if (editingId.value !== item.id) {
    editingId.value = item.id;
    return; // 여기서 함수 종료 (창만 띄움)
  }

  // 3.1.2 저장 버튼 클릭시 서버에 PUT 요청 보냄
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

// 3. (ai) 검색 이벤트
// 3.1 사용자가 입력한 검색어를 담을 반응형 변수
const searchKeyword = ref('');
// 3.2 검색 필터 함수
const searchFilter = () => {
  const keyword = searchKeyword.value.trim();

  // 3.2.1 검색어가 비어있을 경우, 전체 리스트(sortedHistory) 반환
  if (!keyword) {
    searchStore.inquiry = searchStore.sortedHistory;
    return;
  }

  // 3.2.2 필터링 로직 실행
  searchStore.inquiry = searchStore.sortedHistory.filter((item) => {
    // 제목(history_title) 또는 내용(history_content)에 키워드가 포함되어 있는지 확인
    // 제목/내용값 falsy일 경우 대비 기본값('') 처리
    const title = item.history_title || '';
    const content = item.history_content || '';

    return title.includes(keyword) || content.includes(keyword);
  });

  console.log(`검색 결과: ${searchStore.inquiry.length}건`);
};

// 4. (ai) 기간 필터링
// 4.1 날짜 입력을 저장할 변수
const startDate = ref('');
const endDate = ref('');

// 4.2 기간 필터링 함수
const periodFilter = () => {
  // 4.2.1 유효성 검사: 둘 중 하나라도 입력되지 않았을 경우
  if (!startDate.value || !endDate.value) {
    alert('시작 날짜와 종료 날짜를 모두 선택해주세요.');
    return;
  }

  // 시작일이 종료일보다 반드시 이전일로 선택
  if (startDate.value > endDate.value) {
    alert('시작 날짜는 종료 날짜보다 빠를 수 없습니다.');
    return;
  }

  // 필터링 시작
  searchStore.inquiry = searchStore.sortedHistory.filter((item) => {
    // 날짜 비교를 위해 Date 객체로 변환 (문자열 "2026-04-09" -> Date 객체)
    const itemDate = new Date(item.history_date);
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    return itemDate >= start && itemDate <= end;
  });
};

// 5. 거래 유형 필터링
const categoryFilter = () => {};

// 999. 콘솔 확인용
// const check = () => console.log('코드 확인', sortedHistory);
// check();
</script>

<style scoped></style>
