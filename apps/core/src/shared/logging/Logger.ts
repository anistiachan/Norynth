export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogFields {
  [key: string]: unknown
}

export class Logger {
  private readonly level: LogLevel
  private readonly levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(level: LogLevel = 'info') {
    this.level = level
  }

  debug(event: string, fields?: LogFields): void {
    this.write('debug', event, fields)
  }

  info(event: string, fields?: LogFields): void {
    this.write('info', event, fields)
  }

  warn(event: string, fields?: LogFields): void {
    this.write('warn', event, fields)
  }

  error(event: string, fields?: LogFields): void {
    this.write('error', event, fields)
  }

  private write(level: LogLevel, event: string, fields?: LogFields): void {
    if (this.levelOrder[level] < this.levelOrder[this.level]) {
      return
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...fields,
    }

    const line = JSON.stringify(entry)
    if (level === 'error') {
      console.error(line)
    } else {
      console.log(line)
    }
  }
}
