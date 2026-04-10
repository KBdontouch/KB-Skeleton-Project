<template>
  <div class="dashboard-container">
    <div class="recent-history">
      <span class="label">최근 거래 내역</span>
      <span class="content">
        {{ mainStore.recentHistory.history_title }}
        {{ (mainStore.recentHistory.history_money || 0).toLocaleString() }}원
        {{ mainStore.recentHistory.history_type == 'in' ? '수입' : '지출' }}
      </span>
      <span class="date">{{ mainStore.recentHistory.history_date }}</span>
    </div>

    <div class="summary-wrapper">
      <div class="summary-card">
        <span class="card-title">이번달 총 수입</span>
        <span class="card-value"
          >{{ mainStore.totalIn.toLocaleString() }}원</span
        >
        <div class="chart-placeholder">
          <MainChartIn />
        </div>
      </div>

      <div class="summary-card">
        <span class="card-title">이번달 총 지출</span>
        <span class="card-value"
          >{{ mainStore.totalOut.toLocaleString() }}원</span
        >
        <div class="chart-placeholder">
          <MainChartOut />
        </div>
      </div>

      <div class="summary-card profit-card">
        <span class="card-title">순수익</span>
        <div class="profit-value">{{ mainStore.total.toLocaleString() }}원</div>
      </div>
    </div>

    <div class="add-button" @click="move">
      <span>+ 거래내역 추가</span>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { onMounted } from 'vue';
import MainChartIn from './MainChartIn.vue';
import MainChartOut from './MainChartOut.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const mainStore = useMainStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await mainStore.dataInit();
  console.log(authStore.user);
});

const move = () => {
  router.push('/');
};
</script>

<style scoped>
/* 전체 컨테이너 여백 */
.dashboard-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Pretendard', sans-serif; /* 폰트는 프로젝트에 맞게 설정 */
  background-color: #ffffff;
}

/* 상단 최근 거래 내역 */
.recent-history {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f2f2f2;
  padding: 15px 30px;
  border-radius: 20px;
  font-size: 14px;
  margin: 0px 15px;
}

.recent-history .label {
  font-weight: bold;
}
.recent-history .date {
  color: #888;
}

/* 중앙 3개 카드 레이아웃 */
.summary-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.summary-card {
  flex: 1;
  background-color: #f2f2f2;
  border-radius: 20px;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 250px;
  margin: 15px;
}

.card-title {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.card-value {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* 차트가 들어갈 공간 확보 */
.chart-placeholder {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 순수익 카드 특화 스타일 */
.profit-card {
  justify-content: flex-start; /* 텍스트가 위에 오도록 */
}

.profit-value {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 800;
  color: #333;
}

/* 하단 추가 버튼 */
.add-button {
  background-color: #f2f2f2;
  padding: 20px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
  margin: 0px 15px;
}

.add-button:hover {
  background-color: #e8e8e8;
}
</style>
