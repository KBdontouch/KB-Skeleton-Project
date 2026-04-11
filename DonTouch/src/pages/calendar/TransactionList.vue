<template>
  <div class="header">거래 내역 조회</div>
  <div class="page">
    <!-- 제목 -->
    <div class="body">
      <div class="headerBar">
        <!-- 거래 타입 -->
        <div class="typeButton">
          <button
            class="btn-all"
            :class="{ active: currentTab === 'all' }"
            @click="selectAll"
          >
            전체
          </button>
          <button :class="{ active: currentTab === 'in' }" @click="selectIn">
            수입
          </button>
          <button
            class="btn-out"
            :class="{ active: currentTab === 'out' }"
            @click="selectOut"
          >
            지출
          </button>
        </div>
        <!-- 필터 조건 출력 -->
        <!-- <div class="appliedFilter">
          <div v-if="searchKeyword">검색 내용: "{{ searchKeyword }}"</div>

          <div v-if="startDate && endDate">
            조회 기간: {{ startDate }} ~ {{ endDate }}
          </div>

          <div v-if="searchStore.selectedCategories.length > 0">
            {{ searchStore.selectedCategories.category_name }}
          </div>
        </div> -->
      </div>

      <!-- 거래내역 리스트 : scroll 사용, db에서 axios-->
      <div class="inquiry-listbox">
        <!-- 개별 거래 항목 -->
        <div>
          <!-- 거래 내역 정보 -->
          <div
            class="inquiry-each"
            v-if="searchStore.inquiry.length > 0"
            v-for="trans in searchStore.inquiry"
            :key="trans.id"
          >
            <div>{{ trans.history_date }}</div>
            <div>icon {{ trans.category_no }}</div>
            <!-- 기본 정보창 -->

            <div class="info-group">
              <div class="title">{{ trans.history_title }}</div>
              <div class="content">{{ trans.history_content }}</div>
            </div>

            <div class="money">
              <div v-if="trans.history_type === 'in'" class="money-in">
                <span>{{ "+ " + trans.history_money.toLocaleString() }}원</span>
              </div>
              <div v-else class="money-out">
                <span>{{ "- " + trans.history_money.toLocaleString() }}원</span>
              </div>
            </div>
            <!-- 수정/삭제 버튼 -->
            <div class="button-group">
              <button @click="editMove(trans)">수정</button>
              <button @click="deleteInquiry(trans.id)">삭제</button>
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
    </div>

    <!-- 거래 내역 필터 바 : 오른쪽 floating, scroll사용 -->
    <div class="filter-menu">
      <br />
      <!-- 제목/내용 검색창 -->
      <div class="inquiry-search">
        <span>검색</span>
        <input
          class="searchbox"
          type="text"
          @keyup.enter="applyFilter"
          v-model="searchKeyword"
          placeholder="거래 제목/내용 입력"
        />
      </div>
      <!-- 조회 기간 필터 -->
      <hr />
      <div>
        <span>조회기간 :</span>
        <!-- 버튼 눌렀을 때 시작/ 끝 각각 캘린더 떠서 선택가능 -->
        <!-- 캘린더에도 완료버튼 -->
        <input type="date" class="start_date" v-model="startDate" />
        ~<input type="date" class="end_date" v-model="endDate" />
      </div>
      <hr />
      <div>거래유형 별 조회</div>
      <!-- 거래 타입 버튼 -->
      <div catebutton-group>
        <button
          :class="{ active: activeTabInfo === 'in' }"
          @click="
            activeTab = 'TypeIn';
            resetCheck;
            selectCateIn();
          "
        >
          수입
        </button>
        <button
          :class="{ active: activeTabInfo === 'out' }"
          @click="
            activeTab = 'TypeOut';
            resetCheck;
            selectCateOut();
          "
        >
          지출
        </button>

        <div class="category-list">
          <component :is="tabs[activeTab]" :inquiry="searchStore.inquiry" />
        </div>
      </div>

      <!-- 조회버튼 -->
      <button id="filter-search" @click="applyFilter">조회</button>
    </div>
    <!-- 거래 내역 필터바 끝 -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";

import { useSearchStore } from "@/stores/transactionsearch";
import { useTransactionStore } from "@/stores/transaction";
import TypeIn from "./transactionslistmenu/TypeIn.vue";
import TypeOut from "./transactionslistmenu/TypeOut.vue";
import { useRouter } from "vue-router";

