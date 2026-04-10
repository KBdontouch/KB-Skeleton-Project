<template>
  <div class="calendar-container">
    <header class="calendar-header">
      <div class="month-selector-wrapper">
        <span class="year-month-display">
          {{ selectedYear }}년 {{ selectedMonth }}월
        </span>
        <div class="input-wrapper" @click="triggerPicker">
          <input
            type="month"
            ref="monthInputRef"
            v-model="selectedMonthStr"
            @change="handleMonthChange"
            class="real-month-input"
          />
          <span class="arrow-icon">▼</span>
        </div>
      </div>

      <div class="budget-center">
        예산 :
        {{ (budgetStore.activeBudget?.budget_money || 0).toLocaleString() }}원
      </div>

      <div class="total-stats">
        <p>
          <b>총 지출 : </b>
          <span class="expense"
            >-{{
              calendarStore.monthlyStats.totalExpense.toLocaleString()
            }}원</span
          >
        </p>
        <p>
          <b>총 수입 : </b>
          <span class="income"
            >+{{
              calendarStore.monthlyStats.totalIncome.toLocaleString()
            }}원</span
          >
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
// interactionPlugin과 useRouter는 요청하신 대로 제거했습니다.
import { useCalendarStore } from "@/stores/calendar";
import { useBudgetStore } from "@/stores/budget";

// 예산 데이터 불러오기
const budgetStore = useBudgetStore();

const fullCalendar = ref(null);
const monthInputRef = ref(null);
const calendarStore = useCalendarStore();

// --- [초기값 및 상태] ---
const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1);

// [연동] calendar.js에서 가공한 날짜별 합계 데이터
const dailyData = computed(() => calendarStore.dailyTotals || {});

const triggerPicker = () => {
  if (monthInputRef.value) monthInputRef.value.showPicker();
};

const selectedMonthStr = computed({
  get: () =>
    `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}`,
  set: (val) => {
    if (!val) return;
    const [y, m] = val.split("-");
    selectedYear.value = parseInt(y);
    selectedMonth.value = parseInt(m);
    // 스토어에 현재 보고 있는 날짜 알려주기
    calendarStore.setCurrentDate(parseInt(y), parseInt(m));
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

// --- [로직] 주별 요약 (기존 유지) ---
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

      // [연동] 스토어의 dailyData에서 주간 합계 계산
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
        if (frame) frame.appendChild(summaryBar);
      }
    }
  }
};

// 데이터나 날짜가 바뀌면 주별 요약 다시 계산
watch(
  [dailyData, selectedMonth, selectedYear],
  () => {
    nextTick(() => setTimeout(updateWeeklySummary, 300));
  },
  { deep: true },
);

// --- [설정] FullCalendar ---
const calendarOptions = reactive({
  plugins: [dayGridPlugin], // interaction 제거
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

    // [연동] 스토어의 날짜별 상자에서 데이터 꺼내기
    const data = dailyData.value[dateStr];
    const isSunday = arg.date.getDay() === 0;
    const sundayClass = isSunday ? "is-sunday" : "";
    const dayNum = arg.dayNumberText.replace("일", "");

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
  datesSet: (info) => {
    const currentStart = info.view.currentStart;
    const y = currentStart.getFullYear();
    const m = currentStart.getMonth() + 1;
    selectedYear.value = y;
    selectedMonth.value = m;

    // 스토어 상태 업데이트
    calendarStore.setCurrentDate(y, m);
    nextTick(() => setTimeout(updateWeeklySummary, 300));
  },
});

onMounted(async () => {
  // [연동] 페이지 로드 시 데이터 불러오기
  await calendarStore.fetchHistory();
  await budgetStore.initBudget();
});
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  background-color: #f9f9f9;
  /* 하이 */
  overflow-x: hidden;
  overflow-y: auto;
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
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer !important;
  z-index: 10;
}
.real-month-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  opacity: 0;
  pointer-events: none;
}
.arrow-icon {
  font-size: 0.9rem;
  color: #555;
  pointer-events: none;
}
.budget-center {
  flex: 1;
  text-align: center;
  font-size: 28px;
  font-weight: bold;
}
.total-stats {
  flex: 1;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0px;
  font-size: 18px;
}

.total-stats p {
  margin: 0;
}

.expense {
  color: #dc3545;
  font-size: 18px;
  font-weight: bold;
}
.income {
  color: #28a745;
  font-size: 18px;
  font-weight: bold;
}

:deep(.day-header) {
  display: flex;
  justify-content: flex-end;
  top: 45px;
  left: 10px;
  z-index: 10;
}
:deep(.day-number) {
  color: #333 !important;
  font-weight: bold !important;
  text-decoration: none !important;
  font-size: 16px;
  font-weight: bold;
}
:deep(.day-number.is-sunday) {
  color: #dc3545 !important;
}
:deep(.fc-col-header-cell) {
  background-color: #fff;
  z-index: 10;
  position: relative;
  border-bottom: 1px solid #000 !important;
}
:deep(.fc-col-header-cell-cushion) {
  text-decoration: none !important;
  color: #000 !important;
}
:deep(.fc-day-sun .fc-col-header-cell-cushion) {
  color: #dc3545 !important;
}
:deep(.day-cell) {
  min-height: 120px;
  padding: 45px 5px 5px 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
:deep(.fc-day-other .day-number) {
  opacity: 0.5;
}
:deep(.daily-expense) {
  font-size: 14px;
  color: #dc3545;
  text-align: right;
  margin: 2px 0;
  line-height: 1.4;
}
:deep(.daily-income) {
  font-size: 14px;
  color: #28a745;
  text-align: right;
  margin: 2px 0;
  line-height: 1.4;
}
:deep(.fc-daygrid-body tr) {
  position: relative !important;
}
:deep(.weekly-summary-bar) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #e9ecef;
  border-top: 1px solid #ced4da;
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
  font-size: 18px;
  font-weight: 850;
}
:deep(.w-income) {
  color: #28a745;
}
:deep(.w-expense) {
  color: #dc3545;
}
:deep(.fc-daygrid-day-frame) {
  position: static !important;
}
:deep(.fc-daygrid-day-number) {
  text-decoration: none !important;
}
</style>
