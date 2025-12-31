<script setup lang="ts">
// App.vue 作为纯路由容器
</script>

<template>
  <!-- 路由视图容器 -->
  <router-view />
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

.auth-input {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.auth-input:focus {
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
}

.todos-section {
  width: 100%;
}

.loading, .empty {
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
  font-size: 1rem;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
}

.todo-text {
  font-size: 1rem;
  color: #374151;
  display: block;
  word-break: break-word;
  margin-bottom: 0.5rem;
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
