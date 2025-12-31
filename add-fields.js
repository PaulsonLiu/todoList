const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取Supabase配置
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请确保已设置VITE_SUPABASE_URL和VITE_SUPABASE_KEY环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addFields() {
  try {
    // 使用Supabase的rpc函数执行SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE todos 
            ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE, 
            ADD COLUMN IF NOT EXISTS estimated_end_time TIMESTAMP WITH TIME ZONE, 
            ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE`
    });
    
    if (error) {
      console.error('执行SQL时出错:', error);
      // 尝试另一种方式 - 通过auth.admin获取更多权限
      console.log('尝试使用管理员权限执行...');
      
      // 直接使用REST API执行SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          sql: `ALTER TABLE todos 
                ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE, 
                ADD COLUMN IF NOT EXISTS estimated_end_time TIMESTAMP WITH TIME ZONE, 
                ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE`
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        console.log('字段添加成功:', result);
      } else {
        console.error('REST API执行失败:', result);
      }
    } else {
      console.log('字段添加成功:', data);
    }
  } catch (err) {
    console.error('发生异常:', err);
    console.log('\n注意: 如果遇到权限问题，可能需要使用Supabase的SQL编辑器来执行此操作。');
    console.log('SQL语句:', `ALTER TABLE todos 
            ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE, 
            ADD COLUMN IF NOT EXISTS estimated_end_time TIMESTAMP WITH TIME ZONE, 
            ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE`);
  }
}

addFields();
