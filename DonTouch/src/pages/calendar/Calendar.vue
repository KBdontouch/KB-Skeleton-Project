<!-- FullCalendar 패키지 설치
     (bash) npm install @fullcalendar/vue3 @fullcalendar/daygrid
-->

<template>
  <div class="calendar-container">
    <header class="calendar-header">
      <!-- 월 이동하는... -->
      <div class="month-selector"></div>

      <!-- 예산, 총 지출, 총 수입 영역 -->

      <!-- <input type="month" /> -->
      <div class="budget-center">예산 : {{ budget }}원</div>

      <div class="total-stats">
        <p>
          총 지출 : <span class="expense"> {{ totalExpense }}원 </span>
        </p>
        <p>
          총 수입 : <span class="income"> {{ totalIncome }}원 </span>
        </p>
      </div>
    </header>

    <FullCalendar ref="fullCalendar" :options="calendarOptions">
      <template #dayCellContent="arg">
        <div class="day-cell" @click="goToDetail(arg.date)">
          <span class="day-number"> {{ arg.dayNumberText }}</span>

          <div v-if="getDayDate(arg.date)" class="day-amount">
            <p class="daily-expense" v-if="getDayDate(arg.date).expense">
              - {{ getDayDate(arg.date).expense.toLocaleString() }}
            </p>
          </div>
        </div>
      </template>
    </FullCalendar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useTransactionStore } from "@/stores/transaction";

const router = useRouter();
const fullCalendar = ref(null);

const budget = ref(0);
const totalExpense = computed(() => transactionStore.totalExpense || 0);
const totalIncome = computed(() => transactionStore.totalIncome || 0);

const transactionStore = useTransactionStore();

// 캘린더 옵션 설정
const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  locale: "ko",
  headerToolbar: false, // 기본 헤드 비활성화
  height: "auto",
});

// 컴포넌트가 마운트될 때 실제 데이터 불러오기
onMounted(() => {
  transactionStore.fetchHistory();
});

// Store의 getters를 통해 가공된 데이터를 가져옴
const dailyData = computed(() => transactionStore.dailyTotals);

// 특정 날짜의 데이터를 찾는 함수 수정
const getDayDate = (date) => {
  // FullCalendar 날짜를 YYYY-MM-DD 형식으로 변환

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  return dailyData.value[dateStr]; // 해당 날짜의 {extense, income} 반환
};

// 월 변경 시 캘린더 이동
const handleMonthChange = () => {
  const calendarApi = fullCalendar.value.getApi();
  calendarApi.gotoDate(selectedMonth.value);
};

const goToDetail = (date) => {
  const dateStr = date.toISOString().split("T")[0];
  router.push({ name: "TransactionDetail", query: { date: dateStr } });
};
</script>

<style scoped>
.calendar-container {
  padding: 20px;
  background-color: #f9f9f9;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #d1d1d1;
  padding: 15px;
  margin-bottom: 20px;
}

.calendar-header > div {
  flex: 1;
}

.budget-wrapper {
  text-align: center;
}

.total_stats {
  text-align: right;
}

.day-cell {
  height: 100px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
}

.daily-expense {
  font-size: 0.8rem;
  color: #ff4d4d;
  text-align: right;
}

/* 주차별 요약 바를 위한 스타일 예시 (FullCalendar 내부 클래스 활용) */
/* :deep(.fc-daygrid-day-events) { */
/* 라이브러리 내부 구조에 맞춰 주차별 요약 위치 조정 필요 */
/* } */
</style>
