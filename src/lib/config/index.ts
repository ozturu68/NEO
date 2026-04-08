/**
 * Neo application configuration
 * 
 * Centralized configuration management with environment-specific defaults
 */

export interface NeoConfig {
  // Matrix server configuration
  matrix: {
    defaultServer: string;
    defaultHomeserver: string;
    elementCallServer: string;
    rtcServer: string;
  };
  
  // Application settings
  app: {
    name: string;
    version: string;
    defaultLanguage: string;
    supportedLanguages: string[];
  };
  
  // Feature flags
  features: {
    enableVoIP: boolean;
    enableE2EE: boolean;
    enableNotifications: boolean;
    enableDebugLogging: boolean;
  };
  
  // UI/UX settings
  ui: {
    defaultTheme: 'light' | 'dark' | 'auto';
    sidebarDefaultWidth: number;
    sidebarCollapsedWidth: number;
    animationDuration: number;
  };
}

/**
 * Default configuration (development)
 */
const defaultConfig: NeoConfig = {
  matrix: {
    defaultServer: 'https://matrix.ozturu.com',
    defaultHomeserver: 'matrix.ozturu.com',
    elementCallServer: 'https://element.ozturu.com',
    rtcServer: 'https://rtc.ozturu.com',
  },
  
  app: {
    name: 'Neo',
    version: '0.1.0',
    defaultLanguage: 'tr',
    supportedLanguages: ['tr', 'en'],
  },
  
  features: {
    enableVoIP: true,
    enableE2EE: true,
    enableNotifications: true,
    enableDebugLogging: process.env.NODE_ENV === 'development',
  },
  
  ui: {
    defaultTheme: 'light',
    sidebarDefaultWidth: 256,
    sidebarCollapsedWidth: 64,
    animationDuration: 200,
  },
};

/**
 * Production configuration overrides
 */
const productionConfig: Partial<NeoConfig> = {
  features: {
    enableVoIP: true,
    enableE2EE: true,
    enableNotifications: true,
    enableDebugLogging: false,
  },
};

/**
 * Development configuration overrides
 */
const developmentConfig: Partial<NeoConfig> = {
  features: {
    enableVoIP: true,
    enableE2EE: true,
    enableNotifications: true,
    enableDebugLogging: true,
  },
};

/**
 * Get environment-specific configuration
 */
export function getConfig(): NeoConfig {
  const baseConfig = { ...defaultConfig };
  const env = process.env.NODE_ENV || 'development';
  
  let envConfig: Partial<NeoConfig> = {};
  
  switch (env) {
    case 'production':
      envConfig = productionConfig;
      break;
    case 'development':
    default:
      envConfig = developmentConfig;
      break;
  }
  
  // Deep merge configuration (simple approach for nested objects)
  return {
    ...baseConfig,
    ...envConfig,
    matrix: { ...baseConfig.matrix, ...envConfig.matrix },
    app: { ...baseConfig.app, ...envConfig.app },
    features: { ...baseConfig.features, ...envConfig.features },
    ui: { ...baseConfig.ui, ...envConfig.ui },
  };
}

/**
 * Singleton configuration instance
 */
export const config = getConfig();

/**
 * Helper to check if running in development mode
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Helper to check if running in Tauri environment
 */
export const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;