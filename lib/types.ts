export type Post = {
  id: string
  content: string
  author: string
  avatar?: string
}

export type Pagination = {
  page: number
  limit: number
}
