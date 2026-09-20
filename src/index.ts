#!/usr/bin/env node

import { Command } from "commander";
import ContextGen from "./utils/context";
import { codeGen } from "./utils/agent";
import { loadContext } from "./utils/StrAnalyzer";
import { handleAgentOutput } from "./agentPipeline";
import { logToFile } from "./utils/logger";

const program = new Command();

program
  .command("init")
  .description("Analyze and store the initial context of the Next.js project")
  .action(async () => {
    logToFile("INFO", "Project initialization started");
    console.log("Initializing project context...");
    try {
      await ContextGen();
      console.log("Context gathering complete ✅");
      logToFile("INFO", "Project initialization completed");
    } catch (error) {
      logToFile("ERROR", "Project initialization failed", error);
      throw error;
    }
  });

program
  .argument('<query>', 'natural language request')
  .action(async (query) => {
    logToFile("INFO", "Query processing started", { query });
    console.log("proccesing your query: ",query)
    try {
      const context = loadContext()
      const array = await codeGen(query,context );
      await handleAgentOutput(array!)
      console.log("query processed");
      logToFile("INFO", "Query processing completed");
    } catch (error) {
      logToFile("ERROR", "Query processing failed", error);
      throw error;
    }
  })
  
program.parse();
