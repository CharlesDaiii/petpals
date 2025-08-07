# 🚀 PetPals 部署指南

## 📋 部署概览
- **前端**: Vercel (React应用)
- **后端**: Railway (Django API)
- **数据库**: Railway PostgreSQL

## 🌐 Vercel前端部署

### 1. 环境变量配置
在Vercel Dashboard的Environment Variables中设置：

```bash
REACT_APP_BACKEND_URL=https://your-railway-backend.railway.app
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id  
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. 部署步骤
1. **推送代码**到GitHub仓库
2. **导入项目**：在Vercel Dashboard中导入GitHub仓库
3. **配置设置**：
   - Root Directory: `/` (项目根目录)
   - Build Command: `npm run vercel-build` (自动检测)
   - Output Directory: `build` (自动检测)
4. **设置环境变量**（参考上面的配置）
5. **部署**：点击Deploy

### 3. 自动部署
- Vercel会自动监听GitHub仓库的push事件
- 每次推送到main分支会自动触发部署

## 🚂 Railway后端部署

### 1. 环境变量配置
在Railway Dashboard的Variables中设置：

```bash
# Django核心配置
DJANGO_SECRET_KEY=your_super_secret_django_key_here
DEBUG=False
FRONTEND_URL=https://your-vercel-app.vercel.app

# 数据库 (Railway自动提供)
DATABASE_URL=postgresql://username:password@host:port/database

# OAuth配置
GOOGLE_OAUTH2_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=your_google_oauth_client_secret

# API密钥
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENAI_API_KEY=your_openai_api_key

# 可选：额外的前端URL (如果有多个域名)
ADDITIONAL_FRONTEND_URLS=https://example.com,https://www.example.com
```

### 2. 部署步骤
1. **推送代码**到GitHub仓库
2. **创建新项目**：在Railway Dashboard中"New Project"
3. **导入仓库**：选择"Deploy from GitHub repo"
4. **配置设置**：
   - Root Directory: `petpal`
   - 选择使用 `requirements-production.txt`
5. **添加数据库**：
   - 点击"Add Service" → "Database" → "PostgreSQL"
   - Railway会自动设置DATABASE_URL环境变量
6. **设置环境变量**（参考上面的配置）
7. **部署**：Railway会自动开始部署

### 3. 部署后验证
- 检查Logs确保migrations运行成功
- 访问Railway提供的URL确认API正常工作
- 测试OAuth登录流程

## 🔧 配置详情

### CORS配置
后端已配置支持分离部署：
- 自动识别Railway环境
- 支持Vercel域名的跨域请求
- 包含开发环境localhost支持

### 静态文件处理
- 使用WhiteNoise处理静态文件
- 自动压缩和缓存
- 支持Railway的文件系统

### 数据库迁移
- Railway自动运行migrations
- 支持PostgreSQL生产环境
- 本地开发可继续使用SQLite

## 🛠️ 本地开发设置

### 前端开发
```bash
# 安装依赖
npm install

# 创建环境变量文件
# 创建 .env.local 文件并添加：
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# 启动开发服务器
npm start
```

### 后端开发
```bash
cd petpal

# 安装依赖 (建议使用虚拟环境)
pip install -r requirements-production.txt

# 创建本地环境变量文件 (.env)
# 参考 .env.template 文件

# 运行迁移
python manage.py migrate

# 启动开发服务器
python manage.py runserver
```

## 🔍 故障排除

### 常见问题

1. **CORS错误**
   - 确保FRONTEND_URL环境变量设置正确
   - 检查Vercel部署的实际URL

2. **OAuth登录失败**
   - 验证Google OAuth配置
   - 确保redirect URI包含Railway域名

3. **静态文件404**
   - 运行 `python manage.py collectstatic`
   - 检查STATIC_ROOT配置

4. **数据库连接失败**
   - 验证DATABASE_URL格式
   - 确保PostgreSQL服务已启动

### 日志查看
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Functions → Edge Logs

## 📝 部署检查清单

### Vercel前端
- [ ] 代码推送到GitHub
- [ ] Vercel项目已创建并连接
- [ ] 环境变量已设置
- [ ] 构建成功，网站可访问
- [ ] API调用正常工作

### Railway后端  
- [ ] 代码推送到GitHub
- [ ] Railway项目已创建
- [ ] PostgreSQL数据库已添加
- [ ] 环境变量已设置
- [ ] 部署成功，API可访问
- [ ] 数据库迁移完成
- [ ] OAuth登录流程正常

### 集成测试
- [ ] 前端可以调用后端API
- [ ] 用户注册/登录正常
- [ ] 图片上传功能正常
- [ ] Google Maps集成正常

完成后，您的PetPals应用就可以在生产环境中运行了！ 🎉