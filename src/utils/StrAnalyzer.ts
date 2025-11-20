import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export interface ProjectPaths {
  root: string;
  basePath: string;
  routerType: "app" | "pages";
  routerDir: string;
  componentsDir: string;
  apiDir: string;
  prismaDir: string;
}

export type ShallowScanResult = Record<
  string,
  { content: string; size: number }
>;

export function getProjectStructure(projectRoot: string = process.cwd()): ProjectPaths {
  const hasSrc = fs.existsSync(path.join(projectRoot, "src"));
  const basePath = hasSrc ? path.join(projectRoot, "src") : projectRoot;

  const appDir = path.join(basePath, "app");
  const pagesDir = path.join(basePath, "pages");
  const componentsDir = path.join(basePath, "components");

  const isAppRouter = fs.existsSync(appDir);
  const isPagesRouter = fs.existsSync(pagesDir);

  if (!isAppRouter && !isPagesRouter) {
    throw new Error("❌ Could not find either 'pages' or 'app' directory in the project.");
  }

  const routerDir = isAppRouter ? appDir : pagesDir;
  const routerType = isAppRouter ? "app" : "pages";

  //Ensuring API directory exists
  const apiDir = path.join(routerDir, "api");
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
    console.log("📂 Created missing API directory:", apiDir);
  } else {
    console.log("api directory exists")
  }

  //Check Prisma directory
  const prismaDir = path.join(projectRoot, "prisma");
  console.log("prisma dir :", prismaDir)
  if (!fs.existsSync(prismaDir)) {
    console.log("⚠️ Prisma directory not found. Initializing Prisma...");
    try {
      execSync("npx prisma init", { stdio: "inherit", cwd: projectRoot });
      execSync("npm install --save-dev prisma dotenv", { stdio: "inherit", cwd: projectRoot });
      execSync(
  `if [ -f .gitignore ]; then \
      (grep -qxF ".env*" .gitignore || echo ".env*" >> .gitignore); \
   else \
      echo ".env*" > .gitignore; \
   fi`,
  { stdio: "inherit", cwd: projectRoot }
);
      console.log("✅ Paste your database connection string in the .env file created in the project root.");
    } catch (error) {
      console.error("❌ Failed to initialize Prisma:", error);
    }
  } else {
    console.log("prisma dir exists.")
  }

  return {
    root: projectRoot,
    basePath,
    routerType,
    routerDir,
    componentsDir,
    apiDir,
    prismaDir,
  };
}

export function shallowScan(rootDir: string): ShallowScanResult {
  const result: ShallowScanResult = {};

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (entry === "node_modules" || entry.startsWith(".")) continue;
        walk(fullPath);
      } else if (/\.(tsx?|jsx?)$/.test(entry)) {
        const rel = path.relative(rootDir, fullPath);
        const content = fs.readFileSync(fullPath, "utf-8");
        result[rel] = { content, size: content.length };
      }
    }
  };

  walk(rootDir);
  return result;
}

export function saveContextFile(ctx: any, rootDir: string) {
  const targetDir = path.join(rootDir, ".dbagent");
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(
    path.join(targetDir, "context.json"),
    JSON.stringify(ctx, null, 2),
    "utf-8"
  );
}

export function loadContext(): any {
  const contextPath = path.resolve(process.cwd(), '.dbagent/context.json');

  if (!fs.existsSync(contextPath)) {
    throw new Error("❌ Context file not found. Please run `npx dbagent init` first.");
  }

  const raw = fs.readFileSync(contextPath, 'utf-8');
  try {
    const context = JSON.parse(raw);
    return context;
  } catch (e) {
    throw new Error("❌ Failed to parse .dbagent/context.json");
  }
}