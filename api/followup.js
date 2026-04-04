/**
 * API Route: POST /api/followup
 * Ask a follow-up question to a completed simulation.
 */

import { ScenarioMindAgent } from "./../lib/agent.js";

export const config = {
  maxDuration: 30,
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
    const { report, question } = req.body;

    if (!report || !question) {
      return res.status(400).json({ 
        error: "Missing required fields: report, question" 
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: "GROQ_API_KEY not configured" 
      });
    }

    const agent = new ScenarioMindAgent();
    const answer = await agent.askFollowUp(report, question);

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Follow-up error:", error);
    res.status(500).json({ 
      error: "Follow-up failed", 
      message: error.message 
    });
  }
}
