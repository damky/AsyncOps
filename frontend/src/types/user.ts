export interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'member'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}
