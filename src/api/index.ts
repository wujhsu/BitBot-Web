import axios from 'axios'
import type { UploadFile, AnalysisTask, ApiResponse, ApiError } from '../types'
import { useSessionStore } from '../stores/session'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // 直接连接后端API
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加会话ID到请求头
    try {
      const sessionStore = useSessionStore()
      if (sessionStore.sessionId) {
        config.headers['X-Session-ID'] = sessionStore.sessionId
      }
    } catch (error) {
      console.warn('Failed to add session ID to request:', error)
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data)
    
    // 统一错误处理
    const apiError: ApiError = {
      error_code: error.response?.status?.toString() || 'NETWORK_ERROR',
      error_message: error.response?.data?.error_message || error.message || '网络错误',
      details: error.response?.data?.details,
      timestamp: new Date().toISOString()
    }
    
    return Promise.reject(apiError)
  }
)

// 文件上传API
export const uploadFile = async (file: File): Promise<UploadFile> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post<UploadFile>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log('Upload progress:', progress + '%')
      }
    }
  })
  
  return response.data
}

// 启动分析API
export const startAnalysis = async (fileId: string, options?: Record<string, any>): Promise<AnalysisTask> => {
  const response = await api.post<AnalysisTask>('/analyze', {
    file_id: fileId,
    options: options || {}
  })
  
  return response.data
}

// 获取分析状态API
export const getAnalysisStatus = async (taskId: string): Promise<AnalysisTask> => {
  const response = await api.get<AnalysisTask>(`/analysis/${taskId}`)
  return response.data
}

// 获取PDF文件URL
export const getPdfUrl = (fileId: string): string => {
  return `http://localhost:8000/api/pdf/${fileId}`
}

// 获取文件下载URL
export const getDownloadUrl = (fileId: string, fileType: 'original' | 'pdf' = 'pdf'): string => {
  return `http://localhost:8000/api/download/${fileId}?file_type=${fileType}`
}

// 健康检查API
export const healthCheck = async (): Promise<any> => {
  const response = await api.get('/health')
  return response.data
}

// 获取文件信息API
export const getFileInfo = async (fileId: string): Promise<UploadFile> => {
  const response = await api.get<UploadFile>(`/files/${fileId}`)
  return response.data
}

export default api
