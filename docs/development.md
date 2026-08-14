# 人事全流程与组织效能管理系统开发说明

## 本地开发

安装依赖：

```bash
npm install
```

启动前后端：

```bash
npm run dev
```

访问地址：

- 前端：`http://localhost:5216`
- 前端预览：`http://localhost:6216`
- 后端：`http://localhost:8216/api/health`

## 当前 MVP 范围

当前仓库已完成可运行的第一版骨架：

- 后端 NestJS API
- 前端 Vue 3 + TypeScript 管理后台
- 工作台指标、员工档案、审批中心、报表中心基础界面
- PostgreSQL Prisma 数据模型草案
- Docker + Nginx + PostgreSQL + Redis + MinIO 部署编排

## 推荐迭代顺序

1. 接入真实 PostgreSQL 与 Prisma Client
2. 建立 JWT、角色权限、菜单权限和数据范围
3. 完成员工详情、合同附件、批量导入
4. 完成入转调离、请假、编制等流程模块
5. 完成报表深化、审计日志和验收回归

## API 摘要

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/health` | 健康检查 |
| `POST` | `/api/auth/login` | 登录 |
| `GET` | `/api/dashboard/summary` | 工作台汇总 |
| `GET` | `/api/employees` | 员工列表 |
| `POST` | `/api/employees` | 新增员工 |
| `GET` | `/api/departments` | 部门列表 |
| `GET` | `/api/workflow-tasks/my` | 我的审批 |
| `POST` | `/api/workflow-tasks/:id/action` | 审批处理 |
| `GET` | `/api/reports/overview` | 报表概览 |

## 验收基线

```bash
npm run build
npm run test
npm run lint
```

如需完整容器环境验证：

```bash
docker compose up -d --build
```
