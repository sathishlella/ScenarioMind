/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║    ScenarioMind — AI Simulation Chat for Scenario Prediction ║
 * ║    Day 3 of 100 | 100 Days 100 AI Agents                    ║
 * ║    Built by: Sathish Lella                                   ║
 * ║    Powered by: MiroFish (Open Source Swarm Intelligence)     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Core simulation engine using Groq API for fast inference.
 */

import Groq from "groq-sdk";

// ═══════════════════════════════════════════════════════════════
//  AGENT PERSONA DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const AGENT_PERSONAS = {
  ceo: {
    name: "Alex Rivera",
    role: "CEO Strategist",
    systemPrompt: `You are a seasoned CEO with 20 years of experience scaling startups to $100M+.
You analyze scenarios through the lens of:
- Long-term strategic positioning
- Competitive moat and market timing
- Board and stakeholder management
- Capital efficiency and runway implications
You are decisive, data-informed, and think in 2nd and 3rd order effects.
Keep responses under 150 words. Be specific, not generic.`,
  },

  customer: {
    name: "Priya Shah",
    role: "Customer Advocate",
    systemPrompt: `You are a Customer Success leader who has managed 500+ enterprise accounts.
You analyze scenarios through the lens of:
- Customer sentiment and churn probability
- NPS impact and satisfaction drivers
- Customer communication and change management
- Segment-level impact (SMB vs mid-market vs enterprise)
You always quantify customer impact with specific numbers and percentages.
Keep responses under 150 words. Reference customer personas, not abstractions.`,
  },

  competitor: {
    name: "James Wu",
    role: "Competitor Analyst",
    systemPrompt: `You are a competitive intelligence analyst who has tracked 100+ markets.
You analyze scenarios through the lens of:
- Competitor likely responses (with probability %)
- Market positioning shifts
- Window of first-mover advantage
- Competitive vulnerability exposure
You always model 2-3 competitor response scenarios with probabilities.
Keep responses under 150 words. Name specific competitive dynamics.`,
  },

  investor: {
    name: "Sarah Kim",
    role: "Investor Lens",
    systemPrompt: `You are a Series B+ VC investor who has seen 1,000 pitch decks.
You analyze scenarios through the lens of:
- Valuation and multiple impact
- Metric trajectory (ARR, NDR, GM, CAC payback)
- Board-level optics and governance
- Fundraising timeline implications
You think in terms of what moves the next-round multiple up or down.
Keep responses under 150 words. Use specific financial metrics.`,
  },

  pessimist: {
    name: "Marcus Cole",
    role: "Devil's Advocate",
    systemPrompt: `You are a risk analyst whose job is to find every flaw in every plan.
You analyze scenarios through the lens of:
- Tail risks and black swan events
- Assumption stress-testing
- Historical failure patterns
- Irreversibility and optionality destruction
You are not negative — you are rigorously honest about downside scenarios.
Keep responses under 150 words. Quantify risks with probability estimates.`,
  },

  data: {
    name: "Lena Patel",
    role: "Data Scientist",
    systemPrompt: `You are a data scientist who runs Monte Carlo simulations for Fortune 500s.
You analyze scenarios through the lens of:
- Probability distributions and confidence intervals
- Key variable sensitivity analysis
- Base case vs. best case vs. worst case modeling
- Statistical significance and sample size considerations
You always express predictions as ranges with confidence levels, never point estimates.
Keep responses under 150 words. Use specific numbers and distributions.`,
  },

  legal: {
    name: "David Okonkwo",
    role: "Legal & Compliance",
    systemPrompt: `You are a corporate attorney specializing in tech/SaaS compliance.
You analyze scenarios through the lens of:
- Regulatory risk and compliance requirements
- Contractual obligations and liability exposure
- Data privacy (GDPR, CCPA, HIPAA) implications
- Documentation and audit trail needs
You rate legal risk as LOW/MEDIUM/HIGH with specific reasoning.
Keep responses under 150 words. Flag specific legal requirements.`,
  },

  media: {
    name: "Nina Torres",
    role: "Media & PR Analyst",
    systemPrompt: `You are a crisis communications expert who has managed 50+ public narratives.
You analyze scenarios through the lens of:
- Media narrative framing (first 72 hours)
- Social amplification factor and virality risk
- Stakeholder communication sequencing
- Reputation impact and recovery timeline
You quantify media risk with specific amplification numbers.
Keep responses under 150 words. Think in terms of narrative control.`,
  },

  employee: {
    name: "Ryan Kim",
    role: "Employee & Culture Voice",
    systemPrompt: `You are a Chief People Officer who has navigated 10 major org changes.
You analyze scenarios through the lens of:
- Employee morale and productivity impact
- Flight risk for top performers
- Internal communication timing and messaging
- Culture and employer brand implications
You model morale curves and retention probability shifts.
Keep responses under 150 words. Quantify people impact.`,
  },
};

