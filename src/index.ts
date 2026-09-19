#!/usr/bin/env node

import { Command } from "commander";
import ContextGen from "./utils/context";
import { codeGen } from "./utils/agent";
import { loadContext } from "./utils/StrAnalyzer";
import { handleAgentOutput } from "./agentPipeline";

const program = new Command();

program
  .command("init")
  .description("Analyze and store the initial context of the Next.js project")
  .action(async () => {
    console.log("Initializing project context...");
    await ContextGen();
    console.log("Context gathering complete ✅");
  });

program
  .argument('<query>', 'natural language request')
  .action(async (query) => {
    console.log("proccesing your query: ",query)
    console.log("[frontend] Preparing project context for code generation...");
    const context = loadContext()
    console.log("[frontend] Project context loaded successfully.");
    const array = await codeGen(query,context );
    console.log(`[frontend] Generated ${array?.length ?? 0} project action(s).`);
    console.log("[frontend] Applying generated project changes...");
    await handleAgentOutput(array!)
    console.log("[frontend] Generated UI changes have been applied.");
    console.log("query processed");
  })
  
program.parse();
