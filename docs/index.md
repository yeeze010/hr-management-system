# 人事管理系统文档总览

本文档集用于指导《人事管理系统》从功能细化、工程开发、测试部署到验收归档的全过程。

## 文档目录

| 目录 | 文档 | 用途 |
|---|---|---|
| `docs/requirements/` | 需求与功能结构 | 项目定位、用户角色、业务流程、功能模块 |
| `docs/design/` | 产品与交互设计 | 页面清单、后台体验、权限矩阵、报表、通知、附件 |
| `docs/architecture/` | 架构与数据模型 | 系统架构、工程骨架、数据模型、关键流程图 |
| `docs/api/` | 接口规划 | API 分组、接口清单、错误码、分页与鉴权规范 |
| `docs/test/` | 测试计划 | 测试范围、用例策略、质量门禁 |
| `docs/deployment/` | 部署与 GitHub 工程规范 | 环境、容器、CI/CD、分支、PR、Release |
| `docs/acceptance/` | 验收与里程碑 | 验收标准、交付清单、里程碑计划 |

## 当前技术路线

- 前端：Vue 3 + TypeScript + Vite
- 后端：NestJS + TypeScript
- 数据库：PostgreSQL
- 缓存：Redis
- 文件存储：MinIO
- 部署：Docker + Nginx
- 协作：Git + GitHub + PR Review + GitHub Actions

## MVP 到正式版推进方式

1. 先稳定基础工程、登录权限、员工主数据和审批流。
2. 再扩展合同、证书、经历、组织岗位、职级编制。
3. 继续补齐入职、转正、调岗、离职、考勤、请假、加班、绩效、培训。
4. 最后完成报表、告警、附件归档、审计日志、部署验收和 Release。
