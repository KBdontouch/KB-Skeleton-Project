<template>
  <nav class="sidebar">
    <router-link to="/main" class="logo-link">
      <div class="logo-label">DonTouch</div>
      <div class="logo">
        <img
          src="@/assets/image/Logo.png"
          alt="로고 이미지"
          style="width: 100px; height: 100px"
        />
      </div>
    </router-link>

    <div class="menu">
      <div><router-link to="/calendar">캘린더</router-link></div>
      <div><router-link to="/transaction">거래내역조회</router-link></div>
      <div><router-link to="/budget">예산</router-link></div>
    </div>

    <div class="userpage">
      <div><router-link to="/mypage">마이페이지</router-link></div>
      <div class="logout" @click="logout" style="">로그아웃</div>
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

  margin-bottom: 30px;
  /* background-color: greenyellow; */
}
.logo-label {
  margin-top: 30px;
  color: #0d0d0d;
  font-weight: bolder;
  display: flex;
  justify-content: center;
  /* background-color: red; */
}
.userpage {
  background-color: #f29f05;
}

/* ★ 수정 포인트: .sidebar a 대신 .menu a, .userpage a를 사용하여 로고 링크를 제외합니다 */
.menu a,
.userpage a,
.logout {
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
.userpage a:hover,
.logout:hover {
  background-color: #f27b35;
  cursor: pointer;
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
