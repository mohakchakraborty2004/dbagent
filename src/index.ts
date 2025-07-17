#!/usr/bin/env node

import { Command } from "commander";
// import { runAgentPipeline } from "./agentPipeline";

const program = new Command();

program
  .name("dbagent")
  .description("AI-powered database CLI for Next.js projects")
  .argument("<query>", "natural language feature request")
  .action(async (query: string) => {
    console.log(query)
  });

program.parse();
