# 🔧 Railway部署问题修复

## 问题描述
Railway构建失败，错误信息：
```
pip install -r requirements-production.txt
exit code: 127 (命令未找到)
```

## 根本原因
1. `nixpacks.toml`中设置了`skip = true`，这会跳过Nixpacks的默认Python环境设置
2. 当我们跳过默认设置后，pip命令还没有正确配置就尝试使用

## 解决方案
### 1. 重命名依赖文件
- `requirements.txt` → `requirements-dev.txt` (开发依赖)
- `requirements-production.txt` → `requirements.txt` (生产依赖)

这样Railway会自动检测并使用标准的`requirements.txt`文件。

### 2. 简化nixpacks.toml配置
```toml
[variables]
    NIXPACKS_PYTHON_VERSION = "3.11"

[phases.build]
    cmds = [
        "python manage.py collectstatic --noinput"
    ]

[start]
    cmd = "gunicorn petpal.wsgi:application --bind 0.0.0.0:$PORT --workers 3"
```

## 优势
- ✅ Railway自动处理Python环境和pip安装
- ✅ 更可靠的构建流程
- ✅ 保持了精简的生产依赖
- ✅ 自动收集静态文件
- ✅ 使用Gunicorn作为生产WSGI服务器

## 📝 额外修复：ConfigParser错误

### 问题描述
```
configparser.NoSectionError: No section: 'GoogleOAuth2'
```

### 解决方案
在Django settings.py中添加了try-catch处理，当config.ini文件不可用时自动使用环境变量：

```python
try:
    SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = CONFIG.get("GoogleOAuth2", "client_id")
    SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = CONFIG.get("GoogleOAuth2", "client_secret")
except:
    # Fallback to environment variables for production
    SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_OAUTH2_CLIENT_ID', '')
    SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_OAUTH2_CLIENT_SECRET', '')
```

### 优势
- ✅ 本地开发仍可使用config.ini
- ✅ 生产环境使用环境变量
- ✅ 向后兼容性好
- ✅ 不会再出现ConfigParser错误

## 📦 第三个修复：缺失的应用依赖

### 问题描述
```
ModuleNotFoundError: No module named 'googlemaps'
```

### 解决方案
在requirements.txt中添加了应用特定的依赖：

```
# Application specific dependencies
googlemaps==4.10.0
openai==1.10.0
regex==2023.10.3
Pillow==10.0.1
```

### 优势
- ✅ 包含了所有应用代码需要的包
- ✅ 使用稳定的版本号
- ✅ 避免了模块导入错误

## 🌐 第四个修复：ALLOWED_HOSTS错误

### 问题描述
```
DisallowedHost at /api
Invalid HTTP_HOST header: 'petpals-production-9218.up.railway.app'
```

### 解决方案
在Django settings.py中更新了ALLOWED_HOSTS配置：

```python
ALLOWED_HOSTS = [
    '127.0.0.1', 
    'localhost',
    '.railway.app',  # Allow all Railway subdomains
    '.vercel.app',   # Allow Vercel domains for CORS
]

# Add Railway public domain if available
if os.getenv('RAILWAY_PUBLIC_DOMAIN'):
    ALLOWED_HOSTS.append(os.getenv('RAILWAY_PUBLIC_DOMAIN'))
```

### 优势
- ✅ 支持所有Railway子域名
- ✅ 支持Vercel域名（用于CORS）
- ✅ 本地开发环境兼容
- ✅ 动态添加自定义域名

## 现在可以正常部署了！ 🚀