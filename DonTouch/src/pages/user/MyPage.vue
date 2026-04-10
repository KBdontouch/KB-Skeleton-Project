<template>
  <div class="mypage-wrapper">
    <div>마이페이지</div>
    <div>가입정보 수정</div>
    <div>이름</div>
    <input type="text" v-model="editData.user_name" placeholder="이름" />
    <div id="checkedid">
      <div>아이디</div>
      <div class="input-container">
        <input
          type="text"
          v-model="editData.user_id"
          @input="isIdAvailable = false"
          placeholder="아이디"
          readonly
        />
      </div>
    </div>
    <div>이메일</div>
    <input
      type="email"
      v-model="editData.user_email"
      placeholder="이메일"
      readonly
    />
    <div>전화번호</div>
    <input
      type="tel"
      v-model="editData.user_phone"
      placeholder="010-1234-5678"
    />
  </div>
  <div>비밀번호 확인 :</div>
  <input
    type="password"
    v-model="passwordConfirm"
    placeholder="비밀번호 확인"
  />
  <p
    v-if="passwordConfirm"
    :class="isPasswordMatch ? 'success-msg' : 'error-msg'"
  >
    {{
      isPasswordMatch
        ? '비밀번호가 일치합니다.'
        : '비밀번호가 일치하지 않습니다.'
    }}
  </p>
  <button @click="infoEdit">수정</button>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const editData = reactive(authStore.user);
console.log(editData);

const passwordConfirm = ref('');

// 비밀번호 일치 여부
const isPasswordMatch = computed(() => {
  return editData.user_pw === passwordConfirm.value;
});

const infoEdit = async () => {
  // 비밀번호 확인이 틀리면 중단
  if (!isPasswordMatch.value) {
    alert('비밀번호가 틀립니다. 다시 확인해주세요.');
    return;
  }
  const respones = await axios.put('/api/user/' + editData.id, editData);
  console.log(respones);

  // 수정 완료 후 메일으로 이동
  router.push('/main');
};
</script>

<style scoped></style>
