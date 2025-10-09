import winston from "winston";

class LoggerWrap {
  static createConsoleFormat(logContext = "DEF") {
    return winston.format.combine(
      winston.format.timestamp({
        format: () => {
          const date = new Date();
          return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}/${String(date.getDate()).padStart(2, "0")} ${String(
            date.getHours()
          ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
            2,
            "0"
          )}:${String(date.getSeconds()).padStart(2, "0")}`;
        },
      }),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `[ ${logContext
          .padEnd(4, " ")
          .slice(0, 4)} ] ${timestamp} ${level} ${message}; ${
          Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
        }`;
      })
    );
  }

  private static loggers: Map<string, winston.Logger> = new Map();

  private static getLogger(log_context: string): winston.Logger {
    if (!this.loggers.has(log_context)) {
      const logger = winston.createLogger({
        level: process.env.LOG_LEVEL || "info",
        format: LoggerWrap.createConsoleFormat(log_context),
        transports: [new winston.transports.Console()],
      });
      this.loggers.set(log_context, logger);
    }
    return this.loggers.get(log_context)!;
  }

  public static info(
    log_context: string,
    message: string,
    meta?: Record<string, any>
  ) {
    this.getLogger(log_context).info(message, meta);
  }

  public static error(
    log_context: string,
    message: string,
    meta?: Record<string, any>
  ) {
    this.getLogger(log_context).error(message, meta);
  }

  public static warn(
    log_context: string,
    message: string,
    meta?: Record<string, any>
  ) {
    this.getLogger(log_context).warn(message, meta);
  }

  public static debug(
    log_context: string,
    message: string,
    meta?: Record<string, any>
  ) {
    this.getLogger(log_context).debug(message, meta);
  }
}

export const logger = LoggerWrap;
