import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { codeCombiner } from "./utils/agent";


function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

export interface mergeType {
    code : string
} 

async function writeFileSafe(directory: string, fileName: string, content: string) {
  const fullPath = path.join(directory, fileName);
  const cleanedContent = content.replace(/\\n/g, "\n");
  const isFrontendFile = /\.(?:jsx|tsx)$/.test(fileName);

  if (isFrontendFile) {
    console.log(`[frontend] Applying generated UI file: ${fullPath}`);
    console.log(`[frontend] UI payload contains ${cleanedContent.split("\n").length} line(s).`);
  }

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, cleanedContent, "utf-8");
    console.log(`✅ Created new file: ${fullPath}`);
    if (isFrontendFile) console.log(`[frontend] Created UI file: ${fullPath}`);
  } else {
    const existing = fs.readFileSync(fullPath, "utf-8");
    console.log(existing)
    //@ts-ignore
    const merged = await codeCombiner(existing, cleanedContent);
    //@ts-ignore
    fs.writeFileSync(fullPath, merged.code.replace(/\\n/g, "\n"), "utf-8");
    console.log(`🔁 Updated file with merged content: ${fullPath}`);
    if (isFrontendFile) console.log(`[frontend] Updated UI file: ${fullPath}`);
  }
}


function runCommand(cmd: string) {
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`💡 Executed: ${cmd}`);
  } catch (err) {
    console.error(`❌ Failed to run command: ${cmd}`, err);
  }
}


export async function handleAgentOutput(actions: any[]) {
  const frontendActions = actions.filter(
    (item) => item.type === "file" && /\.(?:jsx|tsx)$/.test(item.fileName)
  );
  const frontendDirectories = new Set(
    frontendActions.map((item) => path.resolve(process.cwd(), item.directory))
  );
  console.log(`[frontend] Processing ${frontendActions.length} UI action(s).`);
  console.log(`[frontend] UI actions span ${frontendDirectories.size} director${frontendDirectories.size === 1 ? "y" : "ies"}.`);

  if (frontendActions.length === 0) {
    console.log("[frontend] No generated JSX or TSX files to apply.");
  }

  for (const item of actions) {
    if (item.type === "file") {
      const fullDir = path.resolve(process.cwd(), item.directory);
      ensureDir(fullDir);
      await writeFileSafe(fullDir, item.fileName, item.content);
    }

    if (item.type === "command") {
      runCommand(item.command);
    }
  }

  console.log("[frontend] Finished processing UI actions.");
}
