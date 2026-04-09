<template>
  <div>
    <Doughnut :options="chartOptions" :data="chartOutData" />
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

const mainStore = useMainStore();

const chartOutData = computed(() => ({
  labels: mainStore.chartOut.labels,
  datasets: [
    {
      label: '카테고리별 지출',
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      data: mainStore.chartOut.data,
    },
  ],
}));

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    position: 'bottom',
    align: 'center',
  },
};
</script>

<style scoped></style>
