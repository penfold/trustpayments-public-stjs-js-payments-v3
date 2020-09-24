import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import PaymentDetails from '../views/PaymentDetails.vue';
import ContactData from '../views/ContactData.vue';
import PersonalData from '../views/PersonalData.vue';
import Payment from '../views/Payment.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/payment-details',
    name: 'Payment Details',
    component: PaymentDetails,
  },
  {
    path: '/personal-data',
    name: 'Personal Data',
    component: PersonalData,
  },
  {
    path: '/contact-data',
    name: 'Contact Data',
    component: ContactData,
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
