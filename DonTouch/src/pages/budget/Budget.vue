<template>
  <div>
    <!-- 왼쪽 영역 -->
    <div>
      <div>
        <button @click="budgetStore.prevMonth"><</button>
        <div>
          <span> {{ budgetStore.activeYear }}년 </span>
        </div>
        <div>
          <span> {{ budgetStore.activeMonth }}월 </span>
        </div>
        <button @click="budgetStore.nextMonth">></button><br />
      </div>
      <div>
        <span>이번 달 예산 : </span><br />
        <span v-if="budgetStore.activeBudget">
          {{ (budgetStore.activeBudget.budget_money || 0).toLocaleString() }}원
        </span>
        <span v-else>예산을 설정하세요.</span>
      </div>
    </div>

    <!-- 오른쪽 영역 -->
    <div>
      <span>예산 설정하기</span><br />
      <div>
        <input
          type="month"
          v-model="budgetStore.formatDate"
          @change="budgetStore.fetchDate"
        />
        <input
          type="number"
          v-if="budgetStore.activeBudget"
          v-model="budgetStore.updateMoney"
        />
        <input type="number" v-model="budgetStore.updateMoney" v-else />
      </div>
      <div>
        <button @click="budgetStore.updateBudget">설정</button>
      </div>
    </div>
    <div>
      <span>지난달 소비 분석</span><br />
      <input
        type="month"
        v-model="budgetStore.formatDate"
        @change="budgetStore.fetchDate"
      />
      <BudgetChart />
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '@/stores/budget';
import { onMounted } from 'vue';
import BudgetChart from './BudgetChart.vue';

const budgetStore = useBudgetStore();

onMounted(async () => {
  await budgetStore.initBudget();
  budgetStore.getChartData();
});
</script>

<style scoped></style>
