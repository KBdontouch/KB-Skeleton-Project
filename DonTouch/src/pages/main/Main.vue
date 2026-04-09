<template>
  <div class="">
    <!-- 최근 거래 내역 영역 -->
    <div>
      <span>최근 거래 내역</span>
      <span>
        {{ mainStore.recentHistory.history_title }}
        {{ (mainStore.recentHistory.history_money || 0).toLocaleString() }}원
        {{ mainStore.recentHistory.history_type == 'in' ? '수입' : '지춞' }}
      </span>
      <span>{{ mainStore.recentHistory.history_date }}</span>
    </div>

    <!-- 수입, 지출, 순이익 영역 -->
    <div>
      <!-- 이번달 총 수입 영역 -->
      <div>
        <span>이번달 총 수입</span>
        <span>{{ mainStore.totalIn.toLocaleString() }}</span>
        <MainChartIn />
      </div>

      <!-- 이번달 총 지출 영역 -->
      <div>
        <span>이번달 총 지출</span>
        <span>{{ mainStore.totalOut.toLocaleString() }}</span>
        <MainChartOut />
      </div>

      <!-- 순수익 영역 -->
      <div>
        <span>순수익</span>
        <span>{{ mainStore.total.toLocaleString() }}</span>
      </div>
    </div>

    <!-- 거래내역 추가 버튼 영역 -->
    <div>
      <span>+ 거래내역 추가</span>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { onMounted } from 'vue';
import MainChartIn from './MainChartIn.vue';
import MainChartOut from './MainChartOut.vue';

const mainStore = useMainStore();

onMounted(async () => {
  await mainStore.dataInit();
});
</script>

<style scoped></style>
