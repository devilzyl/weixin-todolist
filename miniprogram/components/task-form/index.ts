/**
 * 任务表单组件
 *
 * 用于创建和编辑任务的表单组件
 */

import type { TodoPriority, TodoCategory } from '../../types/todo'

Component({
  properties: {
    /** 要编辑的任务（如果有值则是编辑模式） */
    todo: {
      type: Object,
      value: null,
    },
    /** 当前主题 */
    theme: {
      type: String,
      value: 'light',
    },
  },
  data: {
    /** 任务标题 */
    title: '',
    /** 任务描述 */
    content: '',
    /** 优先级 */
    priority: 'medium' as TodoPriority,
    /** 分类 */
    category: 'default' as TodoCategory,
  },
  lifetimes: {
    attached() {
      // 每次打开都重置表单数据
      this.resetForm()
    },
  },
  observers: {
    todo(newTodo) {
      if (newTodo) {
        // 编辑模式：填充数据
        this.setData({
          title: newTodo.title,
          content: newTodo.content || '',
          priority: newTodo.priority,
          category: newTodo.category,
        })
      } else {
        // 新增模式：重置数据
        this.resetForm()
      }
    },
  },
  methods: {
    /** 重置表单数据 */
    resetForm() {
      this.setData({
        title: '',
        content: '',
        priority: 'medium',
        category: 'default',
      })
    },
    /** 标题输入 */
    onTitleInput(e: WechatMiniprogram.InputInput) {
      this.setData({ title: e.detail.value })
    },
    /** 描述输入 */
    onContentInput(e: WechatMiniprogram.TextareaInput) {
      this.setData({ content: e.detail.value })
    },
    /** 优先级选择 */
    onPriorityChange(e: WechatMiniprogram.TouchEventTap) {
      const priority = e.currentTarget.dataset.value as TodoPriority
      this.setData({ priority })
    },
    /** 分类选择 */
    onCategoryChange(e: WechatMiniprogram.TouchEventTap) {
      const category = e.currentTarget.dataset.value as TodoCategory
      this.setData({ category })
    },
    /** 保存任务 */
    onSave() {
      if (!this.data.title.trim()) {
        wx.showToast({ title: '请输入标题', icon: 'none' })
        return
      }
      this.triggerEvent('save', {
        title: this.data.title.trim(),
        content: this.data.content.trim(),
        priority: this.data.priority,
        category: this.data.category,
      })
    },
  },
})
