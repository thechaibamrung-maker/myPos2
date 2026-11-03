import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Login', component: LoginView },
    { path: '/hr', name: 'HR', component: () => import('../views/HrDashboard.vue') },
    { path: '/evaluator', name: 'Evaluator', component: () => import('../views/EvaluatorView.vue') },
    { path: '/evaluatee', name: 'Evaluatee', component: () => import('../views/EvaluateeView.vue') }
  ]
})

// ป้องกันการเข้าหน้าอื่นถ้ายังไม่ได้ Login
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.name !== 'Login' && !token) next({ name: 'Login' })
  else next()
})

export default router