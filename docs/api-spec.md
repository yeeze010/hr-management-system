# HR 管理系统 API 说明

## 1. 约定

- Base URL：`/api`
- Content-Type：`application/json`
- 鉴权：当前骨架未启用 JWT，后续统一增加 `Authorization: Bearer <token>`
- 错误响应建议：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "参数校验失败",
  "details": []
}
```

## 2. 当前接口

### 2.1 健康检查

- 方法：`GET`
- 路径：`/health`
- 说明：用于容器和环境检查

响应示例：

```json
{
  "status": "ok"
}
```

### 2.2 登录

- 方法：`POST`
- 路径：`/auth/login`
- 说明：当前为示例登录响应

请求示例：

```json
{
  "username": "admin",
  "password": "******"
}
```

响应示例：

```json
{
  "token": "demo-token",
  "user": {
    "id": "u-admin",
    "name": "系统管理员",
    "role": "SYSTEM_ADMIN"
  }
}
```

### 2.3 工作台汇总

- 方法：`GET`
- 路径：`/dashboard/summary`

返回字段：

- `metrics`
- `departments`
- `recentEmployees`
- `pendingTasks`

### 2.4 员工列表

- 方法：`GET`
- 路径：`/employees`
- 查询参数：
  - `keyword`
  - `department`

### 2.5 新增员工

- 方法：`POST`
- 路径：`/employees`

请求体：

```json
{
  "name": "张三",
  "department": "人力资源部",
  "position": "HR 专员",
  "phone": "13800000000",
  "hireDate": "2026-06-05",
  "status": "试用",
  "contractEndDate": "2029-06-04"
}
```

校验规则建议：

- `name` 必填，长度 2-30
- `department` 必填
- `position` 必填
- `phone` 必填，匹配手机号格式
- `hireDate` 必填，ISO 日期
- `status` 枚举：`在职`、`试用`、`待入职`、`离职`

### 2.6 部门列表

- 方法：`GET`
- 路径：`/departments`

### 2.7 我的审批

- 方法：`GET`
- 路径：`/workflow-tasks/my`

### 2.8 审批处理

- 方法：`POST`
- 路径：`/workflow-tasks/:id/action`

请求体：

```json
{
  "action": "approve"
}
```

动作枚举：

- `approve`
- `reject`

### 2.9 报表概览

- 方法：`GET`
- 路径：`/reports/overview`

## 3. 规划中的接口

| 优先级 | 方法 | 路径 | 说明 |
|---|---|---|---|
| P0 | `GET` | `/employees/:id` | 员工详情 |
| P0 | `PUT` | `/employees/:id` | 员工编辑 |
| P0 | `GET` | `/employees/:id/contracts` | 员工合同列表 |
| P1 | `POST` | `/employees/import` | 批量导入员工 |
| P1 | `POST` | `/workflows/regularization` | 发起转正流程 |
| P1 | `POST` | `/workflows/transfer` | 发起调岗流程 |
| P1 | `GET` | `/contracts/expiring` | 合同预警 |
| P1 | `GET` | `/roles` | 角色列表 |
| P2 | `GET` | `/audit-logs` | 审计日志查询 |

## 4. 前后端联调注意事项

1. 开发态默认前端走 `VITE_API_BASE`，为空时请求当前域名
2. 开发态通过 Vite 代理访问 API；如需直连，可显式设置 `VITE_API_BASE=http://localhost:8216`
3. 容器态前端和后端通过 Nginx 统一代理，避免浏览器跨域配置漂移
