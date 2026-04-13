<template>
  <div class="page">
    <div class="main-container">
      <div class="header">마이페이지</div>
      <div class="mypage-wrapper">
        <div>개인정보 수정</div>
        <div class="input-row">
          <div class="form-item">
            <div>이름</div>
            <input
              type="text"
              v-model="editData.user_name"
              placeholder="이름"
            />
          </div>
          <div class="form-item">
            <div>아이디</div>
            <input
              class="readonly-input"
              type="text"
              v-model="editData.user_id"
              @input="isIdAvailable = false"
              placeholder="아이디"
              readonly
            />
          </div>
        </div>
        <div class="input-row">
          <div class="form-item">
            <div>이메일</div>
            <input
              class="readonly-input"
              type="email"
              v-model="editData.user_email"
              placeholder="이메일"
              readonly
            />
          </div>
        </div>
        <div class="input-row">
          <div class="form-item">
            <div>전화번호</div>
            <input
              type="tel"
              v-model="editData.user_phone"
              placeholder="010-1234-5678"
            />
          </div>
        </div>
        <div class="password-row">
          <div class="password-field">
            <div>비밀번호 확인 :</div>
            <div class="input-confirm">
              <input
                type="password"
                v-model="passwordConfirm"
                placeholder="비밀번호 확인"
              />
            </div>
          </div>
          <button class="edit-btn" @click="infoEdit">수정</button>
        </div>
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
      </div>
    </div>
  </div>
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

<style scoped>
/*페이지 요소 전체 중앙정렬*/
.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.main-container {
  width: fit-content;
  display: flex;
  flex-direction: column; /* 제목과 아래 내용을 세로로 배치 */
  align-items: flex-start; /*자식 요소(제목)를 왼쪽 끝으로 밀착 */
}

/* 전체 컨테이너 배경 및 폰트 설정 */
.mypage-wrapper {
  background-color: #f2f2f2;
  width: 800px;
  height: auto;
  padding: 25px 50px;
  margin: 0 auto;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}

/* 상단 '회원가입' 타이틀 */
.header {
  width: 900px;
  margin: 15px 0 20px 100px;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.input-row {
  display: flex;
  gap: 20px; /* 항목 사이 간격 */
  width: 100%;
}

/* 비밀번호 입력, 버튼을 가로 배치 */
.password-row {
  width: 100%;
  align-items: flex-end;
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.password-field {
  flex: 1; /* 비밀번호 입력창이 남은 공간을 차지 */
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-confirm {
  width: 100%;
  display: flex;
  gap: 20px; /* 항목 사이 간격 */
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

/* 입력창 공통 스타일 */
input {
  width: 100%;
  padding: 12px 18px;
  font-size: 16px;
  border: none;
  border-radius: 20px;
  background-color: #d9d9d9;
  box-sizing: border-box;
}

.readonly-input {
  color: #999; /* 회색 처리 */
  cursor: not-allowed;
}

.input-container input {
  flex: 1;
}

/* 비밀번호 일치 메시지 */
.success-msg {
  color: #28a745;
  font-size: 20px;
  width: 100%;
  text-align: right;
  margin-top: -10px;
}

.error-msg {
  color: #ff0000;
  font-size: 20px;
  width: 100%;
  text-align: right;
  margin-top: -10px;
}

/* 수정하기 버튼 */
.edit-btn {
  width: 120px;
  height: 45px;
  display: flex;
  align-items: center; /* 수직(상하) 중앙 정렬 */
  justify-content: center;
  margin: 0;
  padding: 12px;
  background-color: #d9d9d9;
  border: none;
  border-radius: 20px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
