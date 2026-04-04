/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║    ScenarioMind — AI Simulation Chat for Scenario Prediction ║
 * ║    Day 3 of 100 | 100 Days 100 AI Agents                    ║
 * ║    Built by: Sathish Lella                                   ║
 * ║    Powered by: MiroFish (Open Source Swarm Intelligence)     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * CLI version - Run locally with: node agent.js
 * Requires GROQ_API_KEY environment variable
 */

import { ScenarioMindAgent } from './lib/agent.js';
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

config();

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ Error: GROQ_API_KEY environment variable is required");
    console.log("\nSet it with:");
    console.log("  export GROQ_API_KEY=gsk_your_key_here  (Linux/Mac)");
    console.log("  set GROQ_API_KEY=gsk_your_key_here     (Windows)");
    console.log("\nOr create a .env file with GROQ_API_KEY=gsk_your_key_here");
    process.exit(1);
  }

  const request = {
    scenario: "What happens if we raise our Enterprise plan price from $499/mo to $625/mo (+25%) next quarter?",
    domain: "pricing",
    timeHorizon: "90d",
    company: "B2B SaaS, $5M ARR, 200 enterprise customers, 8% monthly churn, NPS 62",
    additionalContext: "Top 3 competitors price between $400-$550. We added AI features last month. 40% of revenue comes from top 20 accounts. Board meeting in 6 weeks.",
    agents: ["ceo", "customer", "competitor", "investor", "pessimist", "data"],
  };

  console.log("\n┌─────────────────────────────────────────────┐");
  console.log("│     ScenarioMind — Multi-Agent Simulation     │");
  console.log("│     Powered by MiroFish + Groq AI             │");
  console.log("└─────────────────────────────────────────────┘");

  const agent = new ScenarioMindAgent();
  const report = await agent.simulate(request);

  // Print markdown report
  console.log("\n" + "=".repeat(60));
  console.log(agent.exportToMarkdown(report));

  // Save files
  mkdirSync("output", { recursive: true });
  
  const mdPath = join("output", "scenario-report.md");
  writeFileSync(mdPath, agent.exportToMarkdown(report));
  console.log(`\n📄 Saved: ${mdPath}`);

  const jsonPath = join("output", "scenario-report.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`📊 Saved: ${jsonPath}`);
}

main().catch(console.error);