// ═══════════════════════════════════════════════════════════════
//  SCENARIOMIND AGENT
// ═══════════════════════════════════════════════════════════════

class ScenarioMindAgent {
  constructor(options = {}) {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.model = options.model || "llama-3.3-70b-versatile";
  }

  /**
   * Call Groq with a specific system prompt.
   */
  async _call(system, prompt, maxTokens = 1024) {
    const res = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    });
    return res.choices[0].message.content;
  }

  /**
   * Extract JSON from response.
   */
  _extractJSON(text) {
    text = text.trim();
    for (const [s, e] of [["{", "}"], ["[", "]"]]) {
      const si = text.indexOf(s);
      const ei = text.lastIndexOf(e);
      if (si !== -1 && ei > si) return text.slice(si, ei + 1);
    }
    return text;
  }

  /**
   * Have one agent analyze the scenario.
   */
  async runAgentAnalysis(agentKey, request, round = 1, previousResponses = []) {
    const persona = AGENT_PERSONAS[agentKey];
    if (!persona) throw new Error(`Unknown agent: ${agentKey}`);

    let prompt = `SCENARIO: ${request.scenario}\n`;
    prompt += `DOMAIN: ${request.domain}\n`;
    prompt += `TIME HORIZON: ${request.timeHorizon}\n`;
    if (request.company) prompt += `COMPANY CONTEXT: ${request.company}\n`;
    if (request.additionalContext) prompt += `ADDITIONAL INTEL: ${request.additionalContext}\n`;

    if (round > 1 && previousResponses.length > 0) {
      prompt += `\nPREVIOUS ROUND — Other agents said:\n`;
      previousResponses.forEach((r) => {
        prompt += `\n[${r.agentName} — ${r.role}]: ${r.analysis}\n`;
      });
      prompt += `\nThis is Round ${round}. Challenge or build on their assumptions. Add new angles they missed. Be specific.`;
    } else {
      prompt += `\nAnalyze this scenario from your perspective. Be specific, quantitative where possible, and identify the non-obvious risks/opportunities.`;
    }

    const analysis = await this._call(persona.systemPrompt, prompt);

    return {
      agentKey,
      agentName: persona.name,
      role: persona.role,
      round,
      analysis: analysis.trim(),
    };
  }

  /**
   * Synthesize all agent analyses into a prediction report.
   */
  async synthesizeReport(request, allResponses) {
    const analysesText = allResponses
      .map((r) => `[${r.agentName} — ${r.role} — Round ${r.round}]:\n${r.analysis}`)
      .join("\n\n");

    const prompt = `
You are the Synthesis Agent for ScenarioMind, a multi-agent simulation platform.

${allResponses.length} agent analyses were conducted across 2 rounds of debate.

ORIGINAL SCENARIO: ${request.scenario}
DOMAIN: ${request.domain}
TIME HORIZON: ${request.timeHorizon}
COMPANY: ${request.company || "Not specified"}
CONTEXT: ${request.additionalContext || "None"}

AGENT ANALYSES:
${analysesText}

Synthesize ALL agent perspectives into a final prediction report.

Return JSON:
{
  "outcomes": [
    {"label": "Outcome description", "probability": 34, "description": "Why this outcome is likely"}
  ],
  "keyInsights": ["5 non-obvious insights that emerged from the multi-agent debate"],
  "confidenceScore": 72,
  "executiveSummary": "3-sentence summary of the overall prediction",
  "recommendedAction": "The single most important action to take based on this simulation"
}

Rules:
- Outcome probabilities must sum to 100
- Include 4-5 outcomes ranging from very positive to very negative
- Key insights should reference specific agent disagreements or consensus points
- Confidence score reflects how much agent agreement there was (50-90 range)

Return ONLY valid JSON.`;

    const raw = await this._call(
      "You are a neutral synthesis agent that aggregates multi-agent predictions into clear, actionable reports. You never add your own opinion — only synthesize what the agents said.",
      prompt,
      2048
    );

    try {
      const data = JSON.parse(this._extractJSON(raw));
      return {
        request,
        conversation: allResponses,
        outcomes: data.outcomes || [],
        keyInsights: data.keyInsights || [],
        confidenceScore: data.confidenceScore || 70,
        executiveSummary: data.executiveSummary || "",
        recommendedAction: data.recommendedAction || "",
        generatedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error("Failed to parse synthesis:", e.message);
      return {
        request,
        conversation: allResponses,
        outcomes: [],
        keyInsights: [],
        confidenceScore: 0,
        executiveSummary: "Synthesis failed — please retry.",
        recommendedAction: "",
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Run a complete multi-agent simulation.
   */
  async simulate(request) {
    const agents = request.agents || ["ceo", "customer", "competitor", "investor", "pessimist", "data"];

    // Round 1: Individual analysis
    const round1 = [];
    for (const agentKey of agents) {
      const response = await this.runAgentAnalysis(agentKey, request, 1);
      round1.push(response);
    }

    // Round 2: Debate (each agent sees Round 1 responses)
    const round2 = [];
    for (const agentKey of agents) {
      const othersR1 = round1.filter((r) => r.agentKey !== agentKey);
      const response = await this.runAgentAnalysis(agentKey, request, 2, othersR1);
      round2.push(response);
    }

    const allResponses = [...round1, ...round2];

    // Synthesis
    const report = await this.synthesizeReport(request, allResponses);

    return report;
  }

  /**
   * Ask a follow-up question to the simulation.
   */
  async askFollowUp(report, question) {
    const context = report.conversation
      .map((r) => `[${r.agentName}]: ${r.analysis}`)
      .join("\n\n");

    const prompt = `
Based on this multi-agent simulation:

SCENARIO: ${report.request.scenario}
CONFIDENCE: ${report.confidenceScore}%
EXECUTIVE SUMMARY: ${report.executiveSummary}

AGENT CONVERSATION:
${context.substring(0, 3000)}

USER FOLLOW-UP QUESTION: ${question}

Answer the question by synthesizing the relevant agent perspectives. Be specific and actionable.`;

    return this._call(
      "You are ScenarioMind, a multi-agent simulation assistant. Answer follow-up questions by referencing specific agent insights from the simulation.",
      prompt
    );
  }

  /**
   * Export report as Markdown.
   */
  exportToMarkdown(report) {
    const lines = [];
    lines.push(`# ScenarioMind — Prediction Report`);
    lines.push(`**Generated:** ${report.generatedAt.slice(0, 19).replace("T", " ")}`);
    lines.push(`**Confidence:** ${report.confidenceScore}%`);
    lines.push(`**Agents:** ${report.conversation.length / 2}\n`);

    lines.push(`## Scenario`);
    lines.push(`> ${report.request.scenario}\n`);
    lines.push(`**Domain:** ${report.request.domain} | **Horizon:** ${report.request.timeHorizon}`);
    if (report.request.company) lines.push(`**Context:** ${report.request.company}\n`);

    lines.push(`## Executive Summary`);
    lines.push(`${report.executiveSummary}\n`);

    lines.push(`## Outcome Distribution\n`);
    lines.push(`| Outcome | Probability | Description |`);
    lines.push(`|---------|------------|-------------|`);
    report.outcomes.forEach((o) => {
      lines.push(`| ${o.label} | ${o.probability}% | ${o.description} |`);
    });

    lines.push(`\n## Key Insights\n`);
    report.keyInsights.forEach((ins, i) => {
      lines.push(`${i + 1}. ${ins}`);
    });

    lines.push(`\n## Recommended Action`);
    lines.push(`${report.recommendedAction}\n`);

    lines.push(`## Agent Conversation\n`);
    report.conversation.forEach((r) => {
      lines.push(`### ${r.agentName} — ${r.role} (Round ${r.round})`);
      lines.push(`${r.analysis}\n`);
    });

    lines.push(`---`);
    lines.push(`*Generated by ScenarioMind — Powered by MiroFish*`);
    lines.push(`*Built by Sathish Lella | Day 3 of 100 Days, 100 AI Agents*`);

    return lines.join("\n");
  }
}

export { ScenarioMindAgent, AGENT_PERSONAS };
