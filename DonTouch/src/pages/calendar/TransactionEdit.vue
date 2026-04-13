<template>
  <div class="page" v-if="transactionStore.history">
    <div class="container-wrap">
      <div class="container">
        <h2 class="title">거래 내역 수정</h2>

        <div class="tab-group">
          <button
            type="button"
            class="btn tab"
            :class="{
              'tab-active': transactionStore.history.history_type === 'in',
            }"
            @click="categoryIn"
          >
            수입
          </button>

          <button
            type="button"
            class="btn tab"
            :class="{
              'tab-active': transactionStore.history.history_type === 'out',
            }"
            @click="categoryOut"
          >
            지출
          </button>
        </div>

        <div class="field">
          <label for="transaction-date">날짜</label>
          <input
            type="date"
            id="transaction-date"
            class="input-box"
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
            @click="addAmount(amount)"
          >
            +{{ amount.toLocaleString() }}
          </button>
        </div>

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

        <div class="actions">
          <button type="button" class="action-btn primary" @click="editup">
            수정하기
          </button>
          <button type="button" class="action-btn secondary" @click="cancel">
            취소하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useTransactionStore } from '@/stores/transaction';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 거래 내역 리스트 불러오기 (id 포함해서)
const transactionStore = useTransactionStore();
const route = useRoute();
const router = useRouter();
const authstore = useAuthStore();

// 수정 대상 id 찾기 - 추가
const historyId = route.params.id;
//await axios.put(`/api/history/${historyId}`, payload);

// 수정 함수 payload 추가 (원인: error 발생)
const edit = async () => {
  try {
    const payload = {
      // 히스토리 객체 안에 아래 데이터 있다
      ...transactionStore.history,
      user_no: transactionStore.history.user_no ?? authstore.user?.id,
      category_no: Number(transactionStore.history.category_no),
      history_money: Number(transactionStore.history.history_money),
      history_date: String(transactionStore.history.history_date).slice(0, 10),
    };

    // console.log("historyId", historyId);
    // console.log("payload:", payload);

    // 문제발생1: 에러 발생 해결법1
    console.log('PUT 주소:', `/api/history/${historyId}`);
    console.log('PUT payload:', payload);

    const putResult = await axios.put(`/api/history/${historyId}`, payload);

    if (putResult.status === 200) {
      alert('거래 내역이 수정되었습니다.');
      transactionStore.resetState();
      router.push('/transaction');
    } else {
      alert('거래 내역 수정이 실패했습니다.');
    }
  } catch (error) {
    console.error('조회 에러', error);
    console.error('historyId:', historyId);
    //console.error("payload:", transactionStore.history);
    console.error('response:', error.response?.data);
    return;
    // alert("에러발생");
  }
};

// 카테고리 API
const categoryURL = '/api/category';
const category = ref([]);

// 카테고리 데이터 가져오기
const fetchCategory = async () => {
  try {
    const response = await axios.get(categoryURL);
    category.value = response.data;
    console.log('category 데이터 로드 완료:', category.value);
  } catch (error) {
    console.error('데이터를 가져오는데 실패했습니다:', error);
  }
};
// 카테고리 콤보
const currentCategories = ref([]);

// 컴포넌트 실행 시
onMounted(async () => {
  //1. 카테고리 목록부터 가져오기
  await fetchCategory();

  //2. store 초기화 후 DB에서 최신 데이터 조회
  transactionStore.resetState();
  
  try {
    const response = await axios.get(`/api/history/${historyId}`);
    console.log('조회 데이터', response.data);

    // store의 history 초기화 후 DB 데이터로 설정
    transactionStore.history = {
      id: response.data.id,
      user_no: response.data.user_no,
      category_no: response.data.category_no,
      history_title: response.data.history_title,
      history_money: response.data.history_money,
      history_type: response.data.history_type,
      history_date: response.data.history_date,
      history_content: response.data.history_content,
      history_state: response.data.history_state,
    };
  } catch (error) {
    console.error(error);
    alert('거래 정보를 불러오지 못했습니다.');
    return;
  }

  //3. 날짜 포맷 처리
  if (transactionStore.history.history_date) {
    transactionStore.history.history_date = String(
      transactionStore.history.history_date,
    ).slice(0, 10);
  }

  //4. 카테고리 필터링
  if (transactionStore.history.history_type === 'in') {
    currentCategories.value = category.value.filter(
      (item) => item.category_type === 'in',
    );
  } else {
    currentCategories.value = category.value.filter(
      (item) => item.category_type === 'out',
    );
  }
});

// 수입 카테고리
const categoryIn = () => {
  transactionStore.history.history_type = 'in';
  currentCategories.value = category.value.filter(
    (item) => item.category_type === 'in',
  );
  //추가
  transactionStore.history.category_no = '';
};
// 지출 카테고리
const categoryOut = () => {
  transactionStore.history.history_type = 'out';
  currentCategories.value = category.value.filter(
    (item) => item.category_type === 'out',
  );
  transactionStore.history.category_no = '';
};
// 거래 내역 x 버튼 되돌리기
const clearAmount = () => {
  transactionStore.history.history_money = null;
};

const cancel = () => {
  if (confirm('취소하시겠습니까?')) {
    transactionStore.resetState();
    router.push('/transaction');
  }
};
// id 로그인 정보

// 수정해야할 거래 내역 정보 불러오기
const editup = () => {
  const history = transactionStore.history;
  if (
    history.id == null ||
    (history.user_no == null && !authstore.user) ||
    history.category_no == '' ||
    history.category_no == null ||
    !history.history_title ||
    history.history_money == null ||
    !history.history_content ||
    !history.history_date
  ) {
    alert('데이터를 입력하세요.');
    return;
  }
  // 검사 통과 수정한 부분 실행
  edit();
};
// 빠른 추가 버튼 활성화
const addAmount = (amount) => {
  transactionStore.history.history_money =
    Number(transactionStore.history.history_money || 0) + amount;
};
</script>

<style scoped src="@/assets/transactionEdit.css"></style>
