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
    const startedAt = Date.now();
    console.log("Initializing project context...");
    await ContextGen();
    console.log(`Context gathering complete in ${Date.now() - startedAt}ms ✅`);
  });

program
  .argument('<query>', 'natural language request')
  .action(async (query) => {
    const startedAt = Date.now();
    console.log("Processing your query...")
    const context = loadContext()
    console.log("Loaded project context; requesting generated actions...")
    const array = await codeGen(query,context );
    if (!array) {
      throw new Error("No actions were generated for the query");
    }
    console.log(`Received ${array.length} generated action(s)`);
    await handleAgentOutput(array)
    console.log(`Query processed in ${Date.now() - startedAt}ms ✅`);
  })
  
program.parse();
