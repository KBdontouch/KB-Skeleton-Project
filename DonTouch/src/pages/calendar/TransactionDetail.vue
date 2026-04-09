<template>
  <div>
    <h2 class="text-center">거래 내역 추가</h2>
    <form action="">
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-primary"
          value="in"
          @click="transaction.changeType"
        >
          수입
        </button>
        <button
          type="button"
          class="btn btn-default"
          value="out"
          @click="transaction.changeType"
        >
          지출
        </button>
      </div>
      <br />
      <label for="history-date">날짜</label>
      <input
        type="datetime-local"
        id="history-date"
        :max="new Date().toISOString().slice(0, 16)"
        :value="transaction.history.history_date"
      />
      <br />
      <label for="history-content">거래 제목</label>
      <input
        type="text"
        id="history-content"
        v-model="transaction.history.history_content"
      />
      <br />
      <label for="history-money">금액</label>
      <input
        type="number"
        id="history-money"
        v-model.number="transaction.history.history_money"
      />
      <br />
      <input type="button" value="+1000" @click="transaction.plusBtn(1000)" />
      <input type="button" value="+5000" @click="transaction.plusBtn(5000)" />
      <input type="button" value="+10000" @click="transaction.plusBtn(10000)" />
    </form>
  </div>
</template>

<script setup>
import { useTransactionStore } from '@/stores/transaction';

const transaction = useTransactionStore();
</script>
<style scoped></style>
