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
    console.log("Processing your query:", query)
    const context = loadContext()
    console.log("Loaded project context; requesting code generation...")
    const array = await codeGen(query,context );
    console.log(`Received ${array?.length ?? 0} action(s) from the agent.`)
    await handleAgentOutput(array!)
    console.log("Query processed.");
  })
  
program.parse();
