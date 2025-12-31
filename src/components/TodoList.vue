<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

// 检查当前用户
const user = ref<any>(null)

async function checkUser() {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
  console.log('Current user:', user.value)
}

interface Todo {
  id: number
  user_id: string
  task: string
  is_complete: boolean
  is_starred: boolean
  sort: number
  description?: string
  inserted_at: string
  start_time?: string
  estimated_end_time?: string
  actual_end_time?: string
}

const todos = ref<Todo[]>([])
const newTask = ref('')
const loading = ref(false)
// 新增时间字段的响应式变量
const newStartTime = ref('')
const newEstimatedEndTime = ref('')

// 编辑状态管理
const editingId = ref<number | null>(null)

// 路由相关导入
import { useRouter } from 'vue-router'

// 创建路由实例
const router = useRouter()

// 认证相关变量
const showLoginForm = ref(false)
const email = ref('')
const password = ref('')
const authError = ref('')



// 邮箱登录
async function loginWithEmail() {
  if (!email.value || !password.value) {
    authError.value = '请输入邮箱和密码'
    return
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (error) throw error
    user.value = data.user
    showLoginForm.value = false
    email.value = ''
    password.value = ''
    fetchTodos() // 登录后重新获取todos
  } catch (error) {
    console.error('登录失败:', error)
    authError.value = '邮箱或密码错误'
  }
}

// 邮箱注册
async function signupWithEmail() {
  if (!email.value || !password.value) {
    authError.value = '请输入邮箱和密码'
    return
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) throw error
    user.value = data.user
    showLoginForm.value = false
    email.value = ''
    password.value = ''
    fetchTodos() // 注册后重新获取todos
  } catch (error) {
    console.error('注册失败:', error)
    authError.value = '注册失败，请检查邮箱格式或密码强度'
  }
}

// 退出登录
async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    todos.value = [] // 清空todos
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

async function fetchTodos() {
  console.log('DEBUG: fetchTodos function called')
  loading.value = true
  try {
    if (!user.value) {
      console.log('DEBUG: No user logged in, returning empty todos')
      todos.value = []
      return
    }
    
    console.log('DEBUG: Fetching todos for user:', user.value.id)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.value.id)
      .order('is_starred', { ascending: false })
      .order('sort', { ascending: true })
      .order('inserted_at', { ascending: false })

    if (error) throw error
    console.log('DEBUG: Fetched todos successfully:', data)
    todos.value = data || []
  } catch (error) {
    console.error('DEBUG: Error fetching todos:', error)
  } finally {
    loading.value = false
    console.log('DEBUG: fetchTodos function completed')
  }
}

async function addTodo() {
  if (!user.value) return
  
  // 1. 基本输入验证
  let taskContent = newTask.value.trim()
  if (!taskContent || taskContent.length > 50) {
    console.error('任务内容不能为空且长度不能超过50个字符')
    return
  }

  try {
    // 2. 过滤输入 - 允许中文、英文字母、数字和空格
    // 移除特殊符号
    const filteredTask = taskContent.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim()
    
    if (!filteredTask) {
      console.error('任务内容不能为空')
      return
    }

    // 3. 确保长度在有效范围内（数据库可能有最小长度要求）
    if (filteredTask.length < 1) {
      console.error('任务内容不能为空')
      return
    }

    // 4. 确保不包含特殊字符，只允许中文、字母、数字和空格
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/.test(filteredTask)) {
      console.error('任务内容包含不允许的特殊字符')
      return
    }

    const finalTask = filteredTask.substring(0, 50)
    
    // 4. 获取当前最大的sort值
    const maxSort = Math.max(...todos.value.map(todo => todo.sort), 0)
    
    // 5. 添加任务到数据库，只包含有值的字段
    const todoData: any = {
      task: finalTask, 
      is_complete: false, 
      is_starred: false, 
      sort: maxSort + 1,
      user_id: user.value.id
    }
    
    // 只有当时间字段有值时才添加
    if (newStartTime.value) {
      todoData.start_time = newStartTime.value
    }
    if (newEstimatedEndTime.value) {
      todoData.estimated_end_time = newEstimatedEndTime.value
    }
    
    // 详细记录要插入的数据
    console.log('准备插入的数据:', JSON.stringify(todoData, null, 2))
    
    const { data, error } = await supabase
      .from('todos')
      .insert([todoData])
      .select()

    if (error) {
      console.error('添加任务失败:', error)
      console.error('错误代码:', error.code)
      console.error('错误详细信息:', JSON.stringify(error, null, 2))
      console.error('尝试添加的内容:', finalTask)
      console.error('尝试添加的完整数据:', JSON.stringify(todoData, null, 2))
      return
    }
    
    if (data && data.length > 0) {
      todos.value.unshift(data[0])
      // 重置所有输入字段
      newTask.value = ''
      newStartTime.value = ''
      newEstimatedEndTime.value = ''
      console.log('任务添加成功:', data[0])
    }
  } catch (error: any) {
    console.error('添加任务发生异常:', error.message || error)
  }
}

