# 微信小程序 TodoList

基于 TypeScript 和 glass-easel 框架开发的现代任务管理应用，支持离线使用。

## 功能特性

- **任务管理**: 新增、编辑、删除、完成状态切换
- **批量操作**: 一键全部完成/取消、清除已完成
- **优先级**: 高/中/低三级优先级，带循环切换
- **筛选排序**: 按优先级筛选，支持多种排序方式
- **数据持久化**: 基于微信本地存储，离线可用
- **现代设计**: 渐变卡片、流畅动画、安全区域适配

## 技术栈

- **框架**: 微信小程序原生 + glass-easel
- **语言**: TypeScript (严格模式)

## 项目结构

```
miniprogram/
├── pages/          # 页面（列表、新增、编辑）
├── components/     # 可复用组件
├── utils/          # 工具模块（数据仓储）
└── types/          # TypeScript 类型定义
```

## 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/devilzyl/weixin-todolist.git
   ```

2. **打开微信开发者工具**
   - 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 导入项目目录

3. **运行**
   - TypeScript 自动编译
   - 点击"编译"按钮预览

## 许可证

MIT License

---

**作者**: devilzyl | **项目地址**: https://github.com/devilzyl/weixin-todolist
