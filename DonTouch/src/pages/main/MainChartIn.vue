<template>
  <div>
    <Doughnut :options="chartOptions" :data="chartInData" />
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

const mainStore = useMainStore();

const chartInData = computed(() => ({
  labels: mainStore.chartIn.labels,
  datasets: [
    {
      label: '카테고리별 수입',
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FFCD56',
        '#4BC0C0',
        '#C9CBCF',
        '#FF6384',
        '#36A2EB',
        '#9966FF',
        '#FF9F40',
        '#FFCD56',
        '#4BC0C0',
        '#808080',
        '#FF1493',
        '#00BFFF',
        '#32CD32',
        '#FFD700',
        '#9400D3',
      ],
      data: mainStore.chartIn.data,
    },
  ],
}));

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<style scoped></style>
