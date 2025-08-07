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

## 现在可以正常部署了！ 🚀