async function toggleTodo(id: number, isComplete: boolean) {
  if (!user.value) return
  
  try {
    // 准备更新数据 - 如果任务变为完成状态，添加实际完成时间
    const updateData: any = { is_complete: !isComplete }
    
    if (!isComplete) { // 任务从未完成变为完成状态
      updateData.actual_end_time = new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.value.id)

    if (error) throw error
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1 && todos.value[index]) {
        todos.value[index].is_complete = !isComplete
        // 更新本地状态中的实际完成时间
        if (!isComplete) {
          todos.value[index].actual_end_time = updateData.actual_end_time
        }
      }
  } catch (error) {
    console.error('Error toggling todo:', error)
  }
}

async function deleteTodo(id: number) {
  if (!user.value) return
  
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value.id)

    if (error) throw error
    todos.value = todos.value.filter(todo => todo.id !== id)
  } catch (error) {
    console.error('Error deleting todo:', error)
  }
}

// 星标状态切换功能
async function toggleStar(id: number, isStarred: boolean) {
  if (!user.value) return
  
  try {
    const { error } = await supabase
      .from('todos')
      .update({ is_starred: !isStarred })
      .eq('id', id)
      .eq('user_id', user.value.id)

    if (error) throw error
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1 && todos.value[index]) {
      todos.value[index].is_starred = !isStarred
    }
  } catch (error) {
    console.error('Error toggling star:', error)
  }
}

// 开始编辑任务 - 跳转到编辑页面
function startEdit(todo: Todo) {
  console.log('编辑按钮点击事件触发，尝试跳转到:', `/edit/${todo.id}`)
  router.push(`/edit/${todo.id}`)
}

onMounted(async () => {
  await checkUser()
  fetchTodos()
})
</script>

<template>
  <div class="container">
    <!-- 页面头部，包含标题和登录按钮 -->
    <header class="header">
      <h1 class="title" style="text-align: left;">Todo List</h1>
      
      <!-- 用户认证部分 - 右上角 -->
      <div class="auth-section">
        <div v-if="!user" class="auth-buttons">
          <a-button @click="showLoginForm = !showLoginForm" type="text" style="color: white; background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 0.5rem 1rem;">
            {{ showLoginForm ? '取消' : '登录' }}
          </a-button>
          
          <div v-if="showLoginForm" class="login-form">
            <input
              v-model="email"
              type="email"
              placeholder="邮箱"
              class="auth-input"
            />
            <input
              v-model="password"
              type="password"
              placeholder="密码"
              class="auth-input"
            />
            <div class="form-buttons">
              <a-button @click="loginWithEmail" type="primary" block>登录</a-button>
              <a-button @click="signupWithEmail" type="default" block>注册</a-button>
            </div>
            <div v-if="authError" class="auth-error">{{ authError }}</div>
          </div>
        </div>
        <div v-else class="user-info">
          <a-dropdown trigger="click">
            <span class="avatar-wrapper">
              <a-avatar :size="32" :src="'https://ui-avatars.com/api/?name=' + user.email.split('@')[0] + '&background=random'" style="cursor: pointer;">
                {{ user.email.split('@')[0].charAt(0).toUpperCase() }}
              </a-avatar>
            </span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <span>欢迎: {{ user.email }}</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" danger @click="logout">
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <!-- 任务列表部分 - 标题栏后面 -->
    <main class="main-content">
      <div class="todos-section">
        <div v-if="loading" class="loading" style="text-align: left;">加载中...</div>
        <div v-else-if="todos.length === 0" class="empty" style="text-align: left;">暂无任务，点击下方+号添加</div>
        <div v-else class="todos-list">
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="todo-item"
          >
            <div class="todo-content">
              <input
                type="checkbox"
                :checked="todo.is_complete"
                @change="toggleTodo(todo.id, todo.is_complete)"
                class="todo-checkbox"
                :disabled="editingId === todo.id"
              />
              <component
                :is="todo.is_starred ? 'StarFilled' : 'StarOutlined'"
                :style="{ color: todo.is_starred ? '#ffd700' : 'inherit' }"
                @click.stop="toggleStar(todo.id, todo.is_starred)"
                style="cursor: pointer; margin-right: 0.5rem; font-size: 1.2rem;"
              ></component>
              <div class="todo-info">
                <!-- 查看模式 -->
                <div class="view-mode">
                  <span :class="{ 'completed': todo.is_complete }" class="todo-text">
                    {{ todo.task }}
                  </span>
                  <!-- 时间信息显示 -->
                  <div class="todo-times">
                    <div v-if="todo.start_time" class="todo-time">
                      <span class="time-label">开始:</span>
                      <span class="time-value">{{ new Date(todo.start_time).toLocaleString() }}</span>
                    </div>
                    <div v-if="todo.estimated_end_time" class="todo-time">
                      <span class="time-label">预计完成:</span>
                      <span class="time-value">{{ new Date(todo.estimated_end_time).toLocaleString() }}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <a-dropdown trigger="click">
              <a-button
                type="text"
                size="small"
                :disabled="editingId === todo.id"
                style="padding: 0.5rem; display: flex; align-items: center; justify-content: center;"
              >
                <component
                  is="RightOutlined"
                  style="font-size: 14px; color: #6b7280;"
                ></component>
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit" @click="startEdit(todo)">
                    <EditOutlined /> 编辑
                  </a-menu-item>
                  <a-menu-item key="delete" danger @click="deleteTodo(todo.id)">
                    <DeleteOutlined /> 删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
    </main>

    <!-- 新增任务部分 - 页面最下方 -->
    <footer class="footer">
      <div class="input-section">
        <input
          v-model="newTask"
          type="text"
          placeholder="添加新任务..."
          class="task-input"
          @keyup.enter="addTodo"
          :disabled="!user"
        />

        <a-button @click="addTodo" type="primary" shape="circle" size="large" :disabled="!user">+</a-button>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* 页面头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #4f46e5;
  color: white;
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
}

