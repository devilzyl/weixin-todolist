# 微信小程序 TodoList

一个功能完整、界面现代的微信小程序任务管理应用，采用 TypeScript 开发，具有优雅的渐变设计和流畅的交互动画。

## ✨ 功能特性

### 核心功能
- **创建任务**：点击右下角浮动按钮创建新任务
- **编辑任务**：点击任务项的 ✏️ 图标编辑任务标题
- **状态切换**：点击任务左侧区域切换完成状态，带动画反馈
- **删除任务**：点击任务项的 🗑️ 图标删除任务，带二次确认

### 批量操作
- **全部完成**：一键将所有任务标记为已完成
- **全部取消**：一键将所有任务标记为未完成
- **清除已完成**：批量删除所有已完成的任务（含二次确认）

### 设计特性
- **数据持久化**：基于微信本地存储，离线可用
- **统计面板**：实时显示全部、已完成、待完成任务数量
- **现代设计**：渐变色卡片、圆角按钮、流畅动画
- **安全适配**：完美适配 iPhone 刘海屏和底部白条
- **仓储模式**：数据层抽象，易于迁移到云开发

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
│   ├── index/           # 列表页（主页面）
│   ├── task-form/       # 新增任务页
│   └── task-edit/       # 编辑任务页
├── types/               # 类型定义
│   └── todo.ts          # Todo 类型定义和仓储接口
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
