type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  message: string;
  namespace: string;
  level: LogLevel;
  timestamp: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private formatLog({ namespace, level, message, timestamp, data }: LogPayload) {
    const colorMap: Record<LogLevel, string> = {
      info: 'color: #006D2F; font-weight: bold;',
      warn: 'color: #D97706; font-weight: bold;',
      error: 'color: #DC2626; font-weight: bold;',
      debug: 'color: #1B1B1B; font-weight: bold; background: #f3f3f3; padding: 2px 4px;',
    };

    const header = `%c[${namespace}][${level.toUpperCase()}]`;
    const time = `%c ${timestamp}`;
    
    if (data) {
      console.groupCollapsed(`${header}${time} %c${message}`, colorMap[level], 'color: gray;', 'color: inherit;');
      console.log('Timestamp:', timestamp);
      console.log('Namespace:', namespace);
      console.log('Level:', level);
      console.log('Payload:', data);
      console.groupEnd();
    } else {
      console.log(`${header}${time} %c${message}`, colorMap[level], 'color: gray;', 'color: inherit;');
    }
  }

  private log(level: LogLevel, namespace: string, message: string, data?: any) {
    // Only show debug logs in development
    if (level === 'debug' && !this.isDevelopment) return;

    const payload: LogPayload = {
      level,
      namespace: namespace.toUpperCase(),
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.formatLog(payload);
  }

  info(namespace: string, message: string, data?: any) {
    this.log('info', namespace, message, data);
  }

  warn(namespace: string, message: string, data?: any) {
    this.log('warn', namespace, message, data);
  }

  error(namespace: string, message: string, data?: any) {
    this.log('error', namespace, message, data);
  }

  debug(namespace: string, message: string, data?: any) {
    this.log('debug', namespace, message, data);
  }
}

export const logger = new Logger();
