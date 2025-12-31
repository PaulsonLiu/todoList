<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'


// 获取路由参数和路由实例
const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

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

const todo = ref<Todo | null>(null)
const loading = ref(true)
const editingTask = ref('')
const editingStartTime = ref('')
const editingEstimatedEndTime = ref('')
const editingDescription = ref('')

async function fetchTodo() {
  if (!user.value) return
  
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.value.id)
      .single()

    if (error) throw error
    
    todo.value = data
    // 设置表单数据
    editingTask.value = data.task
    editingStartTime.value = data.start_time || ''
    editingEstimatedEndTime.value = data.estimated_end_time || ''
    editingDescription.value = data.description || ''
    
  } catch (error) {
    console.error('Error fetching todo:', error)
  } finally {
    loading.value = false
  }
}

// 保存编辑的任务
async function saveEdit() {
  if (!user.value || !todo.value) return
  
  // 基本输入验证
  let taskContent = editingTask.value.trim()
  if (!taskContent || taskContent.length > 50) {
    console.error('任务内容不能为空且长度不能超过50个字符')
    return
  }

  try {
    // 过滤输入 - 允许中文、英文字母、数字和空格
    const filteredTask = taskContent.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim()
    
    if (!filteredTask) {
      console.error('任务内容不能为空')
      return
    }

    // 确保长度在有效范围内（数据库可能有最小长度要求）
    if (filteredTask.length < 1) {
      console.error('任务内容不能为空')
      return
    }

    // 确保不包含特殊字符，只允许中文、字母、数字和空格
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/.test(filteredTask)) {
      console.error('任务内容包含不允许的特殊字符')
      return
    }

    const finalTask = filteredTask.substring(0, 50)
    const finalDescription = editingDescription.value.trim().substring(0, 200)
    
    // 准备更新数据，只包含有值的字段
    const updateData: any = {
      task: finalTask,
      description: finalDescription
    }
    
    // 只有当时间字段有值时才添加到更新数据中
    if (editingStartTime.value) {
      updateData.start_time = editingStartTime.value
    }
    if (editingEstimatedEndTime.value) {
      updateData.estimated_end_time = editingEstimatedEndTime.value
    }
    
    const { error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', todo.value.id)
      .eq('user_id', user.value.id)

    if (error) throw error
    
    // 保存成功后返回任务列表
    router.push('/')
  } catch (error) {
    console.error('Error updating todo:', error)
  }
}

// 取消编辑，返回任务列表
function cancelEdit() {
  router.push('/')
}

onMounted(async () => {
  await checkUser()
  if (user.value) {
    fetchTodo()
  }
})
</script>

<template>
  <div class="edit-container">
    <header class="edit-header">
      <h1 class="edit-title">编辑任务</h1>
      <a-button @click="cancelEdit" type="default">返回列表</a-button>
    </header>
    
    <main class="edit-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="todo" class="edit-form">
        <a-form layout="vertical">
          <a-form-item label="任务内容">
            <a-input
              v-model:value="editingTask"
              placeholder="任务内容"
              style="width: 100%; margin-bottom: 1rem;"
            />
          </a-form-item>
          
          <a-form-item label="任务描述">
            <a-textarea
              v-model:value="editingDescription"
              placeholder="任务描述"
              :rows="4"
              style="width: 100%; margin-bottom: 1rem;"
            />
          </a-form-item>
          
          <a-form-item label="时间设置">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
              <a-input
                v-model:value="editingStartTime"
                type="datetime-local"
                placeholder="开始时间"
                style="flex: 1;"
              />
              <a-input
                v-model:value="editingEstimatedEndTime"
                type="datetime-local"
                placeholder="预计完成时间"
                style="flex: 1;"
              />
            </div>
          </a-form-item>
          
          <div class="form-actions">
            <a-button @click="cancelEdit" type="default">取消</a-button>
            <a-button @click="saveEdit" type="primary">保存修改</a-button>
          </div>
        </a-form>
      </div>
      <div v-else class="error">任务不存在或您没有权限编辑该任务</div>
    </main>
  </div>
</template>

<style scoped>
.edit-container {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #4f46e5;
  color: white;
}

.edit-title {
  font-size: 1.75rem;
  font-weight: 600;
}

.edit-content {
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
  font-size: 1rem;
}

.edit-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>