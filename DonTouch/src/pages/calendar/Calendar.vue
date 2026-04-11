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
        {{ (currentBudget?.budget_money || 0).toLocaleString() }}원
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
    <!-- 수정함 -->
    <div class ='button-container'>
      <button class = 'add-transaction-btn' @click="goToAddPage">+</button>
    </div>

    <div class="calendar-body-wrapper">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useCalendarStore } from "@/stores/calendar";
import { useBudgetStore } from "@/stores/budget";
import { useRouter } from "vue-router";

// 1. 기초 도구 및 스토어 초기화 (최상단)
const router = useRouter();
const budgetStore = useBudgetStore();
const calendarStore = useCalendarStore();
const fullCalendar = ref(null);
const monthInputRef = ref(null);

// 2. 핵심 상태 변수 (이 변수들이 computed보다 위에 있어야 함)
const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1);

// 3. 예산 관련 computed 로직
const currentBudget = computed(() => {
  if (!budgetStore.budget) return null;
  return budgetStore.budget.find((item) => {
    const itemDate = new Date(item.budget_date);
    return (
      itemDate.getFullYear() === selectedYear.value &&
      itemDate.getMonth() + 1 === selectedMonth.value
    );
  }) || null;
});

// 4. 날짜 입력창(input type="month")과 연결된 computed
const selectedMonthStr = computed({
  get: () => `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}`,
  set: (val) => {
    if (!val) return;
    const [y, m] = val.split("-");
    selectedYear.value = parseInt(y);
    selectedMonth.value = parseInt(m);
    calendarStore.setCurrentDate(parseInt(y), parseInt(m));
  },
});

// 5. 감시자(watch) 및 로직들
watch([selectedYear, selectedMonth], async () => {
  // 예산 스토어 동기화
  budgetStore.activeYear = selectedYear.value;
  budgetStore.activeMonth = selectedMonth.value;
  await budgetStore.fetchDate();
  
  // 캘린더 데이터 다시 계산 (주별 요약 포함)
  nextTick(() => setTimeout(updateWeeklySummary, 300));
});

// [추가] 달력 날짜 변경 시 동작
const handleMonthChange = () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    const target = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}-01`;
    calendarApi.gotoDate(target);
  }
};

const goToAddPage = () => {
  router.push('/transaction/add');
};

const triggerPicker = () => {
  if (monthInputRef.value) monthInputRef.value.showPicker();
};

// [로직] 주별 요약 (기존 코드 유지)
const dailyData = computed(() => calendarStore.dailyTotals || {});

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
      if (parseInt(dateStr.split("-")[1]) === currentViewMonth) hasCurrentMonthDay = true;
      if (dailyData.value[dateStr]) {
        weeklyExpense += dailyData.value[dateStr].expense || 0;
        weeklyIncome += dailyData.value[dateStr].income || 0;
      }
    }

    if (hasCurrentMonthDay) {
      const summaryBar = document.createElement("div");
      summaryBar.className = "weekly-summary-bar";
      let htmlContent = `<div class="summary-content">`;
      if (weeklyIncome > 0) htmlContent += `<span class="w-income">+ ${weeklyIncome.toLocaleString()}원</span>`;
      if (weeklyExpense > 0) htmlContent += `<span class="w-expense">- ${weeklyExpense.toLocaleString()}원</span>`;
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

// --- [FullCalendar 설정] ---
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
    const dayNum = arg.dayNumberText.replace("일", "");

    let html = `<div class='day-cell'>
                  <div class='day-header'>
                    <span class='day-number ${sundayClass}'>${dayNum}</span>
                  </div>`;
    if (data) {
      if (data.expense > 0) html += `<p class='daily-expense'>-${data.expense.toLocaleString()}</p>`;
      if (data.income > 0) html += `<p class='daily-income'>+${data.income.toLocaleString()}</p>`;
    }
    html += `</div>`;
    return { html };
  },
  datesSet: (info) => {
    const currentStart = info.view.currentStart;
    selectedYear.value = currentStart.getFullYear();
    selectedMonth.value = currentStart.getMonth() + 1;
    calendarStore.setCurrentDate(selectedYear.value, selectedMonth.value);
    nextTick(() => setTimeout(updateWeeklySummary, 300));
  },
});

onMounted(async () => {
  // 1. 필요한 데이터를 모두 불러올 때까지 대기
  await Promise.all([
    calendarStore.fetchHistory(),
    budgetStore.initBudget()
  ]);

  // 2. 데이터가 스토어에 담긴 후, DOM이 업데이트될 때까지 대기
  await nextTick();

  // 3. 캘린더 API를 사용하여 강제로 다시 그리기
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    
    // 캘린더 내부 상태를 새로고침하여 dayCellContent가 다시 실행되도록 함
    calendarApi.render(); 
    
    // 4. 데이터 로드 후 주별 요약 바를 그리기 위해 약간의 지연 후 실행
    // (FullCalendar의 내부 렌더링 속도에 맞추기 위함)
    setTimeout(updateWeeklySummary, 300);
  }
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
  margin-bottom: 5px;
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

/* 수정함 */
.button-container {
  position: relative;
  height: 50px;
  width: 100%;
  background-color: white;
}

.add-transaction-btn {
  position: absolute;
  top: 50%;
  right: 15px; /* 우측 끝에서 살짝 띄움 */
  transform: translateY(-50%); /* 세로 중앙 정렬 */
  
  width: 28px;
  height: 28px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  background-color: #fbd14b; /* 프로젝트 메인 컬러 */
  border: none;
  border-radius: 50%;
  cursor: pointer;
  
  font-size: 18px;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.add-transaction-btn:hover {
  background-color: #f9c21a; /* 호버 시 약간 진하게 */
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
