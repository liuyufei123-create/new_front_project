import { defineStore } from 'pinia'
import { http } from '../api/http'
import type { AuthUser } from '../types/models'

interface LoginPayload {
  username: string
  password: string
}

const TOKEN_KEY = 'student-management-token'
const USER_KEY = 'student-management-user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: (localStorage.getItem(USER_KEY)
      ? JSON.parse(localStorage.getItem(USER_KEY) as string)
      : null) as AuthUser | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role === 'ADMIN',
  },
  actions: {
    persistSession() {
      if (this.token) {
        localStorage.setItem(TOKEN_KEY, this.token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }

      if (this.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    },
    async login(payload: LoginPayload) {
      const { data } = await http.post<{ accessToken: string; user: AuthUser }>('/auth/login', payload)
      this.token = data.accessToken
      this.user = data.user
      this.persistSession()
      return data.user
    },
    async fetchProfile() {
      const { data } = await http.get<AuthUser>('/auth/profile')
      this.user = data
      this.persistSession()
      return data
    },
    logout() {
      this.token = ''
      this.user = null
      this.persistSession()
    },
  },
})
