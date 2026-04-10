<template>
  <div class="join-wrapper">
    <div>회원가입</div>
    <div>이름</div>
    <input type="text" v-model="joinData.user_name" placeholder="이름" />
    <div id="checkedid">
      <div>아이디</div>
      <div class="input-container">
        <input
          type="text"
          v-model="joinData.user_id"
          @input="isIdAvailable = false"
          placeholder="아이디"
        />
        <span v-if="isIdAvailable" class="v-icon">V</span>
        <button @click="checkedId">중복확인</button>
      </div>
    </div>
    <div>비밀번호</div>
    <input type="password" v-model="joinData.user_pw" placeholder="비밀번호" />
    <div>비밀번호 확인</div>
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
    <div>이메일</div>
    <input type="email" v-model="joinData.user_email" placeholder="이메일" />
    <div>전화번호</div>
    <input
      type="tel"
      v-model="joinData.user_phone"
      placeholder="010-1234-5678"
    />
  </div>
  <button @click="newJoin">가입하기</button>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import router from '@/router';
const joinData = reactive({
  id: 0,
  user_id: '',
  user_pw: '',
  user_name: '',
  user_email: '',
  user_phone: '',
  user_state: 0,
});
const passwordConfirm = ref('');

// 아이디 중복 확인
const isIdAvailable = ref(false);

// 비밀번호 일치 여부
const isPasswordMatch = computed(() => {
  return joinData.user_pw === passwordConfirm.value;
});
const checkedId = async () => {
  // axios 통신을 위해 async 추가
  if (!joinData.user_id) {
    alert('아이디를 입력해주세요.');
    return;
  }

  try {
    const infoUser = await axios.get('/api/user');

    // 입력한 아이디가 이미 존재하는지 확인
    const matchUser = infoUser.data.find((u) => u.user_id === joinData.user_id);

    // 중복 여부
    if (!matchUser) {
      alert('아이디 사용 가능!');
      isIdAvailable.value = true; // V 표시 나타남
    } else {
      alert('중복된 아이디가 있습니다. 다시 설정해주세요.');
      isIdAvailable.value = false; // V 표시 안 나타남
    }
  } catch (e) {
    console.e('데이터를 가져오는 중 오류 발생:', e);
    alert('오류가 발생했습니다.');
  }
};
const newJoin = async () => {
  // 항목 누락 체크
  const labels = {
    user_name: '이름',
    user_id: '아이디',
    user_pw: '비밀번호',
    user_email: '이메일',
    user_phone: '전화번호',
  };

  // 항목을 하나씩 돌면서 비어있는지 확인
  for (const key in labels) {
    if (!joinData[key]) {
      alert(`${labels[key]}을(를) 작성해 주세요!`);
      return; // 함수 종료
    }
  }

  // 아이디 중복 확인 여부
  if (!isIdAvailable.value) {
    alert('아이디 중복확인을 진행해 주세요!');
    return;
  }

  // 비밀번호 일치 여부
  if (!isPasswordMatch.value) {
    alert('비밀번호 확인이 일치하지 않습니다.');
    return;
  }

  const infoUser = await axios.get('/api/user');
  const increaseId = parseInt(infoUser.data[infoUser.data.length - 1].id) + 1;
  joinData.id = increaseId;

  // 서버로 데이터 전송
  const respones = await axios.post('/api/user', joinData);
  console.log(respones.data);

  // 모든 검사 통과 시 성공 알림
  alert('회원가입이 완료되었습니다.\n다시 로그인해주세요.');

  // 가입 완료 후 로그인 페이지로 이동
  router.push('/');
};
</script>

<style scoped>
.v-icon {
  margin-right: 8px; /* V와 버튼 사이의 간격 */
  color: #28a745; /* 체크 표시색 */
  font-weight: bold;
}
</style>
