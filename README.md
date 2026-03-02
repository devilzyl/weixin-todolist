# 微信小程序 TodoList

一个功能完整、界面现代的微信小程序任务管理应用，采用 TypeScript 开发，具有优雅的渐变设计和流畅的交互动画。

![TodoList](https://img.shields.io/badge/微信小程序-TodoList-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

### 核心功能
- ✅ **任务管理**：创建、查看、编辑任务
- ✅ **状态切换**：一键切换任务完成状态，带动画反馈
- ✅ **任务删除**：支持删除任务，带二次确认
- ✅ **数据持久化**：基于微信本地存储，离线可用
- ✅ **统计面板**：实时显示全部、已完成、待完成任务数量

### UI/UX 特性
- 🎨 **现代设计**：渐变色卡片、圆角按钮、阴影效果
- 🌈 **多彩统计**：紫色、绿色、橙色三色统计卡片
- 🎭 **流畅动画**：复选框弹跳、按钮缩放、悬停效果
- 📱 **安全适配**：完美适配 iPhone 刘海屏和底部白条
- 🎯 **空态设计**：插画式空态页面，引导用户操作
- ⚡ **快速响应**：优化的 Hover 反馈和过渡动画

### 技术特性
- 🔒 **数据自愈**：存储数据自动校验和修复
- 🛡️ **操作锁**：防止快速连点导致的数据异常
- 🏗️ **仓储模式**：Repository 模式，便于扩展云存储
- 📝 **类型安全**：完整的 TypeScript 类型定义
- 🧪 **可测试**：清晰的代码结构，易于测试

## 🛠️ 技术栈

- **框架**：微信小程序原生框架
- **语言**：TypeScript 5.x
- **组件框架**：Glass-Easel
- **存储**：wx.getStorageSync / wx.setStorageSync
- **构建工具**：微信开发者工具

## 📁 项目结构

```
miniprogram/
├── app.ts                 # 小程序入口
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── pages/                # 页面目录
│   ├── index/           # 列表页
│   │   ├── index.ts     # 页面逻辑
│   │   ├── index.wxml   # 页面模板
│   │   ├── index.wxss   # 页面样式
│   │   └── index.json   # 页面配置
│   └── task-form/       # 新增任务页
│       ├── index.ts
│       ├── index.wxml
│       ├── index.wxss
│       └── index.json
├── types/               # 类型定义
│   └── todo.ts          # Todo 类型定义
└── utils/               # 工具函数
    └── todo-repository.ts  # 数据仓储层
```

## 🚀 快速开始

### 环境要求

- 微信开发者工具（最新稳定版）
- Node.js 14+（可选，用于开发工具）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/devilzyl/weixin-todolist.git
cd weixin-todolist
```

2. **打开微信开发者工具**
   - 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 选择"导入项目"
   - 选择项目目录 `E:\小程序\todolist`

3. **构建项目**
   - 微信开发者工具会自动编译 TypeScript
   - 点击"编译"按钮即可预览

4. **真机调试**
   - 点击工具栏的"预览"按钮
   - 使用微信扫描二维码
   - 在手机上查看效果

## 📸 功能展示

### 统计卡片
- 三张渐变色卡片展示任务统计
- 实时更新数据

### 任务列表
- 自定义圆形复选框
- 完成状态带删除线效果
- 滑动显示删除按钮

### 新增任务
- 简洁的表单设计
- 实时字数统计
- 大尺寸按钮，易于点击

### 空态页面
- 渐变圆形背景动画
- 引导用户创建第一个任务

## 🎯 开发规范

### 代码注释
- **所有代码注释使用中文**
- 使用 JSDoc 格式注释函数和方法
- 关键逻辑必须添加注释说明

### Git 提交
- **提交信息使用中文**
- 遵循约定式提交规范：
  - `feat`: 新功能
  - `fix`: Bug 修复
  - `refactor`: 重构
  - `perf`: 性能优化
  - `docs`: 文档更新

### 示例
```bash
feat: 添加任务排序功能
fix: 修复任务无法切换状态的问题
```

## 🔧 常见问题

### Q: 真机调试报错 `Unexpected token .`？
**A:** 微信小程序真机不支持可选链操作符 `?.`，需要使用三元运算符代替：
```typescript
// ❌ 错误
const total = todos?.length || 0

// ✅ 正确
const total = todos ? todos.length : 0
```

### Q: 页面显示空白？
**A:** 检查是否使用了 CSS 变量，微信小程序暂不支持。使用实际值代替。

### Q: 如何配置代理推送 GitHub？
**A:** 如果使用 Clash Verge，配置端口 7897：
```bash
git config --global http.proxy http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
```

## 📊 待办事项

- [ ] 支持任务编辑
- [ ] 添加任务分类
- [ ] 支持任务排序
- [ ] 添加任务搜索
- [ ] 接入云存储实现多端同步
- [ ] 添加任务提醒功能
- [ ] 支持任务备注

## 🤝 贡献指南

欢迎贡献代码、提出问题或建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🌟 致谢

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript](https://www.typescriptlang.org/)
- [Glass-Easel](https://github.com/Wechat-Glass-Easel/Glass-Easel)

---

**作者**: devilzyl
**项目地址**: https://github.com/devilzyl/weixin-todolist
**更新时间**: 2026-03-02

⭐ 如果这个项目对你有帮助，请给个 Star！
