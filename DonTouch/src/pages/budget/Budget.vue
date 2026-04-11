<template>
  <div class="header">예산 설정 및 분석</div>
  <div class="container">
    <div class="left-section">
      <div class="calendar-circle">
        <button class="nav-btn prev" @click="budgetStore.prevMonth">
          &lt;
        </button>
        <div class="year-text">{{ budgetStore.activeYear }}년</div>
        <div class="month-text">{{ budgetStore.activeMonth }}월</div>
        <button class="nav-btn next" @click="budgetStore.nextMonth">
          &gt;
        </button>
      </div>

      <div class="budget-display">
        <span>이번 달 예산 : </span>
        <span v-if="budgetStore.activeBudget" class="budget-amount">
          {{ (budgetStore.activeBudget.budget_money || 0).toLocaleString() }}원
        </span>
        <span v-else class="budget-amount">예산을 설정하세요.</span>
      </div>
    </div>

    <div class="right-section">
      <div class="card-set">
        <span class="card-title">예산 설정하기</span>
        <div class="setting-row">
          <div class="input-group">
            <input
              type="month"
              v-model="budgetStore.formatDate"
              @change="budgetStore.fetchDate"
            />
            <input
              type="number"
              v-model="budgetStore.updateMoney"
              placeholder="예산 금액 입력 (단위: 원)"
              @keyup.enter="budgetStore.updateBudget"
            />
          </div>
          <button class="set-btn" @click="budgetStore.updateBudget">
            설정
          </button>
        </div>
      </div>

      <div class="card-chart">
        <div class="chart-title-bar">
          <span class="card-title">지난달 소비 분석</span>
          <input
            type="month"
            v-model="budgetStore.formatDate"
            @change="budgetStore.fetchDate"
          />
        </div>
        <div class="chart-area">
          <BudgetChart />
          <!-- <div class="chart-label">지난달 예산 / 대비 소비 막대그래프</div> -->
        </div>
      </div>
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

<style scoped>
@import '@/assets/budget.css';
</style>
