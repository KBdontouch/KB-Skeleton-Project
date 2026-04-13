import SideBar from '@/components/SideBar.vue';
import Budget from '@/pages/budget/Budget.vue';
import Calendar from '@/pages/calendar/Calendar.vue';
import TransactionDetail from '@/pages/calendar/TransactionDetail.vue';
import TransactionEdit from '@/pages/calendar/TransactionEdit.vue';
import TransactionList from '@/pages/calendar/TransactionList.vue';
import Main from '@/pages/main/Main.vue';
import Join from '@/pages/user/Join.vue';
import Login from '@/pages/user/Login.vue';
import MyPage from '@/pages/user/MyPage.vue';

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Login,
    },
    {
      path: '/join',
      component: Join,
    },
    {
      path: '/mypage',
      components: {
        default: MyPage,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/main',
      components: {
        default: Main,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/budget',
      components: {
        default: Budget,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/calendar',
      components: {
        default: Calendar,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/transaction',
      components: {
        default: TransactionList,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/transaction/add',
      components: {
        default: TransactionDetail,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/transaction/edit/:id',
      components: {
        default: TransactionEdit,
        side: SideBar,
      },
      meta: { requiresAuth: true },
    },
  ],
});

// 라우터 네비게이션 가드: 로그인 여부 확인
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // requiresAuth 메타 태그가 있는 경로와 로그인 상태 확인
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 로그인하지 않았으면 로그인 페이지로 리다이렉트
    next('/');
  } else if (to.path === '/' && authStore.isLoggedIn) {
    // 이미 로그인한 경우 로그인 페이지 접근 시 메인 페이지로 리다이렉트
    next('/main');
  } else {
    next();
  }
});

export default router;
