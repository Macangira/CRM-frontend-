// src/constants/index.ts
export const API_BASE_URL = 'http://127.0.0.1:8000'
export const APP_NAME = 'Enterprise CRM'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  USERS: '/users',
  USER_DETAILS: '/users/:id',
  USER_EDIT: '/users/:id/edit',
  USER_CREATE: '/users/create',
} as const
