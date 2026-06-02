# HR 管理系统开发说明

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

- 前端：http://localhost:5173
- 后端：http://localhost:3000/api/health

## 当前 MVP 范围

已完成第一版可运行骨架：

- 后端 NestJS API
- 前端 Vue 3 + TypeScript 管理后台
- 工作台指标
- 员工档案列表、筛选、新增
- 审批待办、通过、驳回
- 报表中心基础统计
- PostgreSQL 数据模型草案
- Docker + Nginx + PostgreSQL + Redis + MinIO 部署编排

## 推荐迭代顺序

1. 接入真实 PostgreSQL 持久化。
2. 实现 JWT 鉴权、角色权限、菜单权限和数据范围。
3. 完成员工档案详情、合同附件、批量导入。
4. 完成入转调离、考勤请假、绩效培训流程。
5. 完成薪酬基础数据、人事报表、审计日志。
6. 补充自动化测试、CI/CD 和验收报告。

## API 摘要

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/api/auth/login` | 登录 |
| `GET` | `/api/dashboard/summary` | 工作台汇总 |
| `GET` | `/api/employees` | 员工列表 |
| `POST` | `/api/employees` | 新增员工 |
| `GET` | `/api/departments` | 部门列表 |
| `GET` | `/api/workflow-tasks/my` | 我的审批 |
| `POST` | `/api/workflow-tasks/:id/action` | 审批处理 |
| `GET` | `/api/reports/overview` | 报表汇总 |

## 验收检查

```bash
npm run build
npm run test
```

如果要部署完整环境：

```bash
docker compose up -d --build
```
