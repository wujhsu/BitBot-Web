import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSessionStore = defineStore('session', () => {
  // 生成会话ID的函数
  const generateSessionId = (): string => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10) // 确保至少8位
    return `session_${timestamp}_${randomId}`
  }

  // 从sessionStorage获取或生成新的会话ID（每个标签页独立）
  const getOrCreateSessionId = (): string => {
    try {
      // 优先使用sessionStorage，确保每个标签页独立
      const sessionStored = sessionStorage.getItem('bidbot_session_id')
      if (sessionStored && sessionStored.startsWith('session_')) {
        console.log('使用现有标签页会话ID:', sessionStored)
        return sessionStored
      }

      // 如果sessionStorage中没有，检查localStorage（用于持久化）
      const localStored = localStorage.getItem('bidbot_last_session_id')
      if (localStored && localStored.startsWith('session_')) {
        // 基于上次的会话ID生成新的会话ID（确保每个标签页独立）
        console.log('基于上次会话生成新的标签页会话ID')
      }
    } catch (error) {
      console.warn('Failed to read session ID from storage:', error)
    }

    // 生成新的会话ID
    const newSessionId = generateSessionId()
    try {
      // 保存到sessionStorage（标签页级别）
      sessionStorage.setItem('bidbot_session_id', newSessionId)
      // 同时保存到localStorage作为备份
      localStorage.setItem('bidbot_last_session_id', newSessionId)
      console.log('生成新的标签页会话ID:', newSessionId)
    } catch (error) {
      console.warn('Failed to save session ID to storage:', error)
    }

    return newSessionId
  }

  // 状态
  const sessionId = ref<string>(getOrCreateSessionId())
  const sessionStartTime = ref<Date>(new Date())

  // 计算属性
  const isValidSession = computed(() => {
    return sessionId.value && sessionId.value.startsWith('session_')
  })

  // 获取会话信息
  const getSessionInfo = () => {
    return {
      sessionId: sessionId.value,
      startTime: sessionStartTime.value,
      isValid: isValidSession.value
    }
  }

  // 重新生成会话ID（用于新会话）
  const renewSession = () => {
    const newSessionId = generateSessionId()
    sessionId.value = newSessionId
    sessionStartTime.value = new Date()

    try {
      sessionStorage.setItem('bidbot_session_id', newSessionId)
      localStorage.setItem('bidbot_last_session_id', newSessionId)
    } catch (error) {
      console.warn('Failed to save new session ID to storage:', error)
    }

    console.log('Session renewed:', newSessionId)
    return newSessionId
  }

  // 清除会话
  const clearSession = () => {
    try {
      sessionStorage.removeItem('bidbot_session_id')
      localStorage.removeItem('bidbot_last_session_id')
    } catch (error) {
      console.warn('Failed to clear session ID from storage:', error)
    }

    const newSessionId = generateSessionId()
    sessionId.value = newSessionId
    sessionStartTime.value = new Date()

    try {
      sessionStorage.setItem('bidbot_session_id', newSessionId)
      localStorage.setItem('bidbot_last_session_id', newSessionId)
      // 设置标记，表示下次请求需要强制使用新会话
      sessionStorage.setItem('bidbot_force_new_session', 'true')
    } catch (error) {
      console.warn('Failed to save new session ID to storage:', error)
    }

    console.log('Session cleared and regenerated:', newSessionId)
  }

  // 检查是否需要强制新会话
  const shouldForceNewSession = (): boolean => {
    try {
      const forceNew = sessionStorage.getItem('bidbot_force_new_session')
      if (forceNew === 'true') {
        // 清除标记，避免重复使用
        sessionStorage.removeItem('bidbot_force_new_session')
        return true
      }
    } catch (error) {
      console.warn('Failed to check force new session flag:', error)
    }
    return false
  }

  // 验证会话ID格式
  const validateSessionId = (id: string): boolean => {
    return Boolean(id && id.startsWith('session_') && id.length > 10)
  }

  return {
    // 状态
    sessionId,
    sessionStartTime,
    
    // 计算属性
    isValidSession,
    
    // 方法
    getSessionInfo,
    renewSession,
    clearSession,
    validateSessionId,
    shouldForceNewSession
  }
})
