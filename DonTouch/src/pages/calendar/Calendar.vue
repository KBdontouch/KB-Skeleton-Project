<template>
  <div class="calendar-container">
    <header class="calendar-header">
      <div class="month-selector-wrapper">
        <span class="year-month-display"
          >{{ selectedYear }}년 {{ selectedMonth }}월</span
        >
        <div class="input-wrapper">
          <input
            type="month"
            v-model="selectedMonthStr"
            @change="handleMonthChange"
            class="real-month-input"
          />
          <span class="arrow-icon">▼</span>
        </div>
      </div>

      <div class="budget-center">예산 : {{ budget.toLocaleString() }}원</div>

      <div class="total-stats">
        <p>
          총 지출 :
          <span class="expense">{{ totalExpense.toLocaleString() }}원</span>
        </p>
        <p>
          총 수입 :
          <span class="income">{{ totalIncome.toLocaleString() }}원</span>
        </p>
      </div>
    </header>

    <div class="calendar-body-wrapper">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useTransactionStore } from "@/stores/transaction";

const fullCalendar = ref(null);
const transactionStore = useTransactionStore();

const budget = ref(0);
const selectedYear = ref(2026);
const selectedMonth = ref(4);

const totalExpense = computed(() => transactionStore.totalExpense || 0);
const totalIncome = computed(() => transactionStore.totalIncome || 0);
const dailyData = computed(() => transactionStore.dailyTotals || {});

const selectedMonthStr = computed({
  get: () =>
    `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}`,
  set: (val) => {
    if (!val) return;
    const [y, m] = val.split("-");
    selectedYear.value = parseInt(y);
    selectedMonth.value = parseInt(m);
  },
});

