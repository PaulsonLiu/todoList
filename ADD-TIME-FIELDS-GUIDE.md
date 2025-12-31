# 为Todos表添加时间字段的详细指南

## 问题说明

由于MCP工具的限制（不支持ALTER TABLE语句和直接的DDL操作），无法直接通过API调用添加表字段。您需要在Supabase控制台中手动执行SQL语句来添加所需的时间字段。

## 所需添加的字段

| 字段名 | 数据类型 | 描述 |
|-------|---------|------|
| start_time | TIMESTAMP WITH TIME ZONE | 任务开始时间 |
| estimated_end_time | TIMESTAMP WITH TIME ZONE | 预计完成时间 |
| actual_end_time | TIMESTAMP WITH TIME ZONE | 实际完成时间 |

## 步骤1：登录Supabase控制台

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 使用您的Supabase账号登录

## 步骤2：选择项目

在控制台中选择包含您的todos表的项目。

## 步骤3：打开SQL编辑器

1. 在左侧导航栏中，找到并点击「SQL Editor」选项
2. 这将打开一个SQL代码编辑器，您可以在这里执行SQL语句

## 步骤4：执行添加字段的SQL语句

在SQL编辑器中粘贴以下代码：

```sql
-- 添加时间字段到todos表
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE, 
ADD COLUMN IF NOT EXISTS estimated_end_time TIMESTAMP WITH TIME ZONE, 
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE;

-- 可选：为新字段添加索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_todos_start_time ON todos(start_time);
CREATE INDEX IF NOT EXISTS idx_todos_estimated_end_time ON todos(estimated_end_time);
CREATE INDEX IF NOT EXISTS idx_todos_actual_end_time ON todos(actual_end_time);
```

然后点击「Run」按钮执行语句。

## 步骤5：验证字段添加成功

1. 在左侧导航栏中点击「Table Editor」
2. 选择「todos」表
3. 在表结构视图中，您应该能看到新添加的三个时间字段

## 前端兼容性

前端代码已经完全准备好支持这些新字段：

1. **数据结构**：`Todo`接口已经包含了所有新字段
2. **UI界面**：提供了时间输入控件和显示逻辑
3. **数据处理**：
   - 添加任务时会保存开始时间和预计完成时间
   - 完成任务时会自动记录实际完成时间
   - 任务列表会显示所有时间信息

## 常见问题解答

### 字段类型说明

使用`TIMESTAMP WITH TIME ZONE`类型可以确保在不同地区显示正确的时间，支持时区转换。

### 字段是否为必填项？

这些字段都是可选的（nullable），不会影响现有数据和功能。

### 索引的作用

添加索引可以提高基于时间字段的查询性能，特别是当您有大量数据并需要按时间过滤或排序时。

## 下一步

一旦您在Supabase控制台中添加了这些字段，前端应用将立即能够使用完整的时间管理功能，无需任何额外的代码修改。

如果您在执行过程中遇到任何问题，请随时告诉我！