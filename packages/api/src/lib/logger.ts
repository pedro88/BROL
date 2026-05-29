/**
 * Minimal structured logger for the Brol API server.
 *
 * Emits one JSON line per log entry so the output is greppable / shippable
 * to any structured log collector (Loki, Datadog, CloudWatch, etc.) without
 * pulling in pino/winston. Keep the interface (`info`/`warn`/`error`/`debug`)
 * compatible with pino so we can swap implementations later without
 * touching call sites.
 *
 * Each module gets a child logger via `logger.child("loans.remind")` whose
 * `module` field is prefixed onto every entry — replaces the ad-hoc
 * `[loans.remind] …` string prefixes used throughout the code.
 *
 * @package @brol/api
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevel = (process.env.LOG_LEVEL ?? "info").toLowerCase();
const MIN_LEVEL =
  envLevel in LEVEL_RANK ? LEVEL_RANK[envLevel as Level] : LEVEL_RANK.info;

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { value: String(err) };
}

function emit(
  level: Level,
  module: string | undefined,
  message: string,
  context?: Record<string, unknown> | unknown,
) {
  if (LEVEL_RANK[level] < MIN_LEVEL) return;

  const entry: Record<string, unknown> = {
    level,
    time: new Date().toISOString(),
    msg: message,
  };
  if (module) entry.module = module;

  if (context !== undefined) {
    if (context instanceof Error) {
      entry.err = serializeError(context);
    } else if (typeof context === "object" && context !== null) {
      Object.assign(entry, context);
    } else {
      entry.context = context;
    }
  }

  const line = JSON.stringify(entry);
  if (level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown> | unknown): void;
  info(message: string, context?: Record<string, unknown> | unknown): void;
  warn(message: string, context?: Record<string, unknown> | unknown): void;
  error(message: string, context?: Record<string, unknown> | unknown): void;
  child(module: string): Logger;
}

function buildLogger(parentModule?: string): Logger {
  return {
    debug: (msg, ctx) => emit("debug", parentModule, msg, ctx),
    info: (msg, ctx) => emit("info", parentModule, msg, ctx),
    warn: (msg, ctx) => emit("warn", parentModule, msg, ctx),
    error: (msg, ctx) => emit("error", parentModule, msg, ctx),
    child: (module: string) =>
      buildLogger(parentModule ? `${parentModule}.${module}` : module),
  };
}

export const logger = buildLogger();
