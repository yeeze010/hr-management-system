# Git 与 GitHub 工程规范

## 仓库信息

- 本地分支：`develop`
- 远程仓库：`https://github.com/yeeze010/hr-management-system.git`

## 分支模型

| 分支 | 用途 | 保护规则 |
|---|---|---|
| `main` | 正式验收和发布版本 | 禁止直接 push，必须 PR |
| `develop` | 日常集成分支 | 必须通过 CI |
| `feature/*` | 功能开发 | 合并到 `develop` |
| `fix/*` | 缺陷修复 | 合并到 `develop` |
| `release/*` | 发布验收 | 合并到 `main` 和 `develop` |
| `hotfix/*` | 生产紧急修复 | 合并到 `main` 后同步 `develop` |

## Commit Message

采用 Conventional Commits：

- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档变更
- `style:` 格式调整
- `refactor:` 重构
- `test:` 测试
- `chore:` 配置、依赖、脚手架
- `ci:` CI/CD
- `perf:` 性能优化
- `revert:` 回滚

示例：

```bash
feat: add employee contract management
fix: correct leave balance validation
docs: update acceptance checklist
ci: add github actions workflow
```

## PR 规范

PR 标题使用规范 commit 格式，例如：

```text
feat: add employee certificate module
```

PR 描述必须包含：

- 变更范围
- 影响模块
- 测试结果
- 数据库变更
- 截图或接口示例
- 验收关注点

## Review 策略

- 至少 1 名同模块开发 Review。
- 涉及权限、薪酬、附件、审计的 PR 需要负责人 Review。
- 涉及 UI 的 PR 需要产品或设计验收。
- 涉及数据库迁移的 PR 必须说明回滚方案。

## GitHub Actions 建议

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm audit --audit-level=moderate
```

## Release 规范

| 版本 | 内容 |
|---|---|
| `v0.1.0` | 工程骨架和基础文档 |
| `v0.3.0` | 登录权限、组织岗位、员工档案 |
| `v0.5.0` | 合同证书、入转调离、考勤假勤 |
| `v0.8.0` | 绩效培训、报表、附件审计、UAT |
| `v1.0.0` | 正式验收版本 |

## GitHub 协作闭环

1. Issue 记录需求、缺陷、技术债。
2. 分支关联 Issue。
3. PR 关联 Issue 并触发 CI。
4. Review 通过后合并。
5. Release 分支完成 UAT。
6. `main` 打 tag 并创建 GitHub Release。
7. 验收文档和测试报告作为 Release 附件归档。