/* 认证部分样式 - 右上角 */
.auth-section {
  position: relative;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.auth-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.auth-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.auth-btn.logout {
  background-color: rgba(239, 68, 68, 0.8);
}

.auth-btn.logout:hover {
  background-color: rgba(239, 68, 68, 1);
}

.login-form {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 10;
}

.login-form .auth-input {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  color: #374151;
  transition: border-color 0.2s;
}

.login-form .auth-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-buttons {
  display: flex;
  gap: 0.75rem;
}

.form-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

/* 禁用状态样式 */
button:disabled,
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button:disabled:hover {
  background-color: inherit;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.user-info span {
  font-size: 0.9rem;
  font-weight: 500;
}

.auth-error {
  color: #dc2626;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

/* 主内容区 - 任务列表 */
.main-content {
  flex: 1;
  padding: 1rem 0.5rem;
  overflow-y: auto;
  text-align: left;
}

.todos-section {
  width: 100%;
  text-align: left;
}

.loading, .empty {
  text-align: left;
  color: #6b7280;
  padding: 3rem 1rem;
  font-size: 1rem;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
  width: 100%;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.todo-item:hover {
  border-color: #d1d5db;
  background-color: #f3f4f6;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.todo-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background-color: white;
  transition: all 0.2s;
}

.todo-checkbox:checked {
  background-color: #10b981;
  border-color: #10b981;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='20 6 9 17 4 12'%3e%3c/polyline%3e%3c/svg%3e");
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
}

.todo-info {
  flex: 1;
  text-align: left;
}

.todo-text {
  font-size: 1rem;
  color: #374151;
  display: block;
  word-break: break-word;
  margin-bottom: 0.5rem;
  text-align: left;
}

/* 时间信息样式 */
.todo-times {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.todo-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 任务描述样式 */
.todo-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
  white-space: normal;
  word-break: break-word;
}

/* 新增任务描述输入框样式 */
.description-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 0.5rem;
  font-family: inherit;
}

/* 编辑模式样式 */
.edit-mode {
  width: 100%;
}

.edit-input {
  margin-bottom: 0.5rem;
  width: 100%;
}

.edit-time-inputs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.edit-time-input {
  width: auto;
}

.edit-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-mode {
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.view-mode:hover {
  background-color: rgba(79, 70, 229, 0.05);
}

.time-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.time-value {
  font-size: 0.75rem;
  color: #6b7280;
}

.todo-text.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s;
  line-height: 1;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background-color: #dc2626;
  transform: scale(1.1);
}

/* 页脚 - 新增任务 */
.footer {
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.input-section {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  margin-bottom: 1rem;
}

.task-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: white;
}

.task-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* 时间输入控件样式 */
.time-inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-input-group label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.time-input {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: white;
}

.time-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  font-weight: 600;
}

.add-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* +号按钮样式 */
.plus-btn {
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  font-size: 1.75rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.plus-btn:hover {
  background-color: #4338ca;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    border-radius: 0;
    min-height: 100vh;
  }
  
  .header {
    padding: 1rem 1.5rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .main-content {
    padding: 1.5rem;
  }
  
  .footer {
    padding: 1.5rem;
  }
  
  .login-form {
    min-width: 250px;
    padding: 1rem;
  }
}
</style>