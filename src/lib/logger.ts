/* eslint-disable no-console */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isValidLogLevel = (value: unknown): value is LogLevel =>
  typeof value === 'string' && ['debug', 'info', 'warn', 'error'].includes(value);

let traceLevel: LogLevel | null = null;

function getTraceLevel(): LogLevel {
  if (traceLevel) return traceLevel;

  try {
    const raw = process?.env?.TRACE_LEVEL ?? '';
    const level = raw.toLowerCase();

    if (isValidLogLevel(level)) {
      traceLevel = level;
    } else if (process?.env?.NODE_ENV === 'production') {
      traceLevel = 'warn';
    } else {
      traceLevel = 'debug';
    }
  } catch {
    traceLevel = 'debug'; // safe default if env is unavailable
  }

  return traceLevel;
}

export const setTraceLevel = (level: LogLevel): void => {
  traceLevel = level;
};

export const logger = {
  debug: (...args: unknown[]) => {
    const level = getTraceLevel();
    if (logLevels['debug'] >= logLevels[level]) console.debug('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    const level = getTraceLevel();
    if (logLevels['info'] >= logLevels[level]) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    const level = getTraceLevel();
    if (logLevels['warn'] >= logLevels[level]) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    const level = getTraceLevel();
    if (logLevels['error'] >= logLevels[level]) console.error('[ERROR]', ...args);
  },
};

export const log = logger;
