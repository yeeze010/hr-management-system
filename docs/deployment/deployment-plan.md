# 部署方案

## 环境规划

| 环境 | 用途 | 地址建议 | 数据 |
|---|---|---|---|
| 本地开发 | 开发联调 | `localhost:5216` / `localhost:8216` | 本地样例数据 |
| 测试环境 | 测试验证 | `test-hr.example.com` | 脱敏测试数据 |
| 预生产 | 上线演练 | `pre-hr.example.com` | 准生产数据 |
| 生产 | 正式使用 | `hr.example.com` | 生产数据 |

## 容器组件

| 组件 | 镜像/技术 | 说明 |
|---|---|---|
| frontend | Nginx + 静态资源 | 承载 Vue 构建产物 |
| backend | Node.js + NestJS | REST API |
| postgres | PostgreSQL 16 | 主业务库 |
| redis | Redis 7 | 缓存、锁、队列 |
| minio | MinIO | 附件对象存储 |
| nginx | Nginx | 反向代理与 TLS |

## 本地启动

```bash
npm install
npm run build
npm run dev
```

访问：

- 前端：http://localhost:5216
- 前端预览：http://localhost:6216
- 后端健康检查：http://localhost:8216/api/health

## Docker 启动

```bash
docker compose up -d --build
```

访问：

- 前端：http://localhost:5216
- 后端：http://localhost:8216/api/health
- MinIO 控制台：http://localhost:9001

## 发布流程

1. 从 `develop` 创建 `release/vX.Y.Z`。
2. GitHub Actions 执行构建、测试、安全检查。
3. 部署到测试环境。
4. UAT 通过后部署到预生产。
5. 执行数据库迁移、附件存储检查、健康检查。
6. 验收通过后合并到 `main`。
7. 创建 Git tag 和 GitHub Release。

## 备份与恢复

| 对象 | 策略 |
|---|---|
| PostgreSQL | 每日全量备份，关键发布前手动备份 |
| MinIO | 每日对象存储备份，保留 30 天 |
| Redis | 不作为唯一持久化来源，必要时开启 RDB |
| 配置 | `.env` 由环境密钥管理，禁止提交真实凭证 |

## 监控与告警

- 后端健康检查：`/api/health`
- 数据库连接失败告警。
- MinIO 不可用告警。
- API 5xx 错误率告警。
- 导出任务失败告警。
- 审批通知发送失败告警。

## 回滚方案

1. 保留上一个稳定 Docker 镜像 tag。
2. 生产发布前备份数据库。
3. 应用回滚先切回上一版本镜像。
4. 数据库迁移如不可逆，必须走补偿脚本。
5. 回滚后创建 GitHub Incident 记录原因和处理结论。
