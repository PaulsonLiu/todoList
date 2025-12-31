import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请确保已设置VITE_SUPABASE_URL和VITE_SUPABASE_KEY环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 先登录获取真实用户ID
async function loginAndTest() {
  console.log('正在登录...');
  
  // 使用项目中的测试账号登录
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (error) {
    console.error('登录失败:', error.message);
    process.exit(1);
  }
  
  console.log('登录成功，用户ID:', data.user.id);
  await testTaskConstraints(data.user.id);
}

async function testTaskConstraints(userId) {
  console.log('测试任务字段约束...');
  
  // 测试1: 空任务
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: '', is_complete: false, is_starred: false, sort: 1, user_id: userId }])
      .select();
    if (error) throw error;
    console.log('测试1失败: 空任务应该被拒绝');
  } catch (error) {
    console.log('测试1通过: 空任务被正确拒绝 -', error.message);
  }
  
  // 测试2: 非常短的任务
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: 'a', is_complete: false, is_starred: false, sort: 1, user_id: userId }])
      .select();
    if (error) throw error;
    console.log('测试2通过: 短任务被接受');
  } catch (error) {
    console.log('测试2失败: 短任务被拒绝 -', error.message);
  }
  
  // 测试3: 长任务（50个字符）
  try {
    const longTask = 'a'.repeat(50);
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: longTask, is_complete: false, is_starred: false, sort: 1, user_id: userId }])
      .select();
    if (error) throw error;
    console.log('测试3通过: 50个字符的任务被接受');
  } catch (error) {
    console.log('测试3失败: 50个字符的任务被拒绝 -', error.message);
  }
  
  // 测试4: 超长任务（51个字符）
  try {
    const longTask = 'a'.repeat(51);
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: longTask, is_complete: false, is_starred: false, sort: 1, user_id: userId }])
      .select();
    if (error) throw error;
    console.log('测试4失败: 51个字符的任务应该被拒绝');
  } catch (error) {
    console.log('测试4通过: 51个字符的任务被正确拒绝 -', error.message);
  }
  
  // 测试5: 包含特殊字符的任务
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: 'test@task', is_complete: false, is_starred: false, sort: 1, user_id: userId }])
      .select();
    if (error) throw error;
    console.log('测试5失败: 包含@字符的任务应该被拒绝');
  } catch (error) {
    console.log('测试5通过: 包含@字符的任务被正确拒绝 -', error.message);
  }
  
  // 测试6: 正常任务
  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: 'test task', is_complete: false, is_starred: false, sort: 1, user_id: userId }])
      .select();
    if (error) throw error;
    console.log('测试6通过: 正常任务被接受');
    
    // 清理测试数据
    await supabase.from('todos').delete().eq('id', data[0].id);
  } catch (error) {
    console.log('测试6失败: 正常任务被拒绝 -', error.message);
  }
}

loginAndTest().then(() => {
  console.log('所有测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('测试过程中出错:', error);
  process.exit(1);
});
