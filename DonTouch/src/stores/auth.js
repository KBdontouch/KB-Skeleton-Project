import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  // 초기값은 로컬 스토리지에서 가져오거나 null
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);
  const token = ref(localStorage.getItem("token") || null);

  const isLoggedIn = computed(() => !!user.value);

  const login = (userData, userToken) => {
    user.value = userData;
    token.value = userToken;

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    user.value = null;
    token.value = null;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // 컴포넌트에서 사용할 수 있도록 반환
  return { user, token, isLoggedIn, login, logout };
});
