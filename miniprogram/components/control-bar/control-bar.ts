/**
 * 控制栏组件 - 筛选和排序
 *
 * 提供优先级筛选器和排序选择器
 */
Component({
  /** 组件属性 */
  properties: {
    /** 当前筛选值: 'all' | 'high' | 'medium' | 'low' */
    filterValue: {
      type: String,
      value: 'all'
    },
    /** 当前排序值 */
    sortValue: {
      type: String,
      value: 'createdAt_desc'
    }
  },

  /** 组件数据 */
  data: {
    /** 筛选选项列表 */
    filterOptions: ['全部', '高优先级', '中优先级', '低优先级'],
    /** 筛选值映射 */
    filterValueMap: ['all', 'high', 'medium', 'low'],
    /** 排序选项列表 */
    sortOptions: ['最新创建', '最早创建', '高优先级', '低优先级'],
    /** 排序值映射 */
    sortValueMap: ['createdAt_desc', 'createdAt_asc', 'priority_desc', 'priority_asc']
  },

  /** 组件方法 */
  methods: {
    /**
     * 筛选器改变事件
     */
    onFilterChange(e: WechatMiniprogram.CustomEvent) {
      const index = e.detail.value
      const value = this.data.filterValueMap[index]
      this.triggerEvent('filterchange', { value })
    },

    /**
     * 排序器改变事件
     */
    onSortChange(e: WechatMiniprogram.CustomEvent) {
      const index = e.detail.value
      const value = this.data.sortValueMap[index]
      this.triggerEvent('sortchange', { value })
    }
  }
})
