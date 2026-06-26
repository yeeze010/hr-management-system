# 知衡人事管理系统

面向企业 HR、部门主管和员工的人事运营系统。产品围绕员工全生命周期设计，提供组织岗位、职级编制、员工档案、合同证书、入转调离、考勤假勤、绩效培训、人事报表与验收交付能力。

## 已实现的可视化产品

- 人事工作台：人员指标、组织编制、今日待办、风险提醒。
- 组织与员工：组织岗位、编制使用率、员工档案列表与筛选。
- 员工档案详情：任职信息、合同、证书、工作经历。
- 入转调离：入职、转正、调岗、离职流程节点推进。
- 考勤假勤：请假、加班、补卡统一申请表单和状态列表。
- 招聘与入职：候选人录入、招聘漏斗、阶段推进与入职准备度。
- 员工服务台：假期余额、证明、费用、资产台账与合规提醒。
- 绩效与培训：绩效分布图表、培训计划和完成率。
- 人事报表：部门人数、员工状态结构、人事风险台账。
- 验收中心：验收准备度、验收项状态流转、报告生成入口。

## 技术栈

- 前端：Vue 3 + TypeScript + Vite
- 后端：NestJS + TypeScript
- 数据库规划：PostgreSQL + Prisma
- 缓存与任务：Redis
- 文件存储：MinIO
- 部署：Docker Compose + Nginx

## 启动方式

```bash
npm install
npm run dev
```

默认访问地址：

- 前端产品：http://localhost:5216
- 前端构建预览：http://localhost:6216
- 后端健康检查：http://localhost:8216/api/health

项目端口由根目录 `.env.ports` 固定分配：前端开发 `5216`、API `8216`、前端构建预览 `6216`。

Vite 开发与预览均启用 `strictPort`。端口被占用时启动会直接失败，禁止自动换端口。

## 构建与验证

```bash
npm run build
npm run test
npm run lint
```

Docker 完整环境：

```bash
docker compose up -d --build
```

## Cursor 入口文件

- 产品主界面：`apps/frontend/src/App.vue`
- 产品样式：`apps/frontend/src/styles.css`
- 前端 API 类型：`apps/frontend/src/api.ts`
- 后端入口：`apps/backend/src/main.ts`
- 样例业务数据：`apps/backend/src/modules/shared/hr-data.service.ts`
- Prisma 数据模型：`apps/backend/prisma/schema.prisma`

## 项目目录

```text
apps/frontend/       Vue 可视化产品
apps/backend/        NestJS API
docs/                需求、设计、架构、接口、测试、部署、验收
deploy/              Nginx 配置
deliverables/        项目交付资料
docker-compose.yml   完整环境编排
```

## 文档导航

- `docs/index.md`：文档总览
- `docs/requirements/`：定位、角色、流程、模块
- `docs/design/`：页面、交互、权限、报表、告警、附件
- `docs/design/github-feature-reference.md`：GitHub 开源 HR 产品参考与本项目落地
- `docs/architecture/`：架构、数据模型
- `docs/api/`：接口规划
- `docs/test/`：测试计划
- `docs/deployment/`：部署与 Git/GitHub 规范
- `docs/acceptance/`：验收标准与里程碑

## 当前剩余工程风险

- 当前业务数据使用内存样例，服务重启后状态恢复；正式版需接入 PostgreSQL。
- 登录接口为演示实现，正式版需接入 JWT、RBAC、数据权限和字段脱敏。
- 合同、证书附件入口已提供，正式版需接入 MinIO 上传、预览、下载和审计。
