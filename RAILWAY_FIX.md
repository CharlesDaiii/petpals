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

## 现在可以正常部署了！ 🚀