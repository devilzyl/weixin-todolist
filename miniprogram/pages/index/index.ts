/**
 * TodoList 首页 - Apple 风格
 *
 * 单页极简模式，所有操作在首页完成
 */

import { LocalTodoRepository } from '../../utils/todo-repository'
import { getTheme, toggleTheme as toggleThemeUtil } from '../../utils/theme'
import type { TodoItem, TodoPriority, TodoCategory } from '../../types/todo'

/** 仓储实例 */
const repository = new LocalTodoRepository()

Component({
  /** 页面数据 */
  data: {
    /** 当前主题 */
    theme: 'light' as 'light' | 'dark',
    /** 任务列表 */
    todos: [] as TodoItem[],
    /** 已完成任务数 */
    completedCount: 0,
    /** 待完成任务数 */
    pendingCount: 0,
    /** 格式化日期 */
    formattedDate: '',
    /** 是否显示底部面板 */
    showSheet: false,
    /** 面板标题 */
    sheetTitle: '',
    /** 当前编辑的任务 */
    editingTodo: null as TodoItem | null,
    /** 分类标签映射 */
    categoryLabels: {
      work: '工作',
      personal: '个人',
      default: '默认',
    } as Record<TodoCategory, string>,
  },

  /** 组件生命周期 */
  lifetimes: {
    attached() {
      // 加载主题设置
      this.setData({ theme: getTheme() })
      // 加载任务列表
      this.loadTodos()
      // 设置日期
      this.setDate()
    },
  },

  /** 页面方法 */
  methods: {
    /**
     * 加载任务列表
     */
    loadTodos() {
      const todos = repository.list()
      this.setData({
        todos,
        completedCount: todos.filter((t) => t.completed).length,
        pendingCount: todos.filter((t) => !t.completed).length,
      })
    },

    /**
     * 设置日期显示
     */
    setDate() {
      const now = new Date()
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const formatted = `${weekdays[now.getDay()]} · ${now.getMonth() + 1}月${now.getDate()}日`
      this.setData({ formattedDate: formatted })
    },

    /**
     * 切换主题
     */
    toggleTheme() {
      const newTheme = toggleThemeUtil()
      this.setData({ theme: newTheme })
    },

    /**
     * 切换任务完成状态
     */
    onToggle(e: WechatMiniprogram.TouchEventTap) {
      const { id } = e.currentTarget.dataset
      if (!id) return

      repository.toggle(id)
      this.loadTodos()
    },

    /**
     * 长按任务项，显示操作菜单
     */
    onLongPress(e: WechatMiniprogram.TouchEventTap) {
      const { id } = e.currentTarget.dataset
      if (!id) return

      // 显示操作菜单
      wx.showActionSheet({
        itemList: ['编辑', '删除'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 编辑
            this.onEdit(id)
          } else if (res.tapIndex === 1) {
            // 删除
            this.onDelete(id)
          }
        },
      })
    },

    /**
     * 显示添加任务面板
     */
    onAddTask() {
      this.setData({
        sheetTitle: '添加任务',
        editingTodo: null,
        showSheet: true,
      })
    },

    /**
     * 编辑任务
     */
    onEdit(todoId: string) {
      const todo = this.data.todos.find((t) => t.id === todoId)
      if (todo) {
        this.setData({
          sheetTitle: '编辑任务',
          editingTodo: todo,
          showSheet: true,
        })
      }
    },

    /**
     * 删除任务
     */
    onDelete(todoId: string) {
      wx.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除这个任务吗？',
        success: (res) => {
          if (res.confirm) {
            repository.remove(todoId)
            this.loadTodos()
            wx.showToast({
              title: '已删除',
              icon: 'success',
            })
          }
        },
      })
    },

    /**
     * 保存任务（从表单组件触发）
     */
    onSaveTask(e: WechatMiniprogram.CustomEvent) {
      const { title, content, priority, category } = e.detail as {
        title: string
        content: string
        priority: TodoPriority
        category: TodoCategory
      }

      if (this.data.editingTodo) {
        // 编辑模式
        repository.update({
          id: this.data.editingTodo.id,
          title,
          content,
          priority,
          category,
        })
      } else {
        // 新增模式
        repository.create({
          title,
          content,
          priority,
          category,
        })
      }

      this.setData({ showSheet: false })
      this.loadTodos()

      wx.showToast({
        title: this.data.editingTodo ? '已更新' : '已添加',
        icon: 'success',
      })
    },

    /**
     * 关闭底部面板
     */
    onSheetClose() {
      this.setData({ showSheet: false })
    },
  },
})
