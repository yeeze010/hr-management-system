# 人事全流程与组织效能管理系统架构设计

## 1. 总体架构

系统采用前后端分离架构：

1. 前端使用 Vue 3 + Vite 提供管理后台界面
2. 后端使用 NestJS 提供 REST API
3. 数据存储规划为 PostgreSQL
4. Redis 用于缓存、会话或异步任务预留
5. MinIO 用于合同、附件、证明材料存储
6. Nginx 反向代理前端静态资源和后端 API

## 2. 分层设计

### 2.1 前端层

- 页面容器：工作台、员工档案、审批中心、报表中心
- API 访问层：`src/api.ts`
- 样式层：`src/styles.css`
- 现状：单文件组件集中在 `apps/frontend/src/App.vue`

### 2.2 后端层

- 启动入口：`src/main.ts`
- 模块聚合：`src/modules/app.module.ts`
- 领域控制器：`auth`、`dashboard`、`employees`、`workflow`、`reports`、`health`
- 数据服务：`src/modules/shared/hr-data.service.ts`
- 现状：控制器已可提供演示接口，数据服务仍为内存实现

### 2.3 数据层

当前 Prisma 模型已定义：

- `SysUser`
- `Department`
- `Position`
- `Employee`
- `WorkflowInstance`
- `WorkflowTask`
- `AuditLog`

建议增加实体关系和索引：

- `Employee.departmentId -> Department.id`
- `Employee.positionId -> Position.id`
- `WorkflowTask.instanceId -> WorkflowInstance.id`
- `Department.parentId -> Department.id`
- `Department.managerId -> Employee.id`

## 3. 业务组件拆分建议

| 领域 | 后端模块建议 | 前端页面建议 |
|---|---|---|
| 身份认证 | `auth` | 登录页、个人中心 |
| 组织岗位 | `organization` | 组织树、岗位编制页 |
| 员工档案 | `employees` | 员工列表、详情、导入导出 |
| 异动流程 | `workflow` | 入职、转正、调岗、离职流程页 |
| 合同附件 | `contracts` | 合同台账、附件预览 |
| 报表分析 | `reports` | 趋势图、风险看板 |
| 权限审计 | `rbac`、`audit` | 角色权限、审计日志 |

## 4. 关键业务流程设计

### 4.1 登录鉴权

1. 用户通过账号密码登录
2. 后端校验账号、密码和状态
3. 生成 JWT 访问令牌与刷新令牌
4. 返回当前用户菜单权限和数据范围

### 4.2 员工建档

1. HR 填写员工主数据
2. 校验员工编号、手机号、部门岗位合法性
3. 持久化员工与附件记录
4. 写入审计日志并刷新工作台指标

### 4.3 审批处理

1. 获取待审批任务列表
2. 审批人执行通过/驳回
3. 更新流程任务状态和业务实体状态
4. 通知下一处理节点或流程结束

## 5. 接口与前端映射

| 前端区域 | 依赖接口 | 状态 |
|---|---|---|
| 工作台指标卡 | `GET /api/dashboard/summary` | 已联通 |
| 员工列表 | `GET /api/employees` | 已联通 |
| 新增员工 | `POST /api/employees` | 已联通 |
| 审批列表 | `GET /api/workflow-tasks/my` | 已联通 |
| 审批动作 | `POST /api/workflow-tasks/:id/action` | 已联通 |
| 报表概览 | `GET /api/reports/overview` | 已联通 |

## 6. 部署架构

### 6.1 容器清单

- `postgres`
- `redis`
- `minio`
- `backend`
- `frontend`

### 6.2 端口规划

| 服务 | 本地开发 | Docker Compose |
|---|---|---|
| 前端 | 5216 | 5216 |
| 后端 | 8216 | 8216 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| MinIO API | 9000 | 9000 |
| MinIO Console | 9001 | 9001 |

注意：开发态与容器态后端端口不同，测试与文档需要明确区分。

## 7. 技术债与改造建议

1. 用 Prisma Client 替换 `HrDataService` 的内存数组
2. 把 `App.vue` 拆分为路由页、复用组件和状态管理
3. 加入 DTO 响应类型、错误码和统一异常过滤器
4. 建立单元测试、接口测试和 E2E 流程
5. 为 Docker 镜像加入多阶段构建和健康检查
