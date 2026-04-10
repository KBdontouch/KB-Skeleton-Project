<template>
  <nav class="sidebar">
    <div class="logo">
      <router-link to="/main" class="logo-link">
        <img src="https://placehold.co/100x100/png" alt="로고 이미지" />
      </router-link>
    </div>

    <div class="menu">
      <div><router-link to="/calendar">캘린더</router-link></div>
      <div><router-link to="/transaction">거래내역조회</router-link></div>
      <div><router-link to="/budget">예산</router-link></div>
    </div>

    <div class="userpage">
      <div><router-link to="/mypage">마이페이지</router-link></div>
      <div @click="logout">로그아웃</div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const authStore = useAuthStore();
const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
/* 사이드바 기본 레이아웃 */
.sidebar {
  height: 100vh;
  width: 150px;
  display: flex;
  flex-direction: column;
  background-color: #f2b705;
}

.logo {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
}
.userpage {
  background-color: #f29f05;
}

/* ★ 수정 포인트: .sidebar a 대신 .menu a, .userpage a를 사용하여 로고 링크를 제외합니다 */
.menu a,
.userpage a {
  display: block;
  padding: 15px 20px;
  color: #f2f2f2;
  text-decoration: none;
  text-align: left;
  transition: background-color 0.2s;
}

/* 활성화 시 배경색 변경 (메뉴와 마이페이지 링크에만 적용) */
.menu a.router-link-active,
.userpage a.router-link-active {
  background-color: #629d9e;
  font-weight: bold;
}

/* 마우스 호버 효과 (메뉴와 마이페이지 링크에만 적용) */
.menu a:hover,
.userpage a:hover {
  background-color: #f27b35;
}

/* 로고 링크 전용 스타일: 배경색이나 패딩이 들어가지 않도록 별도 관리 */
.logo-link {
  display: inline-block;
  text-decoration: none;
}

.userpage {
  margin-top: auto;
  padding-bottom: 30px;
}
</style>
