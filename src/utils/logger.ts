import fs from "fs";
import os from "os";
import path from "path";

export type LogLevel = "INFO" | "ERROR";

export function getLogPath(
  env: NodeJS.ProcessEnv = process.env,
  homeDir: string = os.homedir(),
  platform: NodeJS.Platform = process.platform,
): string {
  let stateDir: string;

  if (platform === "win32") {
    stateDir = env.LOCALAPPDATA ?? path.join(homeDir, "AppData", "Local");
  } else if (platform === "darwin") {
    stateDir = path.join(homeDir, "Library", "Logs");
  } else {
    stateDir = env.XDG_STATE_HOME ?? path.join(homeDir, ".local", "state");
  }

  return path.join(stateDir, "dbagent", "dbagent.log");
}

/**
 * Record CLI activity without replacing the user-facing console output.
 * Logging is best-effort so a filesystem permission issue never stops a run.
 */
export function logToFile(
  level: LogLevel,
  message: string,
): void {
  try {
    const logPath = getLogPath();
    fs.mkdirSync(path.dirname(logPath), { recursive: true });

    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] [${level}] ${message}\n`,
      "utf-8",
    );
  } catch {
    // File logging must not prevent dbagent from completing the requested work.
  }
}
