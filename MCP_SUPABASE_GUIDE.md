# 使用MCP工具对接Supabase

## 1. MCP Supabase工具概述

在提供的工具列表中，有两个专门用于对接Supabase的MCP工具：

1. **`mcp_supabase-community_postgrestRequest`** - 用于直接对Supabase PostgREST API进行HTTP请求
2. **`mcp_supabase-community_sqlToRest`** - 用于将SQL查询转换为PostgREST API请求

## 2. 配置Supabase环境

在使用MCP工具之前，您需要获取以下信息：

- **Supabase项目URL**：格式为 `https://[project-ref].supabase.co`
- **API密钥**：使用"anon public"密钥（用于客户端访问）

这些信息可以在Supabase项目控制台的"Settings" → "API"页面中找到。

## 3. 使用 `mcp_supabase-community_postgrestRequest`

### 3.1 工具参数

```json
{
  "method": "GET|POST|PUT|PATCH|DELETE",
  "path": "string",
  "body": "object"
}
```

- **`method`**：HTTP请求方法
- **`path`**：API端点路径（相对于项目URL）
- **`body`**：请求体（仅用于POST/PUT/PATCH请求）

### 3.2 使用示例

#### 获取所有Todos
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_postgrestRequest",
    "params": {
      "method": "GET",
      "path": "/rest/v1/todos"
    }
  }
}
```

#### 创建新Todo
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_postgrestRequest",
    "params": {
      "method": "POST",
      "path": "/rest/v1/todos",
      "body": {
        "task": "学习使用MCP工具",
        "is_complete": false
      }
    }
  }
}
```

#### 更新Todo状态
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_postgrestRequest",
    "params": {
      "method": "PATCH",
      "path": "/rest/v1/todos?id=eq.1",
      "body": {
        "is_complete": true
      }
    }
  }
}
```

#### 删除Todo
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_postgrestRequest",
    "params": {
      "method": "DELETE",
      "path": "/rest/v1/todos?id=eq.1"
    }
  }
}
```

## 4. 使用 `mcp_supabase-community_sqlToRest`

### 4.1 工具参数

```json
{
  "sql": "string"
}
```

- **`sql`**：要转换的SQL查询字符串

### 4.2 使用示例

#### 查询所有Todos
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_sqlToRest",
    "params": {
      "sql": "SELECT * FROM todos"
    }
  }
}
```

#### 带条件的查询
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_sqlToRest",
    "params": {
      "sql": "SELECT * FROM todos WHERE is_complete = false"
    }
  }
}
```

#### 排序和分页
```json
{
  "toolcall": {
    "name": "mcp_supabase-community_sqlToRest",
    "params": {
      "sql": "SELECT * FROM todos ORDER BY inserted_at DESC LIMIT 10 OFFSET 0"
    }
  }
}
```

## 5. 认证配置

使用MCP工具时，您需要确保已正确配置Supabase认证。通常，这意味着需要在请求头中包含API密钥：

- **`apikey`**：Supabase项目的API密钥
- **`Authorization`**：格式为 `Bearer YOUR_API_KEY`

注意：具体的认证配置可能因MCP工具的实现而有所不同，请参考工具的具体文档。

## 6. 完整工作流示例

### 6.1 创建Todo并查询

1. 首先，将SQL查询转换为API请求：

```json
{
  "toolcall": {
    "name": "mcp_supabase-community_sqlToRest",
    "params": {
      "sql": "INSERT INTO todos (task, is_complete) VALUES ('完成项目文档', false)"
    }
  }
}
```

2. 然后，使用转换后的API请求创建Todo：

```json
{
  "toolcall": {
    "name": "mcp_supabase-community_postgrestRequest",
    "params": {
      "method": "POST",
      "path": "/rest/v1/todos",
      "body": {
        "task": "完成项目文档",
        "is_complete": false
      }
    }
  }
}
```

3. 最后，查询所有Todos：

```json
{
  "toolcall": {
    "name": "mcp_supabase-community_postgrestRequest",
    "params": {
      "method": "GET",
      "path": "/rest/v1/todos"
    }
  }
}
```

## 7. 注意事项

1. **权限控制**：确保Supabase表已正确配置行级安全策略（RLS），以限制对数据的访问
2. **API限制**：了解Supabase的API速率限制，避免过度请求
3. **错误处理**：实现适当的错误处理机制，处理API请求可能返回的错误
4. **数据验证**：在发送请求之前验证输入数据，确保数据格式正确
5. **安全**：永远不要在客户端代码中暴露Supabase的service_role密钥

## 8. 参考资源

- [Supabase REST API文档](https://supabase.com/docs/guides/api)
- [PostgREST文档](https://postgrest.org/en/stable/)
