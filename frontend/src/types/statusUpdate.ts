import { User } from './user'

export interface StatusUpdate {
  id: number
  user_id: number
  title: string
  content: string
  tags?: string[] | null
  created_at: string
  updated_at: string
  user?: User | null
}

export interface StatusUpdateCreate {
  title: string
  content: string
  tags?: string[] | null
}

export interface StatusUpdateUpdate {
  title?: string
  content?: string
  tags?: string[] | null
}

export interface StatusUpdateList {
  items: StatusUpdate[]
  total: number
  page: number
  limit: number
}
