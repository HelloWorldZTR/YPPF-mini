/**
 * 图书馆相关类型定义
 */

/**
 * 图书馆配置
 */
export interface LibraryConfig {
  /** 开放时间 */
  opening_hours?: string
  /** 其他配置信息 */
  [key: string]: any
}

/**
 * 书籍信息
 */
export interface Book {
  id: number
  /** 书名 */
  title: string
  /** 作者 */
  author?: string
  /** 出版社 */
  publisher?: string
  /** 身份码 */
  identity_code?: string
  /** 是否已归还 */
  returned?: boolean
  /** 其他字段 */
  [key: string]: any
}

/**
 * 借阅记录
 */
export interface LendRecordList {
  id: number
  /** 书籍信息 */
  book: Book | number
  /** 借阅时间 */
  lend_time?: string
  /** 归还时间 */
  return_time?: string | null
  /** 是否已归还 */
  returned?: boolean
  /** 其他字段 */
  [key: string]: any
}

/**
 * 图书馆欢迎页数据
 */
export interface LibraryWelcome {
  /** 活动列表 */
  activities?: any[]
  /** 开放时间 */
  opening_time?: string
  /** 借阅记录 */
  borrow_records?: LendRecordList[]
  /** 推荐书籍 */
  recommendations?: Book[]
  /** 其他字段 */
  [key: string]: any
}

/**
 * 推荐书籍查询参数
 */
export interface LibraryRecommendationsQuery {
  /** 是否返回最新书籍（而非随机推荐） */
  newest?: boolean
  /** 返回的最大书籍数量（默认：5） */
  num?: number
}

/**
 * 借阅记录查询参数
 */
export interface LibraryRecordsQuery {
  /** 按归还状态筛选（true/false/all） */
  returned?: 'all' | 'false' | 'true'
}

/**
 * 书籍搜索查询参数
 */
export interface LibrarySearchQuery {
  /** 作者（部分匹配） */
  author?: string
  /** 身份码（部分匹配） */
  identity_code?: string
  /** 关键词（在标题、作者、出版社、身份码中搜索） */
  keywords?: string
  /** 出版社（部分匹配） */
  publisher?: string
  /** 按归还状态筛选 */
  returned?: boolean
  /** 书名（部分匹配） */
  title?: string
}
