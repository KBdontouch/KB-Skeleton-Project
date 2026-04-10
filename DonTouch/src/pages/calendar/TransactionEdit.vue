//api 고치기
<template>
  <div class="page">
    <div class="container">
      <h2 class="title">거래 내역 수정</h2>

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
        <button type="button" class="action-btn" @click="edit">수정하기</button>
        <button type="button" class="action-btn" @click="cancel">
          취소하기
        </button>
      </div>
      <div class="footer-placeholder">footer</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useTransactionStore } from '@/stores/transaction';
import { useRouter, useRoute } from 'vue-router';

// 거래 내역 리스트 불러오기 (id 포함해서)
const transactionStore = useTransactionStore();
const route = useRoute();
const router = useRouter();

const historyId = route.params.id;

const edit = async () => {
  try {
    const putResult = await axios.put(
      `/api/history/${historyId}`,
      transactionStore.history,
    );

    if (putResult.status === 200) {
      alert('거래 내역이 수정되었습니다.');
      router.push('/transaction');
    } else {
      alert('거래 내역 수정이 실패했습니다.');
    }
  } catch (error) {
    console.error(error);
    alert('에러발생');
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

// 컴포넌트 실행 시
onMounted(async () => {
  await fetchCategory();
  if (!transactionStore.history.id) {
    alert('수정할 거래 정보가 없습니다.');
    router.push('/transaction');
    return;
  }
  if (transactionStore.history.history_type === 'in') {
    currentCategories.value = category.value.filter(
      (item) => item.category_type === 'in',
    );
  } else {
    currentCategories.value = category.value.filter(
      (item) => (item.category_type = 'out'),
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
  transactionStore.history.category_no = 0;
};
// 지출 카테고리
const categoryOut = () => {
  transactionStore.history.history_type = 'out';
  currentCategories.value = category.value.filter(
    (item) => item.category_type === 'out',
  );
  transactionStore.history.category_no = 0;
};
// 거래 내역 x 버튼 되돌리기
const clearAmount = () => {
  transactionStore.history.history_money = null;
};

const cancel = () => {
  if (confirm('취소하시겠습니까?')) {
    router.push('/transaction');
  }
};
const editget = async () => {
  console.log(transactionStore.history);
  if (
    transactionStore.history.id == 0 ||
    transactionStore.history.history_title == '' ||
    transactionStore.history_content == '' ||
    transactionStore.history.history_money == 0 ||
    transactionStore.history.category_no == 0
  ) {
    alert('데이터를 입력하세요.');
  } else {
    try {
      const putResult = await axios.put(
        `/api/history/${historyId}`,
        transactionStore.history,
      );
      if (putResult.status === 200) {
        alert('거래 냉역이 수정되었습니다.');
        router.push('/transaction');
      } else {
        alert('거래 내역 수정이 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('에러발생');
    }
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
