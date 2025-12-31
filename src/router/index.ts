import { createRouter, createWebHistory } from 'vue-router'
import TodoList from '../components/TodoList.vue'
import EditTodo from '../views/EditTodo.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: TodoList },
    { path: '/edit/:id', component: EditTodo, props: true }
  ]
})

export default router