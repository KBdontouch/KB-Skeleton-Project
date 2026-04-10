<script setup>
import Footer from './components/Footer.vue';
</script>
<template>
  <div class="app-container">
    <!-- 사이드바 -->
    <RouterView name="side"></RouterView>
    <!-- 컴포넌트 자리 -->
    <div class="main-wrapper">
      <div class="main">
        <RouterView />
      </div>
      <!-- 하단 -->
      <div class="footer">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.app-container {
  display: flex; /* 사이드바와 메인 영역을 가로로 배치 */
  /* 화면 크기 고정 */
  width: 100vw;
  height: 100vh;
  /* 브라우저 스크롤 금지 */
  overflow: hidden;
}

.sidebar {
  width: 150px;
  flex-shrink: 0; /* 사이드바 크기 고정 */
}
/* main-footer 배치 */
.main-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column; /**위 아래 배치 */
  height: 100%;
  overflow: hidden;
}
/* 메인 영역 (RouterView) */
.main {
  flex-grow: 1; /* 남은 공간을 모두 차지 */
  overflow: hidden;
  display: flex;
  flex-direction: column; /* 내부 요소들을 세로로 정렬 */
  position: relative;
  padding-bottom: 60px; /* 푸터 높이만큼 여백 확보 (푸터가 겹치지 않게) */
}

/* 푸터 */
.footer {
  flex-shrink: 0; /* 내용 상관없이 바닥에 고정 */
  bottom: 0; /* 바닥에서 30px 띄움 */
  left: 150px; /* 사이드바 너비만큼 왼쪽 여백 (중요!) */
  right: 0; /* 오른쪽 끝까지 확장 */

  padding-bottom: 15px;

  display: flex;
  justify-content: center;
  align-items: center;

  /* 확인용 스타일 */
  /* background-color: red;
  z-index: 100; */
}
</style>
