# HR 管理系统

本项目用于建设一套面向企业人力资源管理的人事管理系统，覆盖员工档案、部门岗位、入转调离、考勤请假、绩效、培训、合同、薪酬基础数据与人事统计报表等能力。

## 项目定位

- 统一维护员工全生命周期数据
- 建立组织架构、岗位与人员关系台账
- 支持入职、转正、调岗、离职等人事流程
- 支持考勤、请假、绩效、培训、合同和薪酬基础数据管理
- 支持管理报表、权限控制、操作审计和验收归档

## 建议技术栈

- 前端：Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus
- 后端：Spring Boot 3 + Spring Security
- 数据库：PostgreSQL
- 缓存：Redis
- 文件存储：MinIO
- 部署：Docker + Nginx

## 交付物

- `deliverables/docs/HR管理系统项目规格与实施方案.docx`
- `deliverables/spreadsheets/HR管理系统项目管理工作簿.xlsx`
- `deliverables/diagram/hr-management-system/system-architecture.svg`
- `deliverables/diagram/hr-management-system/business-flow.svg`
- `deliverables/diagram/hr-management-system/data-flow.svg`

## Git 分支模型

- `main`：稳定主分支，只合并验收通过的发布版本
- `develop`：开发集成分支
- `feature/<module-name>`：功能开发分支
- `fix/<issue-name>`：缺陷修复分支
- `release/<version>`：发布验收分支
- `hotfix/<issue-name>`：生产紧急修复分支

## Commit Message 规范

使用 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档变更
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建、配置、依赖、脚手架
- `ci:` CI/CD 配置
- `perf:` 性能优化
- `revert:` 回滚提交

示例：

```bash
feat: add employee profile module
fix: resolve attendance approval status error
docs: update deployment guide
ci: add github actions workflow
```

## 快速开始

```bash
git checkout develop
git checkout -b feature/employee-profile
```

完整 Git 与 GitHub 协作方案见：

`deliverables/docs/Git与GitHub版本管理方案.md`
