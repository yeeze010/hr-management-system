# 人事全流程与组织效能管理系统 Git 与 GitHub 版本管理方案

## 1. 本地 Git 初始化步骤

当前项目目录：`F:\软件开发\hr-management-system`

初始化命令：

```bash
git init
git branch -M main
git add .
git commit -m "chore: initialize hr management project"
git checkout -b develop
```

绑定 GitHub 远程仓库命令：

```bash
git remote add origin https://github.com/<org>/<repo-name>.git
git push -u origin main
git push -u origin develop
```

说明：`<org>` 和 `<repo-name>` 需要替换为实际 GitHub 组织名和仓库名。

## 2. 分支模型

| 分支 | 用途 | 合并目标 |
|---|---|---|
| `main` | 稳定主分支，保存正式验收和发布版本 | 不直接开发 |
| `develop` | 日常开发集成分支 | `release/*` |
| `feature/<module-name>` | 功能开发，如 `feature/employee-profile` | `develop` |
| `fix/<issue-name>` | 普通缺陷修复，如 `fix/leave-status` | `develop` |
| `release/<version>` | 发布验收分支，如 `release/v1.0.0` | `main` 和 `develop` |
| `hotfix/<issue-name>` | 生产紧急修复 | `main` 和 `develop` |

推荐功能分支：

```bash
feature/auth-permission
feature/org-position
feature/employee-profile
feature/onboarding-transfer-offboarding
feature/attendance-leave
feature/performance-training
feature/contract-payroll-base
feature/hr-reports
feature/audit-log
```

## 3. Commit Message 规范

采用 Conventional Commits：

| 类型 | 含义 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat: add employee profile module` |
| `fix` | 修复缺陷 | `fix: correct leave approval status` |
| `docs` | 文档变更 | `docs: update acceptance checklist` |
| `style` | 代码格式 | `style: format employee form component` |
| `refactor` | 重构 | `refactor: simplify permission resolver` |
| `test` | 测试 | `test: add employee api tests` |
| `chore` | 配置、依赖、脚手架 | `chore: initialize project structure` |
| `ci` | CI/CD | `ci: add github actions workflow` |
| `perf` | 性能优化 | `perf: optimize employee list query` |
| `revert` | 回滚 | `revert: revert attendance import change` |

提交建议：

- 单次提交只处理一个清晰目的。
- 功能开发先提交到 `feature/*`，不要直接提交到 `main`。
- 涉及验收、部署、数据库变更的提交，需要在 PR 描述中说明影响范围。

## 4. Tag 版本规划

| Tag | 阶段 | 说明 |
|---|---|---|
| `v0.1.0` | 初始化版本 | 项目框架、文档、基础工程 |
| `v0.3.0` | 核心模块初版 | 登录权限、组织、员工档案 |
| `v0.5.0` | 主要功能联调 | 入转调离、考勤请假、合同、绩效 |
| `v0.8.0` | 测试演示版本 | 报表、审计、UAT 环境可演示 |
| `v1.0.0` | 正式验收版本 | 验收通过，可发布归档 |

打标签命令：

```bash
git tag -a v1.0.0 -m "v1.0.0 acceptance release"
git push origin v1.0.0
```

## 5. Git 与 GitHub 协作流程

标准功能开发流程：

```bash
git checkout develop
git pull origin develop

git checkout -b feature/employee-profile

git add .
git commit -m "feat: add employee profile module"

git push -u origin feature/employee-profile
```

GitHub 上的协作流程：

1. 从 `feature/*` 创建 Pull Request 到 `develop`。
2. GitHub Actions 自动执行 lint、test、build。
3. 开发负责人进行 Review。
4. 通过后 Squash Merge 或 Rebase Merge 到 `develop`。
5. 阶段完成后从 `develop` 创建 `release/vX.Y.Z`。
6. 验收通过后合并到 `main` 并创建 tag。
7. GitHub Release 归档版本说明、验收报告和部署包。

## 6. PR 合并策略

推荐策略：

- `feature/* -> develop`：Squash Merge，保持主线提交整洁。
- `fix/* -> develop`：Squash Merge，PR 标题使用规范 commit。
- `release/* -> main`：Merge Commit，保留发布合并记录。
- `hotfix/* -> main`：Merge Commit，随后同步回 `develop`。

PR 必填内容：

- 功能范围
- 影响模块
- 测试结果
- 数据库变更说明
- 截图或接口示例
- 验收关注点

PR 合并前检查：

- lint/test/build 通过
- 无高危安全问题
- 无未说明的数据库结构变更
- 核心流程已完成自测
- 文档或验收清单已同步

## 7. 回滚策略

普通功能回滚：

```bash
git revert <commit-sha>
git push origin develop
```

发布版本回滚：

```bash
git checkout main
git revert <release-merge-commit-sha>
git tag -a v1.0.1 -m "v1.0.1 rollback release"
git push origin main
git push origin v1.0.1
```

紧急修复流程：

```bash
git checkout main
git pull origin main

git checkout -b hotfix/fix-login-blocker
git add .
git commit -m "fix: resolve login blocker"
git push -u origin hotfix/fix-login-blocker
```

热修复合并到 `main` 后，必须同步回 `develop`：

```bash
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

## 8. 验收版本封版流程

封版命令模板：

```bash
git checkout develop
git pull origin develop

git checkout -b release/v1.0.0
git add .
git commit -m "chore: prepare v1.0.0 acceptance release"
git push -u origin release/v1.0.0
```

验收通过后：

```bash
git checkout main
git pull origin main
git merge release/v1.0.0

git tag -a v1.0.0 -m "v1.0.0 acceptance release"
git push origin main
git push origin v1.0.0
```

GitHub Release 归档内容：

- Release 标题：`人事全流程与组织效能管理系统 v1.0.0 验收版本`
- 版本说明：范围、修复、已知问题、部署说明
- 附件：需求规格、设计文档、测试报告、验收报告
- 验收结论：通过 / 有条件通过 / 不通过

## 9. GitHub Actions 建议

当前项目还处于资料规划阶段，暂不直接生成会失败的 CI 工作流。进入代码开发后建议增加：

- 前端：安装依赖、类型检查、lint、单元测试、构建
- 后端：依赖检查、单元测试、集成测试、打包
- 安全：依赖漏洞扫描、敏感信息扫描
- 发布：构建 Docker 镜像并推送镜像仓库

## 10. 当前项目可直接执行命令清单

首次初始化：

```bash
git init
git branch -M main
git add .
git commit -m "chore: initialize hr management project"
git checkout -b develop
```

创建功能分支：

```bash
git checkout develop
git checkout -b feature/employee-profile
```

提交功能：

```bash
git add .
git commit -m "feat: add employee profile module"
git push -u origin feature/employee-profile
```

发布验收：

```bash
git checkout develop
git checkout -b release/v1.0.0
git commit --allow-empty -m "chore: prepare v1.0.0 acceptance release"
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "v1.0.0 acceptance release"
```
