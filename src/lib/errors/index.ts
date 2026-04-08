/**
 * Neo application error types and utilities
 */

/**
 * Base Neo error class
 */
export class NeoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NeoError';
  }
}

/**
 * Matrix API errors
 */
export class MatrixError extends NeoError {
  constructor(
    message: string,
    public readonly matrixCode?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'MATRIX_ERROR', context);
    this.name = 'MatrixError';
  }
}

/**
 * Authentication errors
 */
export class AuthError extends NeoError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTH_ERROR', context);
    this.name = 'AuthError';
  }
}

/**
 * Network/connection errors
 */
export class NetworkError extends NeoError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends NeoError {
  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * Storage errors
 */
export class StorageError extends NeoError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Create a user-friendly error message
   */
  toUserFriendly(error: unknown, language: string = 'tr'): string {
    if (error instanceof NeoError) {
      // Already a Neo error with user-friendly message
      return error.message;
    }
    
    if (error instanceof Error) {
      // Generic JavaScript error
      const message = error.message.toLowerCase();
      
      if (language === 'tr') {
        // Turkish translations for common errors
        if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
          return 'Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.';
        }
        if (message.includes('timeout')) {
          return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        }
        if (message.includes('unauthorized') || message.includes('401')) {
          return 'Yetkiniz yok. Lütfen tekrar giriş yapın.';
        }
        if (message.includes('forbidden') || message.includes('403')) {
          return 'Erişim engellendi. Bu işlem için yetkiniz yok.';
        }
        if (message.includes('not found') || message.includes('404')) {
          return 'İstenen kaynak bulunamadı.';
        }
        if (message.includes('server') || message.includes('500')) {
          return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        }
      }
      
      // Fallback to original message
      return error.message;
    }
    
    // Unknown error
    return language === 'tr' 
      ? 'Beklenmeyen bir hata oluştu.' 
      : 'An unexpected error occurred.';
  },
  
  /**
   * Log error with context
   */
  logError(error: unknown, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('Neo Error:', error);
      if (context) {
        console.error('Error Context:', context);
      }
      
      if (error instanceof NeoError && error.context) {
        console.error('Error Metadata:', error.context);
      }
    }
    // In production, you might want to send to error tracking service
  },
  
  /**
   * Check if error is recoverable
   */
  isRecoverable(error: unknown): boolean {
    if (error instanceof NetworkError) {
      return true; // Network errors are usually recoverable
    }
    
    if (error instanceof NeoError) {
      const unrecoverableCodes = ['AUTH_ERROR', 'VALIDATION_ERROR'];
      return !unrecoverableCodes.includes(error.code);
    }
    
    // Unknown errors assumed to be unrecoverable
    return false;
  },
};