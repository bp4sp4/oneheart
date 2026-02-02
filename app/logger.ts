// logger.ts
// Simple logger utility to replace console.log

export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // Only log in non-production environments
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
};
