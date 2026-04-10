<template>
  <div class="login-wrapper">
    <div class="login-logo">
      <div class="logo-img-box">로고 이미지</div>
      <div class="logo-text">DON Touch</div>
    </div>
    <div class="login-box">
      <div class="input-group">
        <input v-model="loginData.id" type="text" placeholder="아이디" />
        <input
          v-model="loginData.password"
          type="password"
          placeholder="비밀번호"
        />
        <button @click="handleLogin">Login</button>
        <router-link to="/join">
          <button>회원가입</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const authStore = useAuthStore();

// 로그인 데이터
const loginData = reactive({
  id: '',
  password: '',
});

// id, pw 중 하나라도 없으면 알림창
const handleLogin = async () => {
  if (!loginData.id || !loginData.password) {
    alert('빈칸 입력하세요');
  }

  const infoUser = await axios.get('/api/user');

  // db에 있는 id,pw 일치하는지 확인
  const user = infoUser.data.find((u) => {
    return u.user_id === loginData.id && u.user_pw === loginData.password;
  });

  // 유저 데이터 있으면 로그인 되고 , 없으면 로그인 안되게
  if (user) {
    const token = `token_${Date.now()}_${user.user_id}`;
    authStore.login(user, token);

    // 로그인 성공 시 로직
    alert(`${user.id}님, 안녕하세요!`);
    router.push('/main');
  } else {
    // 로그인 실패 시 로직
    alert('아이디 또는 비밀번호가 일치하지 않습니다.');
  }
};
</script>

<style scoped></style>
