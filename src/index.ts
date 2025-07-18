#!/usr/bin/env node

import { Command } from "commander";
import ContextGen from "./utils/context";
import { codeGen } from "./utils/agent";
import { loadContext } from "./utils/StrAnalyzer";
import { handleAgentOutput } from "./agentPipeline";
// import { runAgentPipeline } from "./agentPipeline";

const program = new Command();

// program
//   .name("dbagent")
//   .description("AI-powered database CLI for Next.js projects")
//   .argument("<query>", "natural language feature request")
//   .action(async (query: string) => {
//     console.log(query)
//   });

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
    const context = loadContext()
    const array = await codeGen(query,context );
    await handleAgentOutput(array!)
    console.log("query processed");
  })
  
program.parse();