const handleMonthChange = () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    const target = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}-01`;
    calendarApi.gotoDate(target);
    setTimeout(updateWeeklySummary, 100);
  }
};

const updateWeeklySummary = () => {
  document.querySelectorAll(".weekly-summary-bar").forEach((el) => el.remove());

  const calendarApi = fullCalendar.value?.getApi();
  if (!calendarApi) return;

  const currentViewMonth = calendarApi.view.currentStart.getMonth() + 1;
  const days = document.querySelectorAll(".fc-daygrid-day");
  const weeksCount = Math.ceil(days.length / 7);

  for (let i = 0; i < weeksCount; i++) {
    let weeklyExpense = 0;
    let weeklyIncome = 0;
    let hasCurrentMonthDay = false;

    for (let j = 0; j < 7; j++) {
      const cell = days[i * 7 + j];
      if (!cell) continue;
      const dateStr = cell.getAttribute("data-date");
      if (!dateStr) continue;
      if (parseInt(dateStr.split("-")[1]) === currentViewMonth)
        hasCurrentMonthDay = true;
      if (dailyData.value[dateStr]) {
        weeklyExpense += dailyData.value[dateStr].expense || 0;
        weeklyIncome += dailyData.value[dateStr].income || 0;
      }
    }

    if (hasCurrentMonthDay) {
      const summaryBar = document.createElement("div");
      summaryBar.className = "weekly-summary-bar";

      let htmlContent = `<div class="summary-content">`;
      if (weeklyIncome > 0)
        htmlContent += `<span class="w-income">+ ${weeklyIncome.toLocaleString()}원</span>`;
      if (weeklyExpense > 0)
        htmlContent += `<span class="w-expense">- ${weeklyExpense.toLocaleString()}원</span>`;
      htmlContent += `</div>`;

      summaryBar.innerHTML = htmlContent;
      const firstCellInWeek = days[i * 7];
      if (firstCellInWeek) {
        const frame = firstCellInWeek.querySelector(".fc-daygrid-day-frame");
        frame.appendChild(summaryBar);
      }
    }
  }
};

watch(
  [dailyData, selectedMonth, selectedYear],
  () => {
    nextTick(() => setTimeout(updateWeeklySummary, 300));
  },
  { deep: true },
);

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  locale: "ko",
  headerToolbar: false,
  height: "auto",
  fixedWeekCount: false,
  dayCellContent: (arg) => {
    const y = arg.date.getFullYear();
    const m = String(arg.date.getMonth() + 1).padStart(2, "0");
    const d = String(arg.date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const data = dailyData.value[dateStr];

    const isSunday = arg.date.getDay() === 0;
    const sundayClass = isSunday ? "is-sunday" : "";
    const dayNum = arg.dayNumberText.replace("일", ""); // 숫자만 남김

    let html = `<div class='day-cell'>
                  <div class='day-header'>
                    <span class='day-number ${sundayClass}'>${dayNum}</span>
                  </div>`;
    if (data) {
      if (data.expense > 0)
        html += `<p class='daily-expense'>-${data.expense.toLocaleString()}</p>`;
      if (data.income > 0)
        html += `<p class='daily-income'>+${data.income.toLocaleString()}</p>`;
    }
    html += `</div>`;
    return { html };
  },
  datesSet: () => {
    const calendarApi = fullCalendar.value.getApi();
    const currentStart = calendarApi.view.currentStart;
    selectedYear.value = currentStart.getFullYear();
    selectedMonth.value = currentStart.getMonth() + 1;
    nextTick(() => setTimeout(updateWeeklySummary, 300));
  },
});

onMounted(async () => {
  if (transactionStore.fetchHistory) await transactionStore.fetchHistory();
});
</script>

<style scoped>
/* 컨테이너 및 헤더 */
.calendar-container {
  padding: 20px;
  background-color: #f9f9f9;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #d1d1d1;
  padding: 0 20px;
  height: 80px;
  margin-bottom: 20px;
}
.month-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.year-month-display {
  font-size: 1.5rem;
  font-weight: bold;
}
.input-wrapper {
  position: relative;
  width: 30px;
  height: 30px;
}
.real-month-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}
.arrow-icon {
  font-size: 1rem;
  color: #555;
}
.budget-center {
  flex: 1;
  text-align: center;
  font-weight: bold;
}
.total-stats {
  flex: 1;
  text-align: right;
  font-size: 0.9rem;
}
.expense {
  color: #d9534f;
}
.income {
  color: #5cb85c;
}

/* 날짜 숫자 스타일 */
:deep(.day-header) {
  display: flex;
  align-items: baseline;
}
:deep(.day-number) {
  color: #333 !important;
  font-weight: bold !important;
  text-decoration: none !important;
}
:deep(.day-number.is-sunday) {
  color: #ff4d4d !important;
}

/* 요일 헤더 스타일 ('일'만 빨강) */
:deep(.fc-col-header-cell) {
  background-color: #fff;
  z-index: 10;
  position: relative;
  border-bottom: 2px solid #007bff !important;
}
:deep(.fc-col-header-cell-cushion) {
  text-decoration: none !important;
  color: #000 !important;
}
:deep(.fc-day-sun .fc-col-header-cell-cushion) {
  color: #ff4d4d !important;
}

/* 달력 셀 레이아웃 */
:deep(.day-cell) {
  min-height: 120px;
  padding: 45px 5px 5px 5px;
  display: flex;
  flex-direction: column;
}
:deep(.fc-day-other .day-number) {
  opacity: 0.3;
}
:deep(.daily-expense) {
  font-size: 11px;
  color: #d9534f;
  text-align: right;
  margin: 2px 0;
}
:deep(.daily-income) {
  font-size: 11px;
  color: #5cb85c;
  text-align: right;
  margin: 2px 0;
}

/* 주간 합계 바 */
:deep(.fc-daygrid-body tr) {
  position: relative !important;
}
:deep(.weekly-summary-bar) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #e9ecef;
  border-bottom: 2px solid #ced4da;
  padding: 4px 20px;
  z-index: 5;
  height: 35px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
:deep(.summary-content) {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 20px;
  font-size: 13px;
  font-weight: 850;
}
:deep(.w-income) {
  color: #28a745;
}
:deep(.w-expense) {
  color: #dc3545;
}

/* FullCalendar 내부 보정 */
:deep(.fc-daygrid-day-frame) {
  position: static !important;
}
:deep(.fc-daygrid-day-number) {
  text-decoration: none !important;
}
</style>
