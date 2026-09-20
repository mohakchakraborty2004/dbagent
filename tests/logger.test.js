const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { getLogPath, logToFile } = require("../dist/utils/logger");

test("getLogPath uses platform user-data directories", () => {
  assert.equal(
    getLogPath({ XDG_STATE_HOME: "/state" }, "/home/user", "linux"),
    path.join("/state", "dbagent", "dbagent.log"),
  );
  assert.equal(
    getLogPath({}, "/Users/user", "darwin"),
    path.join("/Users/user", "Library", "Logs", "dbagent", "dbagent.log"),
  );
  assert.equal(
    getLogPath({ LOCALAPPDATA: "C:\\Local" }, "C:\\Users\\user", "win32"),
    path.join("C:\\Local", "dbagent", "dbagent.log"),
  );
});

test("logToFile writes only the supplied event message", () => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), "dbagent-log-"));
  const previousStateDir = process.env.XDG_STATE_HOME;

  try {
    process.env.XDG_STATE_HOME = stateDir;
    logToFile("INFO", "Query processing started");

    const content = fs.readFileSync(
      path.join(stateDir, "dbagent", "dbagent.log"),
      "utf8",
    );
    assert.match(content, /\[INFO\] Query processing started\n$/);
  } finally {
    if (previousStateDir === undefined) {
      delete process.env.XDG_STATE_HOME;
    } else {
      process.env.XDG_STATE_HOME = previousStateDir;
    }
    fs.rmSync(stateDir, { recursive: true, force: true });
  }
});
