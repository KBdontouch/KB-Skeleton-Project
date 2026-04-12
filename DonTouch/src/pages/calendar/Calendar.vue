<template>
  <div class="calendar-container">
    <header class="calendar-header">
      <div class="month-selector-wrapper">

        <!-- 선택한 월 표시 -->
        <span class="year-month-display">
          {{ selectedYear }}년 {{ selectedMonth }}월
        </span>
        <!-- 미니 캘린더 팝업창
            -> 클릭 시 triggerPicker 함수 호출 
        -->
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

      <!-- 예산 데이터 불러오기 -->
      <div class="budget-center">
        예산 :
        <!-- currentBudget?.budget_money || 0.toLacaleString()
             - currentBudget? : currentBudget이 로드되지 않거나 null/undefined일 때 에러가 발생해서 화면이 멈추는 것을 방지.
             - || 0 : currentBudget 값이 null/undefined 일 경우, 화면에 0을 출력
             - .toLocaleString() : 숫자 데이터를 문자열로 변환 
        -->
        {{ (currentBudget?.budget_money || 0).toLocaleString() }}원
      </div>

      <!-- 총 지출/수입 데이터 불러오기 -->
      <div class="total-stats">
        <p>
          <b>총 지출 : </b>
          <span class="expense"
            >-{{
              // calendar.js 에서 monthlyStats 값(totalExpense) 불러오기
              calendarStore.monthlyStats.totalExpense.toLocaleString()
            }}원</span
          >
        </p>
        <p>
          <b>총 수입 : </b>
          <span class="income"
            >+{{
              // calendar.js 에서 monthlyStats 값(totalIncome) 불러오기
              calendarStore.monthlyStats.totalIncome.toLocaleString()
            }}원</span
          >
        </p>
      </div>
    </header>
    
    <!-- 거래 내역 추가 버튼 -->
    <div class ='button-container'>
      <!-- + 버튼 클릭 시 goToAddPage 함수를 통해 거래 내역 추가 페이지로 이동 -->
      <button class = 'add-transaction-btn' @click="goToAddPage">+</button>
    </div>

    <!-- 캘린더 화면 -->
    <div class="calendar-body-wrapper">
      <!-- 
      - ref="fullCalendar" : 캘린더 화면을 불러올 때 사용할 이름
      - :options="calendarOptions" : 캘린더의 모든 설정값을 이 이름으로...
      -->
      <FullCalendar ref="fullCalendar" :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
// 필요한 라이브러리 불러오기

// watch vs nextTick
// watch : 특정 데이터 변화 감지 및 대응 -> 데이터가 바뀌면 즉시
// nextTick : 화면 업데이트 완료 보장 -> 화면이 다 그려지면 이후
import { ref, computed, reactive, onMounted, nextTick, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useCalendarStore } from "@/stores/calendar";
import { useBudgetStore } from "@/stores/budget";
import { useRouter } from "vue-router";

const router = useRouter();
const budgetStore = useBudgetStore();
const calendarStore = useCalendarStore();
const fullCalendar = ref(null); // 초기값 null
const monthInputRef = ref(null); // 초기값 null

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.getMonth() + 1);

// 현재 캘린더의 월 예산 출력
const currentBudget = computed(() => {
  // !budgetStore.budget : 값 없으면 null 값 리턴
  if (!budgetStore.budget) return null;

  return budgetStore.budget.find((item) => {
    const itemDate = new Date(item.budget_date);
    return (
      // 현재 캘린더의 연도와 월 데이터와 예산의 연도와 월 데이터 일치 하는지 확인
      itemDate.getFullYear() === selectedYear.value &&
      itemDate.getMonth() + 1 === selectedMonth.value
    );
  }) || null;
});

// 서로 다른 데이터(숫자 & 문자열) 형식 연결 
const selectedMonthStr = computed({
  // padStart : 월이 한자리 수 일때 앞에 0을 붙여 두자리 수로 통일
  get: () => `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}`,
  // 문자열 -> 숫자로 변환
  set: (val) => {
    if (!val) return;
    // -(하이푼) 기준으로 연도와 월 분리
    const [y, m] = val.split("-");
    // parseInt() : 문자열 -> 숫자로 변환 후 selected.value에 저장
    selectedYear.value = parseInt(y);
    selectedMonth.value = parseInt(m);
    // calendar.js에 있는 바뀐 데이터 전달
    calendarStore.setCurrentDate(parseInt(y), parseInt(m));
  },
});

// selectedYear / selectedMonth 둘 중 하나라도 바뀌면 실행
watch([selectedYear, selectedMonth], async () => {
  
  // budget.js 에 있는 Year & Month 값 동기화
  budgetStore.activeYear = selectedYear.value;
  budgetStore.activeMonth = selectedMonth.value;

  await budgetStore.fetchDate();
  
  // nextTick : 캘린더 화면 그리기 전까지 기다리는
  // 300ms(0.3초) 대기
  // updateWeeklySummary : 요약 함수 불러오기
  nextTick(() => setTimeout(updateWeeklySummary, 300));
});

// 미니 캘린더 팝업 창에서 월 이동시 데이터 전달 해주는 함수
const handleMonthChange = () => {
  if (fullCalendar.value) { // fullCalendar가 불러졌을때만 실행
    const calendarApi = fullCalendar.value.getApi(); // fullCalendar 불러오기
    // target 문자열 생성
    // FullCalendar 날짜 형식 맞추기
    const target = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}-01`;
    // 이동할 월 로 페이지 이동
    calendarApi.gotoDate(target);
  }
};

// 거래 내역 추가 버튼 클릭 시 거래 내역 추가 페이지로 이동
const goToAddPage = () => {
  router.push('/transaction/add');
};

// ▼ 화살표 클릭 시 실행되는 함수
const triggerPicker = () => {
  // 미니 캘린더 팝업창 불러오기
  if (monthInputRef.value) monthInputRef.value.showPicker();
};

// calendar.js에 있는 dailyData 함수 가져오기
// || {} : 데이터 없으면 null 값이 아닌 빈 객체 전달하여 오류 방지
const dailyData = computed(() => calendarStore.dailyTotals || {});

//
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
  await Promise.all([
    calendarStore.fetchHistory(),
    budgetStore.initBudget()
  ]);

  await nextTick();

  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    
    calendarApi.render(); 
    
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

.button-container {
  position: relative;
  height: 50px;
  width: 100%;
  background-color: white;
}

.add-transaction-btn {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  
  width: 28px;
  height: 28px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  background-color: #fbd14b;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  
  font-size: 18px;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.add-transaction-btn:hover {
  background-color: #f9c21a;
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
