<template>
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
      <div class="card">
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
              placeholder="원"
            />
          </div>
          <button class="set-btn" @click="budgetStore.updateBudget">
            설정
          </button>
        </div>
      </div>

      <div class="card">
        <span class="card-title">지난달 소비 분석</span>
        <input
          type="month"
          v-model="budgetStore.formatDate"
          @change="budgetStore.fetchDate"
        />
        <div class="chart-area">
          <BudgetChart />
          <div class="chart-label">지난달 예산 / 대비 소비 막대그래프</div>
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
/* 전체 컨테이너: 좌/우 배치 */
.container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  font-family: 'Pretendard', sans-serif;
  color: #333;
}

/* 왼쪽 영역: 현재 예산 정보 */
.left-section {
  flex: 1;
  background-color: #e0e0e0;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.calendar-circle {
  background-color: white;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  font-weight: bold;
}

.prev {
  left: -40px;
}
.next {
  right: -40px;
}

.year-text {
  font-size: 14px;
  margin-bottom: 5px;
}
.month-text {
  font-size: 40px;
  font-weight: 800;
}

.budget-display {
  margin-top: 30px;
  background-color: white;
  width: 100%;
  padding: 20px;
  text-align: center;
  border-radius: 4px;
}

.budget-amount {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}

/* 오른쪽 영역: 설정 및 분석 */
.right-section {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: #e0e0e0;
  padding: 20px;
  border-radius: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  display: block;
}

.setting-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input[type='month'],
input[type='number'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.set-btn {
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  width: 80px;
  height: 100%;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
}

.chart-area {
  background-color: white;
  margin-top: 10px;
  padding: 30px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.chart-label {
  margin-top: 15px;
  font-size: 12px;
  color: #666;
}
</style>
