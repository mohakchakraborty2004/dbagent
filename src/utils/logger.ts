import fs from "fs";
import path from "path";

export type LogLevel = "INFO" | "ERROR";

export function getLogPath(rootDir: string = process.cwd()): string {
  return path.join(rootDir, ".dbagent", "dbagent.log");
}

/**
 * Record CLI activity without replacing the user-facing console output.
 * Logging is best-effort so a filesystem permission issue never stops a run.
 */
export function logToFile(
  level: LogLevel,
  message: string,
  details?: unknown,
): void {
  try {
    const logPath = getLogPath();
    fs.mkdirSync(path.dirname(logPath), { recursive: true });

    const suffix = details === undefined ? "" : ` ${formatDetails(details)}`;
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] [${level}] ${message}${suffix}\n`,
      "utf-8",
    );
  } catch {
    // File logging must not prevent dbagent from completing the requested work.
  }
}

function formatDetails(details: unknown): string {
  if (details instanceof Error) {
    return details.stack ?? details.message;
  }

  if (typeof details === "string") {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}
