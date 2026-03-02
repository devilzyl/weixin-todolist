# 微信小程序 TodoList

一个功能完整、界面现代的微信小程序任务管理应用，采用 TypeScript 开发，具有优雅的渐变设计和流畅的交互动画。

## ✨ 功能特性

- **任务管理**：创建、查看、完成任务
- **状态切换**：一键切换完成状态，带动画反馈
- **任务删除**：支持删除任务，带二次确认
- **数据持久化**：基于微信本地存储，离线可用
- **统计面板**：实时显示全部、已完成、待完成任务数量
- **现代设计**：渐变色卡片、圆角按钮、流畅动画
- **安全适配**：完美适配 iPhone 刘海屏和底部白条

## 🛠️ 技术栈

- **框架**：微信小程序原生框架
- **语言**：TypeScript 5.x
- **组件框架**：Glass-Easel
- **存储**：wx.getStorageSync / wx.setStorageSync

## 📁 项目结构

```
miniprogram/
├── app.ts                 # 小程序入口
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── pages/                # 页面目录
│   ├── index/           # 列表页
│   └── task-form/       # 新增任务页
├── types/               # 类型定义
│   └── todo.ts          # Todo 类型定义
└── utils/               # 工具函数
    └── todo-repository.ts  # 数据仓储层
```

## 🚀 快速开始

1. **克隆项目**
```bash
git clone https://github.com/devilzyl/weixin-todolist.git
```

2. **打开微信开发者工具**
   - 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 选择"导入项目"
   - 选择项目目录

3. **编译运行**
   - 微信开发者工具会自动编译 TypeScript
   - 点击"编译"按钮即可预览

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

---

**作者**: devilzyl
**项目地址**: https://github.com/devilzyl/weixin-todolist
