<template>
  <div>
    <Bar :options="chartOptions" :data="chartData" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { computed } from 'vue';
import { useBudgetStore } from '@/stores/budget';

const budgetStore = useBudgetStore();

const chartData = computed(() => budgetStore.chartData);

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels,
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grace: '30%',
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    datalabels: {
      color: '#000',
      anchor: 'end',
      align: 'top',
      formatter: (value) => value.toLocaleString() + '원',
      clip: false,
    },
  },
};
</script>

<style scoped></style>
