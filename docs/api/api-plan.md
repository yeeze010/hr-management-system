# API 接口规划

## 通用规范

### 路径

- API 前缀：`/api`
- 资源使用复数：`/employees`、`/departments`
- 流程动作使用子路径：`/workflow-tasks/{id}/action`

### 响应格式

```json
{
  "code": "OK",
  "message": "success",
  "data": {}
}
```

当前 MVP 直接返回数据对象，正式版应统一包装。

### 分页参数

| 参数 | 说明 |
|---|---|
| `page` | 页码，从 1 开始 |
| `pageSize` | 每页数量 |
| `sortBy` | 排序字段 |
| `sortOrder` | `asc` 或 `desc` |

### 错误码

| 错误码 | HTTP | 说明 |
|---|---:|---|
| `AUTH_REQUIRED` | 401 | 未登录 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 参数校验失败 |
| `BIZ_RULE_FAILED` | 422 | 业务规则不通过 |
| `SYSTEM_ERROR` | 500 | 系统异常 |

## 接口清单

### 认证权限

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/auth/login` | 登录 |
| `POST` | `/api/auth/logout` | 退出 |
| `GET` | `/api/auth/me` | 当前用户 |
| `GET` | `/api/permissions/tree` | 权限树 |
| `GET` | `/api/roles` | 角色列表 |
| `POST` | `/api/roles` | 创建角色 |

### 组织岗位

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/departments/tree` | 部门树 |
| `POST` | `/api/departments` | 创建部门 |
| `PATCH` | `/api/departments/{id}` | 更新部门 |
| `GET` | `/api/positions` | 岗位列表 |
| `POST` | `/api/positions` | 创建岗位 |
| `GET` | `/api/job-levels` | 职级列表 |
| `GET` | `/api/headcount/plans` | 编制计划 |

### 员工档案

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/employees` | 员工列表 |
| `POST` | `/api/employees` | 新增员工 |
| `GET` | `/api/employees/{id}` | 员工详情 |
| `PATCH` | `/api/employees/{id}` | 更新员工 |
| `GET` | `/api/employees/{id}/contracts` | 员工合同 |
| `POST` | `/api/employees/{id}/contracts` | 新增合同 |
| `GET` | `/api/employees/{id}/certificates` | 员工证书 |
| `POST` | `/api/employees/{id}/certificates` | 新增证书 |
| `GET` | `/api/employees/{id}/experiences` | 员工经历 |
| `POST` | `/api/employees/{id}/experiences` | 新增经历 |

### 入转调离

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/onboarding/processes` | 发起入职 |
| `POST` | `/api/probation/processes` | 发起转正 |
| `POST` | `/api/transfer/processes` | 发起调岗 |
| `POST` | `/api/resignation/processes` | 发起离职 |
| `GET` | `/api/employment-changes` | 任职变更记录 |

### 考勤请假加班

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/attendance/records` | 考勤记录 |
| `POST` | `/api/attendance/import` | 导入考勤 |
| `POST` | `/api/leave-requests` | 发起请假 |
| `GET` | `/api/leave-balances` | 假期余额 |
| `POST` | `/api/overtime-requests` | 发起加班 |
| `POST` | `/api/missing-punch-requests` | 发起补卡 |

### 绩效培训

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/performance/cycles` | 绩效周期 |
| `POST` | `/api/performance/cycles` | 创建周期 |
| `GET` | `/api/performance/results` | 绩效结果 |
| `POST` | `/api/training/courses` | 创建培训课程 |
| `GET` | `/api/training/records` | 培训记录 |

### 流程审批

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/workflows/start` | 发起流程 |
| `GET` | `/api/workflow-tasks/my` | 我的待办 |
| `POST` | `/api/workflow-tasks/{id}/action` | 审批动作 |
| `GET` | `/api/workflows/{id}/timeline` | 流程轨迹 |

### 文件附件

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/files/upload` | 上传文件 |
| `GET` | `/api/files/{id}/preview` | 预览 |
| `GET` | `/api/files/{id}/download` | 下载 |
| `DELETE` | `/api/files/{id}` | 删除 |

### 报表与导出

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/reports/headcount` | 人员结构 |
| `GET` | `/api/reports/turnover` | 异动分析 |
| `GET` | `/api/reports/contracts-expiring` | 合同到期 |
| `GET` | `/api/reports/attendance` | 考勤统计 |
| `POST` | `/api/export-tasks` | 创建导出任务 |
| `GET` | `/api/export-tasks/{id}` | 导出任务状态 |
