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

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, cleanedContent, "utf-8");
    console.log(`✅ Created new file: ${fullPath}`);
  } else {
    const existing = fs.readFileSync(fullPath, "utf-8");
    const merged = await codeCombiner(existing, cleanedContent);
    if (!merged?.code) {
      throw new Error(`Code generation returned no merged content for ${fullPath}`);
    }
    fs.writeFileSync(fullPath, merged.code.replace(/\\n/g, "\n"), "utf-8");
    console.log(`🔁 Updated file with merged content: ${fullPath}`);
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
  const startedAt = Date.now();
  const fileCount = actions.filter((item) => item.type === "file").length;
  const commandCount = actions.filter((item) => item.type === "command").length;
  console.log(
    `🚀 Applying ${actions.length} action(s): ${fileCount} file(s), ${commandCount} command(s)`,
  );

  for (const [index, item] of actions.entries()) {
    console.log(`▶️  Action ${index + 1}/${actions.length}: ${item.type}`);
    if (item.type === "file") {
      const fullDir = path.resolve(process.cwd(), item.directory);
      ensureDir(fullDir);
      await writeFileSafe(fullDir, item.fileName, item.content);
    }

    if (item.type === "command") {
      runCommand(item.command);
    }

    if (item.type !== "file" && item.type !== "command") {
      console.warn(`⚠️ Skipping unsupported action type: ${String(item.type)}`);
    }
  }

  console.log(`🏁 Applied agent output in ${Date.now() - startedAt}ms`);
}