// data
const searchStore = useSearchStore();
const transactionStore = useTransactionStore();
const router = useRouter();
// 7. 현재 선택된 탭을 저장 (기본값: 'all')
const currentTab = ref("all");
const activeTabInfo = ref("in");

// 1.4 컴포넌트 Mount시 요청
onMounted(async () => {
  await searchStore.fetchHistory();
  searchStore.inquiry = searchStore.sortedHistory;
});
// methods

// 1. 수입/지출 카테고리 동적 컴포넌트
// 1.1 (ai) 컴포넌트 넣을 변수 지정(ref)
const activeTab = ref("TypeIn"); // 기본값
const tabs = { TypeIn, TypeOut };

// 3. 수정/삭제 버튼 이벤트
// 3.0 수정 컴포넌트로 이동
const editMove = (trans) => {
  transactionStore.history = trans;
  router.push("/transaction/edit/:id");
};

// 3.2 삭제 이벤트
const deleteInquiry = async (id) => {
  console.log(id);

  try {
    if (confirm("거래 내역을 삭제하겠습니까?")) {
      // (ai) CRUD 삭제
      await axios.delete("/api/history/" + id);
      // (ai) 스토어에 만들어둔 데이터 로드 함수를 다시 실행
      await searchStore.fetchHistory();

      alert("삭제 되었습니다.");
    } else {
      alert("삭제가 취소되었습니다.");
    }
  } catch (e) {
    alert("오류 발생: " + e);
  }
};

// **필터바**
// 100. 전체 조건 적용 함수
const searchKeyword = ref("");
// 4.1 날짜 입력을 저장할 변수
const startDate = ref("");
const endDate = ref("");

const applyFilter = () => {
  let filtered = [...searchStore.sortedHistory];
  // 3. (ai) 검색 이벤트
  // 3.1 검색 필터 함수
  // 3.1.1 사용자가 입력한 검색어를 담을 반응형 변수
  const keyword = searchKeyword.value.trim();
  if (keyword) {
    filtered = filtered.filter((item) => {
      // 3.3 제목(history_title) 또는 내용(history_content)에 키워드가 포함되어 있는지 확인
      //     제목/내용값 falsy일 경우 대비 기본값('') 처리
      const title = item.history_title || "";
      const content = item.history_content || "";

      return title.includes(keyword) || content.includes(keyword);
    });
  }

  // 4. (ai) 기간 필터링

  // 4.2 기간 필터링 함수
  if (startDate.value && endDate.value) {
    // 4.2.1 유효성 검사: 둘 중 하나라도 입력되지 않았을 경우

    // 시작일이 종료일보다 반드시 이전일로 선택
    if (startDate.value > endDate.value) {
      alert("시작 날짜는 종료 날짜보다 빠를 수 없습니다.");
      return;
    }

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    // 필터링 시작
    filtered = filtered.filter((item) => {
      // 날짜 비교를 위해 Date 객체로 변환 (문자열 "2026-04-09" -> Date 객체)
      const itemDate = new Date(item.history_date);

      return itemDate >= start && itemDate <= end;
    });
  }

  // 5. 거래 유형 필터링
  // 선택된 카테고리가 있을 때만 필터링 수행
  if (searchStore.selectedCategories.length > 0) {
    filtered = filtered.filter((item) => {
      // 거래 내역의 category_no가 선택된 배열에 포함되어 있는지 확인
      return searchStore.selectedCategories.includes(item.category_no);
    });
  }
  currentTab.value = "";
  searchStore.inquiry = filtered;
  console.log(`필터링 완료: ${filtered.length}건`);
};
// 6. 카테고리 탭 변경시 체크박스 초기화
watch(activeTab, () => {
  searchStore.selectedCategories = [];
});

// 7. 버튼 클릭시 선택된 버튼 정보 저장(배경색 CSS 적용)
// 현재 선택된 탭을 저장 (기본값: 'all')
const currentTab = ref("all");

// 버튼 클릭 시 실행될 함수 목록
const selectAll = () => {
  currentTab.value = "all";
  searchStore.showAll();
};

const selectIn = () => {
  currentTab.value = "in";
  searchStore.showIn();
};

const selectOut = () => {
  currentTab.value = "out";
  searchStore.showOut();
};

const selectCateIn = () => {
  activeTabInfo.value = "in";
};
const selectCateOut = () => {
  activeTabInfo.value = "out";
};
// 999. 콘솔 확인용
// const check = () => console.log('코드 확인', sortedHistory);
// check();
</script>

<style>
@import "@/assets/transactionList.css";
</style>
