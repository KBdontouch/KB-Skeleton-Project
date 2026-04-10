import SideBar from '@/components/SideBar.vue';
import Budget from '@/pages/budget/Budget.vue';
import Calendar from '@/pages/calendar/Calendar.vue';
import TransactionList from '@/pages/calendar/TransactionList.vue';
import Main from '@/pages/main/Main.vue';
import Join from '@/pages/user/Join.vue';
import Login from '@/pages/user/Login.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Login,
    },
    {
      path: '/main',
      components: {
        default: Main,
        side: SideBar,
      },
    },
    {
      path: '/budget',
      components: {
        default: Budget,
        side: SideBar,
      },
    },
    {
      path: '/calendar',
      components: {
        default: Calendar,
        side: SideBar,
      },
    },
    {
      path: '/transaction',
      components: {
        default: TransactionList,
        side: SideBar,
      },
    },
    {
      path: '/join',
      component: Join,
    },
  ],
});

export default router;
