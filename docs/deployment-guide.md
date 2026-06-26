# HR 管理系统部署说明

## 1. 运行环境

- Node.js 22.x
- npm 10.x
- Docker 26+
- Docker Compose v2

## 2. 环境变量

参考根目录 `.env.example`：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `FRONTEND_ORIGIN` | 后端 CORS 来源，多个地址用逗号分隔 | `http://localhost:5216,http://localhost:6216` |
| `VITE_API_BASE` | 前端 API 基础地址 | 空 |
| `PORT` | 后端本地端口 | `8216` |
| `DATABASE_URL` | PostgreSQL 连接串 | 本地数据库 |
| `REDIS_URL` | Redis 连接串 | `redis://localhost:6379` |
| `MINIO_ENDPOINT` | MinIO 地址 | `localhost` |
| `MINIO_PORT` | MinIO 端口 | `9000` |
| `MINIO_ACCESS_KEY` | MinIO 账号 | `hrminio` |
| `MINIO_SECRET_KEY` | MinIO 密码 | `hrminio123` |

## 3. 本地开发部署

```bash
npm install
npm run dev
```

访问：

- 前端：`http://localhost:5216`
- 前端预览：`http://localhost:6216`
- 后端：`http://localhost:8216/api/health`

## 4. 容器部署

### 4.1 启动

```bash
docker compose up -d --build
```

### 4.2 服务映射

- 前端：`http://localhost:5216`
- 后端：`http://localhost:8216/api/health`
- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`
- MinIO：`http://localhost:9000`
- MinIO Console：`http://localhost:9001`

## 5. 发布步骤建议

1. 拉取目标分支代码
2. 执行 `npm ci`
3. 执行 `npm run build`
4. 执行 `npm run test`
5. 更新环境变量
6. 执行 `docker compose up -d --build`
7. 检查健康检查和关键页面

## 6. 回滚策略

1. 保留上一个镜像标签
2. 新版本异常时回退到上一版本 compose 镜像
3. 若数据库结构有变更，先执行变更前备份
4. 回滚后重新验证 `/api/health` 和前端首页

## 7. 当前部署风险

1. 后端尚未接入真实 Prisma Client，容器重启后演示数据回到初始状态
2. 未建立数据库迁移、初始化和备份脚本
3. 未配置日志采集和告警
