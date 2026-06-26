# HR 管理系统测试计划

## 1. 测试目标

验证当前 MVP 骨架在构建、类型校验、关键接口和核心页面流程上可用，并为真实数据库接入后的回归测试提供基线。

## 2. 测试范围

### 2.1 当前纳入

- 前后端构建
- TypeScript 类型校验
- 健康检查接口
- 工作台、员工、审批、报表页面基础交互
- Docker Compose 配置可读性与环境变量一致性
- 项目文档、CI、Issue/PR 模板完整性

### 2.2 暂不纳入

- 真数据库 CRUD
- JWT 登录安全性
- 文件上传
- 性能压测
- 自动化 E2E 浏览器回归

## 3. 测试策略

| 层级 | 方法 | 当前执行方式 |
|---|---|---|
| 静态检查 | TypeScript / 编译检查 | `npm run lint`、`npm run test` |
| 构建验证 | 前后端打包 | `npm run build` |
| 接口验证 | 启动后调用关键接口 | 本轮以构建和代码审查为主 |
| 页面验证 | 本地运行后人工或浏览器脚本检查 | 下一轮建议补充 |
| 部署验证 | `docker compose config`、容器健康检查 | 建议后续补充 |

## 4. 关键测试点

### 4.1 后端

1. `/api/health` 返回成功
2. `/api/dashboard/summary` 返回指标、部门、待办
3. `/api/employees` 支持关键字和部门过滤
4. `/api/employees` 新增员工后返回编号和记录
5. `/api/workflow-tasks/:id/action` 对不存在任务返回 404

### 4.2 前端

1. 页面可正常加载
2. 工作台指标、待办和部门卡片可渲染
3. 员工筛选按钮可触发列表刷新
4. 新增员工表单校验可阻止空提交
5. 审批通过/驳回按钮能更新状态
6. 报表卡片和条形展示正常

### 4.3 文档与工程规范

1. README 包含启动、构建、测试、文档导航
2. `.github` 目录包含 Issue、PR、CI 基线
3. `docs` 覆盖需求、设计、接口、测试、部署、验收

## 5. 回归清单

每次迭代至少执行：

```bash
npm run build
npm run test
npm run lint
```

如接入容器环境，再执行：

```bash
docker compose config
docker compose up -d --build
```

## 6. 缺陷分级

- P0：无法启动、核心流程不可用、数据错乱
- P1：关键模块功能受限、错误提示不明确
- P2：样式、可用性、非主路径问题

## 7. 自动化建议

1. 后端增加 `supertest` 接口测试
2. 前端增加 `vitest` 和 `@testing-library/vue`
3. 验收阶段加入 Playwright E2E
