<template>
  <div class="">
    <!-- 최근 거래 내역 영역 -->
    <div>
      <span>최근 거래 내역</span>
      <span>
        {{ mainStore.states.recent.history_title }}
        <!-- 
          초기에 toLocalString() 함수를 사용하면 
          데이터가 불러와지기 전에 실행되므로 
          데이터가 불러와지기 전에 0을 기본값으로 놓는다. 
        -->
        {{ (mainStore.states.recent.history_money || 0).toLocaleString() }}원
        {{ mainStore.states.recent.history_type == 'in' ? '수입' : '지춞' }}
      </span>
      <span>{{ mainStore.states.recent.history_date }}</span>
    </div>

    <!-- 수입, 지출, 순이익 영역 -->
    <div>
      <!-- 이번달 총 수입 영역 -->
      <div>
        <span>이번달 총 수입</span>
        <span>{{ mainStore.totalIn.toLocaleString() }}</span>
        <MainChart />
      </div>

      <!-- 이번달 총 지출 영역 -->
      <div>
        <span>이번달 총 지출</span>
        <span>{{ mainStore.totalOut.toLocaleString() }}</span>
        <MainChart />
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
import MainChart from './MainChart.vue';

const mainStore = useMainStore();
mainStore.recentHistory();
</script>

<style scoped></style>
