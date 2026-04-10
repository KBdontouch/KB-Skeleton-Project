//api 고치기
<template>
  <div class="page">
    <div class="container">
      <h2 class="title">거래 내역 추가</h2>

      <button
        type="button"
        class="btn tab"
        :class="{ active: transaction.type === 'in' }"
        @click="changeType('in')"
      >
        수입
      </button>

      <button
        type="button"
        class="btn tab"
        :class="{ active: transaction.type === 'out' }"
        @click="changeType('out')"
      >
        지출
      </button>

      <div class="field">
        <label for="transaction-date">날짜</label>
        <input
          type="datetime-local"
          id="transaction-date"
          :max="maxDate"
          v-model="transaction.date"
        />
      </div>

      <div class="field">
        <label>거래 제목</label>
        <input
          type="text"
          class="input-box"
          v-model="transaction.title"
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
          v-model.number="transaction.amount"
          placeholder="금액입력"
        />
        <button
          type="button"
          v-if="transaction.amount !== null"
          class="clear-btn"
          @click="clearAmount"
        >
          X
        </button>
      </div>
      <div class="amount-buttons">
        <button type="button" class="amount-btn" @click="addAmount(1000)">
          +1,000
        </button>
        <button type="button" class="amount-btn" @click="addAmount(5000)">
          +5,000
        </button>
        <button type="button" class="amount-btn" @click="addAmount(10000)">
          +10,000
        </button>
      </div>
      <div class="field">
        <label>카테고리</label>
        <select class="input-box" v-model="transaction.category">
          <option disabled value="">카테고리 선택</option>
          <option
            v-for="category in currentCategories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>메모</label>
        <textarea
          class="memo-box"
          v-model="transaction.memo"
          placeholder="메모 입력"
        ></textarea>
      </div>
      <div class="actions">
        <button type="button" class="action-btn" @click="submitTransaction">
          등록하기
        </button>
        <button type="button" class="action-btn" @click="cancelTransaction">
          취소하기
        </button>
      </div>
      <div class="footer-placeholder">footer</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';

const maxDate = new Date().toISOString().slice(0, 16);

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

const incomeCategories = ['급여', '부수입', '용돈', '상여', '금융소득', '기타'];

const expenseCategories = [
  '식비',
  '교통',
  '문화생활',
  '마트',
  '패션/미용',
  '생필품',
  '의료/건강',
  '교육',
  '경조사',
  '부모님 용돈',
  '저축',
  '월세',
  '통신비',
  '공과금',
  '보험',
];
const transaction = reactive({
  type: 'in',
  title: '',
  amount: null,
  category: '',
  memo: '',
});

const currentCategories = computed(() => {
  return transaction.type === 'in' ? incomeCategories : expenseCategories;
});
function changeType(type) {
  transaction.type = type;
  transaction.category = '';
}
function addAmount(value) {
  const currentAmount = Number(transaction.amount) || 0;
  transaction.amount = currentAmount + Number(value);
}
function clearAmount() {
  transaction.amount = null; //금액 데이터 비우기
}
function submitTransaction() {
  alert('거래 내역이 등록되었습니다.');
}
function cancelTransaction() {
  if (confirm('거래 내역 작성을 취소하겠습니까?')) {
    alert('취소되었습니다.');
  }
}
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
