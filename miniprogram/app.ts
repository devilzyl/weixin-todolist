/**
 * 小程序主入口
 */

import { migrateTodoData, needsMigration } from './utils/data-migration'

App<IAppOption>({
  /** 全局数据 */
  globalData: {},

  /**
   * 应用启动时的生命周期
   */
  onLaunch() {
    // 数据迁移：在应用启动时自动执行
    try {
      const todos = wx.getStorageSync('todos:v1') || []

      // 检查是否需要迁移
      if (needsMigration(todos)) {
        console.log('🔄 检测到旧版本数据，开始迁移...')

        const migratedTodos = migrateTodoData(todos)

        // 保存迁移后的数据
        wx.setStorageSync('todos:v1', migratedTodos)

        console.log('✅ 数据迁移完成')
      }
    } catch (error) {
      console.error('❌ 数据迁移失败:', error)
      // 不影响应用启动，只是记录日志
    }

    // TodoList 应用启动完成
  },
})
