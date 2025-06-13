import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Analysis from '../views/Analysis.vue'
import TestPDF from '../views/TestPDF.vue'
import TestPDFPreview from '../views/TestPDFPreview.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: '智能投标助手'
      }
    },
    {
      path: '/analysis/:taskId',
      name: 'analysis',
      component: Analysis,
      props: true,
      meta: {
        title: '分析结果'
      }
    },
    {
      path: '/test-pdf',
      name: 'test-pdf',
      component: TestPDF,
      meta: {
        title: 'PDF预览测试'
      }
    },
    {
      path: '/test-pdf-preview',
      name: 'test-pdf-preview',
      component: TestPDFPreview,
      meta: {
        title: 'PDF预览测试页面'
      }
    }
  ]
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router
