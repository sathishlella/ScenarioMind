/**
 * API Route: POST /api/simulate
 * Run a multi-agent simulation and return the prediction report.
 */

import { ScenarioMindAgent } from "../lib/agent.js";

export const config = {
  maxDuration: 60, // 60 seconds for Vercel hobby plan
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { scenario, domain, timeHorizon, company, additionalContext, agents } = req.body;

    if (!scenario || !domain || !timeHorizon) {
      return res.status(400).json({ 
        error: "Missing required fields: scenario, domain, timeHorizon" 
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: "GROQ_API_KEY not configured" 
      });
    }

    const agent = new ScenarioMindAgent();
    
    const request = {
      scenario,
      domain,
      timeHorizon,
      company: company || "",
      additionalContext: additionalContext || "",
      agents: agents || ["ceo", "customer", "competitor", "investor", "pessimist", "data"],
    };

    const report = await agent.simulate(request);

    res.status(200).json(report);
  } catch (error) {
    console.error("Simulation error:", error);
    res.status(500).json({ 
      error: "Simulation failed", 
      message: error.message 
    });
  }
}
