import { APP_ENVIRONMENT, isDevelopment } from "../constants/environment";

function formatArgs(args) {
  return args
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(" ");
}

export function debug(...args) {
  if (!isDevelopment) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`[${APP_ENVIRONMENT}]`, formatArgs(args));
}

export function info(...args) {
  // eslint-disable-next-line no-console
  console.info(`[${APP_ENVIRONMENT}]`, formatArgs(args));
}

export function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn(`[${APP_ENVIRONMENT}]`, formatArgs(args));
}

export function error(...args) {
  // eslint-disable-next-line no-console
  console.error(`[${APP_ENVIRONMENT}]`, formatArgs(args));
}

export default {
  debug,
  info,
  warn,
  error,
};
