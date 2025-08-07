#!/bin/bash

# PetPals 快速部署脚本
echo "🚀 准备部署 PetPals 到 Vercel 和 Railway..."

# 检查必要文件
echo "📋 检查配置文件..."
required_files=(
    "vercel.json"
    "petpal/requirements-production.txt"
    "petpal/Procfile"
    "petpal/railway.json"
    "petpal/petpal/settings_production.py"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ 缺少文件: $file"
        exit 1
    fi
done

echo "✅ 所有配置文件存在"

# 检查环境变量模板
echo "🔍 检查环境变量配置..."
if [[ ! -f "petpal/.env.template" ]]; then
    echo "⚠️  建议创建 .env.template 文件用于本地开发"
fi

# 显示下一步操作
echo ""
echo "📝 接下来的步骤："
echo "1. 推送代码到 GitHub:"
echo "   git add ."
echo "   git commit -m 'Configure for Vercel and Railway deployment'"
echo "   git push origin main"
echo ""
echo "2. 在 Vercel 中部署前端:"
echo "   - 访问 https://vercel.com/new"
echo "   - 导入您的 GitHub 仓库"
echo "   - 设置环境变量 (参考 DEPLOYMENT.md)"
echo ""
echo "3. 在 Railway 中部署后端:"
echo "   - 访问 https://railway.app/new"
echo "   - 从 GitHub 导入仓库"
echo "   - 设置根目录为 'petpal'"
echo "   - 添加 PostgreSQL 数据库"
echo "   - 设置环境变量 (参考 DEPLOYMENT.md)"
echo ""
echo "📖 详细说明请查看 DEPLOYMENT.md"
echo "🎉 配置完成！准备部署！"