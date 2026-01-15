import { User } from '../types/user'
import { apiClient } from './apiClient'

export const userService = {
  async getUsersForAssignment(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/api/users/for-assignment')
    return response.data
  },
}
