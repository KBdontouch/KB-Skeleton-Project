<template>
  <div class="page">
    <div class="container">
      <h2 class="title">거래 내역 추가</h2>

      <button
        type="button"
        class="btn tab"
        :class="{ active: transactionStore.history.history_type === 'in' }"
        @click="categoryIn"
      >
        수입
      </button>

      <button
        type="button"
        class="btn tab"
        :class="{ active: transactionStore.history.history_type === 'out' }"
        @click="categoryOut"
      >
        지출
      </button>

      <div class="field">
        <label for="transaction-date">날짜</label>
        <input
          type="date"
          id="transaction-date"
          v-model="transactionStore.history.history_date"
        />
      </div>

      <div class="field">
        <label>거래 제목</label>
        <input
          type="text"
          class="input-box"
          v-model="transactionStore.history.history_title"
          placeholder="거래 제목 입력"
        />
      </div>
      <div class="field">
        <label>금액</label>
      </div>
      <div class="amount-wrapper">
        <input
          type="number"
          class="input-box"
          v-model.number="transactionStore.history.history_money"
          placeholder="금액입력"
        />
        <button
          type="button"
          v-if="transactionStore.history.history_money !== null"
          class="clear-btn"
          @click="clearAmount"
        >
          X
        </button>
      </div>
      <div class="amount-buttons">
        <button
          type="button"
          class="amount-btn"
          v-for="amount in [1000, 5000, 10000]"
          :key="amount"
          @click="transactionStore.plusBtn(amount)"
        >
          +{{ amount.toLocaleString() }}
        </button>
        <!-- // 빠른 추가 amount 버튼 -->
      </div>
      <!-- 카테고리 -->
      <div class="field">
        <label>카테고리</label>
        <select
          class="input-box"
          v-model="transactionStore.history.category_no"
        >
          <option disabled value="">카테고리 선택</option>
          <option
            v-for="item in currentCategories"
            :key="item.id"
            :value="item.id"
          >
            {{ item.category_name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>메모</label>
        <textarea
          class="memo-box"
          v-model="transactionStore.history.history_content"
          placeholder="메모 입력"
        ></textarea>
      </div>
      <!-- 메모와 메모창 입력 -->
      <div class="actions">
        <button type="button" class="action-btn" @click="register">
          등록하기
        </button>
        <button type="button" class="action-btn" @click="cancel">
          취소하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useTransactionStore } from "@/stores/transaction";
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router"; // 윤재 수정

const transactionStore = useTransactionStore();
// user 정보 추가
const authstore = useAuthStore();
// console.log(authstore.user);
// console.log(authstore.user?.userNo);

// 카테고리 API
const categoryURL = "/api/category";
const category = ref([]);

// 현재 거래 타입에 맞는 카테고리 목록
const currentCategories = ref([]);

const router = useRouter();
const route = useRoute(); //윤재 수정

// 카테고리 데이터 가져오기
const fetchCategory = async () => {
  try {
    const response = await axios.get(categoryURL);
    category.value = response.data;
    console.log("category 데이터 로드 완료:", category.value);
  } catch (error) {
    console.error("데이터를 가져오는데 실패했습니다:", error);
  }
};
// 컴포넌트 실행 시 카테고리 요청
onMounted(async () => {
  await fetchCategory();

  // 오늘 날짜 형식으로 설정
  const today = new Date().toISOString().split("T")[0];
  const targetDate = route.query.date || today; // 윤재 데이터
  transactionStore.history.history_date = targetDate; // 윤재 수정

  categoryIn();

  // 추가: 로그인 유저 확인
  console.log("로그인 유저 확인:", authstore.user);
  console.log("로그인 유저 id:", authstore.user?.id);
});

// 수입 카테고리
const categoryIn = () => {
  transactionStore.history.history_type = "in";
  currentCategories.value = category.value.filter(
    (item) => item.category_type === "in",
  );
  transactionStore.history.category_no = "";
};
// 지출 카테고리
const categoryOut = () => {
  transactionStore.history.history_type = "out";
  currentCategories.value = category.value.filter(
    (item) => item.category_type === "out",
  );
  transactionStore.history.category_no = "";
};
// 거래 내역 x 버튼 되돌리기
const clearAmount = () => {
  transactionStore.history.history_money = null;
};

// 취소하기 버튼 실행 시
const cancel = () => {
  if (confirm("취소하시겠습니까?")) {
    router.push("/transaction");
  }
};
// 등록되었습니다 안나와서 추가
const history = transactionStore.history;

// 등록 시 로그인 여부 추가
const register = async () => {
  try {
    // 1. 로그인 여부 확인
    if (!authstore.user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 2. 로그인 사용자 번호 저장
    transactionStore.history.user_no = authstore.user.id;

    // 3. history id 생성
    const res = await axios.get("/api/history");
    const historyList = res.data;

    if (historyList.length > 0) {
      const lastId = historyList[historyList.length - 1].id;
      transactionStore.history.id = Number(lastId) + 1;
    } else {
      transactionStore.history.id = 1;
    }

    console.log("등록할 데이터:", transactionStore.history);

    // 4. 유효성 검사- 추가
    if (
      !transactionStore.history.id ||
      !transactionStore.history.user_no ||
      !transactionStore.history.category_no ||
      !transactionStore.history.history_money ||
      !transactionStore.history.history_title ||
      !transactionStore.history.history_content ||
      !transactionStore.history.history_date
    ) {
      alert("데이터를 입력하세요.");
      return;
    }

    // 5. 상태값 세팅 -state 추가
    transactionStore.history.history_state = 0;

    // 6. 등록 요청
    const postResult = await axios.post(
      "/api/history",
      transactionStore.history,
    );

    if (postResult.status === 201) {
      alert("거래 내역이 등록 되었습니다.");

      const today = new Date().toISOString().split("T")[0];

      transactionStore.history = {
        id: null,
        user_no: null,
        category_no: "",
        history_title: "",
        history_money: null,
        history_type: "in",
        history_date: today,
        history_content: "",
        history_state: 0,
      };

      router.push("/transaction");
    } else {
      alert("거래 내역 등록이 실패하였습니다.");
    }
  } catch (error) {
    console.error("거래 내역 등록 중 오류 발생:", error);
    alert("등록 중 오류가 발생했습니다.");
  }
};
</script>

<style>
.title {
  text-align: center;
}
.tab {
  background: #d9d9d9;
  border: none;
}

.tab.active {
  background: #735e53;
  color: white;
}
.field label {
  display: block;
}
</style>
