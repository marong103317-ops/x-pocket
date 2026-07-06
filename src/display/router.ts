// Router for display page
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/display/views/HomeView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/display/views/SettingsView.vue'),
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('@/display/views/TagsView.vue'),
    },
  ],
})

export default router
