type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isValidLogLevel = (value: string): value is LogLevel =>
  ['debug', 'info', 'warn', 'error'].includes(value);

// Check environment variable first, fallback to NODE_ENV
const rawEnvLevel = process.env.TRACE_LEVEL;
const envLevel = typeof rawEnvLevel === 'string' ? rawEnvLevel.toLowerCase() : undefined;

let traceLevel: LogLevel = isValidLogLevel(envLevel)
  ? envLevel
  : process.env.NODE_ENV === 'production'
    ? 'warn'
    : 'debug';

export const setTraceLevel = (level: LogLevel): void => {
  traceLevel = level;
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (logLevels['debug'] >= logLevels[traceLevel]) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (logLevels['info'] >= logLevels[traceLevel]) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (logLevels['warn'] >= logLevels[traceLevel]) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (logLevels['error'] >= logLevels[traceLevel]) {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', ...args);
    }
  },
};

export const log = logger;
