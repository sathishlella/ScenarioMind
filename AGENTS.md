# ScenarioMind — AI Simulation Chat for Scenario Prediction

> Day 3 of 100 | 100 Days, 100 AI Agents  
> Built by: Sathish Lella  
> Powered by: MiroFish (Open Source Swarm Intelligence)

---

## Project Overview

ScenarioMind is a multi-agent AI simulation platform for business scenario prediction. Users describe a business scenario in plain English, and the system spawns specialized AI agent personas that debate, challenge assumptions, and generate Monte Carlo-style prediction reports.

**Core Value Proposition:** Instead of getting a single AI answer, users get a structured debate between 9 expert perspectives (CEO, Customer Advocate, Competitor Analyst, etc.), surfacing disagreements and second-order effects that no single perspective captures.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (ES Modules) |
| AI Model | Anthropic Claude (claude-sonnet-4-6) |
| Frontend Demo | Vanilla HTML/CSS/JS (single file) |
| Dependencies | `@anthropic-ai/sdk`, `dotenv` |

---

## Project Structure

```
├── agent.js              # Main simulation engine (555 lines)
├── demo.html             # Interactive frontend demo (889 lines)
├── package.json          # Project configuration
├── linkedin-post.md      # Marketing content for social media
└── startup-one-pager.md  # Business plan and market analysis
```

### File Descriptions

**`agent.js`** — Core Node.js application containing:
- `AGENT_PERSONAS` — Definitions for 9 specialized agent personas with system prompts
- `ScenarioMindAgent` class — Main orchestration logic
  - `runAgentAnalysis()` — Individual agent analysis (Round 1 & 2)
  - `synthesizeReport()` — Aggregates all agent outputs into prediction report
  - `simulate()` — Runs full 2-round multi-agent simulation
  - `askFollowUp()` — Contextual follow-up question answering
  - `exportToMarkdown()` / `saveOutputs()` — Report export functionality

**`demo.html`** — Standalone frontend demo:
- Interactive scenario configuration UI
- Agent selection chips (toggle 9 personas)
- Mock simulation chat interface (no backend connection)
- Visual prediction report with outcome distribution bars
- Quick scenario presets (pricing, launch, crisis, hiring)

**`package.json`** — Standard Node.js configuration with ES modules (`"type": "module"`)

---

## Build and Run Commands

```bash
# Install dependencies
npm install

# Run the CLI simulation (requires ANTHROPIC_API_KEY)
npm start
# or
node agent.js

# Development mode with file watching
npm run dev
# or
node --watch agent.js
```

### Environment Setup

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

The application will fail to start without this environment variable.

---

## Architecture Overview

### Agent Personas (9 Specialized Roles)

| Key | Name | Role | Focus Areas |
|-----|------|------|-------------|
| `ceo` | Alex Rivera | CEO Strategist | Long-term positioning, competitive moat, capital efficiency |
| `customer` | Priya Shah | Customer Advocate | Churn probability, NPS impact, segment analysis |
| `competitor` | James Wu | Competitor Analyst | Rival response scenarios, market positioning, first-mover windows |
| `investor` | Sarah Kim | Investor Lens | Valuation impact, metric trajectories, board optics |
| `pessimist` | Marcus Cole | Devil's Advocate | Tail risks, assumption stress-testing, irreversibility |
| `data` | Lena Patel | Data Scientist | Probability distributions, sensitivity analysis, confidence intervals |
| `legal` | David Okonkwo | Legal & Compliance | Regulatory risk, contractual obligations, documentation needs |
| `media` | Nina Torres | Media & PR Analyst | Narrative framing, social amplification, reputation impact |
| `employee` | Ryan Kim | Employee & Culture Voice | Morale curves, flight risk, internal communication |

### Simulation Flow

1. **Input:** User provides scenario, domain, time horizon, company context, and selects agents
2. **Round 1:** Each selected agent analyzes the scenario independently from their perspective
3. **Round 2:** Each agent sees all Round 1 responses and debates/challenges assumptions
4. **Synthesis:** A dedicated Synthesis Agent aggregates all analyses into:
   - Outcome probability distribution (4-5 outcomes summing to 100%)
   - 5 key insights from agent disagreements
   - Confidence score (50-90 range based on consensus)
   - Executive summary (3 sentences)
   - Recommended action

### Data Types (JSDoc)

```javascript
// ScenarioRequest — Input to simulation
{
  scenario: string,        // The "what if" question
  domain: string,          // business-strategy | product-launch | pricing | crisis | etc.
  timeHorizon: string,     // 30d | 90d | 6m | 1y | 3y
  company?: string,        // Company context
  additionalContext?: string,
  agents: string[]         // Agent keys to activate
}

// SimulationReport — Output from simulation
{
  request: ScenarioRequest,
  conversation: AgentResponse[],
  outcomes: PredictionOutcome[],
  keyInsights: string[],
  confidenceScore: number,
  executiveSummary: string,
  recommendedAction: string,
  generatedAt: string
}
```

---

## Usage Examples

### CLI Usage

The `agent.js` file includes a demo `main()` function that runs automatically when executed:

```javascript
const request = {
  scenario: "What happens if we raise our Enterprise plan price from $499/mo to $625/mo (+25%) next quarter?",
  domain: "pricing",
  timeHorizon: "90d",
  company: "B2B SaaS, $5M ARR, 200 enterprise customers, 8% monthly churn, NPS 62",
  additionalContext: "Top 3 competitors price between $400-$550...",
  agents: ["ceo", "customer", "competitor", "investor", "pessimist", "data"]
};

const agent = new ScenarioMindAgent();
const report = await agent.simulate(request);
console.log(agent.exportToMarkdown(report));
agent.saveOutputs(report);  // Saves to output/ directory
```

### Programmatic Usage

```javascript
import { ScenarioMindAgent, AGENT_PERSONAS } from './agent.js';

const agent = new ScenarioMindAgent({ model: "claude-sonnet-4-6" });
const report = await agent.simulate({
  scenario: "Your scenario here",
  domain: "business-strategy",
  timeHorizon: "6m",
  agents: ["ceo", "data", "pessimist"]
});

// Ask follow-up questions
const answer = await agent.askFollowUp(report, "What's the biggest risk we missed?");

// Export results
const markdown = agent.exportToMarkdown(report);
agent.saveOutputs(report, "./my-reports");
```

---

## Code Style Guidelines

### Current Conventions

- **ES Modules:** Uses `import/export` syntax (`"type": "module"` in package.json)
- **JSDoc:** All public methods have JSDoc type annotations
- **Naming:** camelCase for variables/functions, PascalCase for classes, UPPER_SNAKE for constants
- **Comments:** ASCII box headers for major sections, line comments for subsections
- **Agent Prompts:** Each persona has a `systemPrompt` (~100-150 words) with:
  - Role definition and experience level
  - Specific analytical lens (3-4 bullet points)
  - Output constraints (word limits, quantification requirements)

### String Formatting

- Template literals for multi-line strings and variable interpolation
- Prompts use backtick strings for easy variable injection
- JSON extraction from AI responses uses `_extractJSON()` helper

### Error Handling

- Try/catch around JSON parsing in `synthesizeReport()`
- Graceful fallback when synthesis fails (returns empty report structure)
- No retry logic currently implemented for API failures

---

## Testing Strategy

**Current State:** No automated tests are included in this project.

**Manual Testing Approach:**
1. Run `node agent.js` with default scenario to verify end-to-end flow
2. Check `output/` directory for generated `.md` and `.json` files
3. Open `demo.html` in browser to test UI interactions
4. Verify environment variable loading with missing `.env` file

**Validation Checklist:**
- [ ] All 9 agent personas return non-empty analyses
- [ ] Round 2 responses reference Round 1 content
- [ ] Synthesis report contains valid JSON with required fields
- [ ] Outcome probabilities sum to approximately 100%
- [ ] Markdown export renders correctly
- [ ] Output files are created in specified directory

---

## Security Considerations

### API Key Handling
- **CRITICAL:** Never commit `.env` file to version control
- API key loaded via `dotenv` at runtime
- No key validation — application will fail cryptically if missing/invalid

### Input Sanitization
- No input sanitization currently implemented
- User-provided scenario/context strings are passed directly to AI prompts
- HTML demo uses `esc()` function for basic XSS prevention in follow-up chat

### Data Privacy
- All scenario data is sent to Anthropic's API
- No local storage of conversation history beyond the final report
- No PII detection or filtering

---

## Deployment Notes

### Current Implementation
- Single-file Node.js application
- No server framework (Express/Fastify) — runs as CLI script
- No persistent database — outputs saved to filesystem

### Production Considerations
- Add rate limiting for API calls (currently unlimited)
- Implement request queue for concurrent simulations
- Add structured logging (Winston/Pino) instead of console.*
- Consider adding Redis for session state if building web API
- Add input validation middleware

---

## Related Resources

- **MiroFish:** Open source foundation (MIT license, 32K+ GitHub stars)
- **EY Validation:** 90% correlation with real-world outcomes (Global Wealth Research Report)
- **Market Research:** $34B digital twin & simulation market (Fortune Business Insights)

---

## Development Context

This is **Day 3 of 100** in the "100 Days, 100 AI Agents" challenge by Sathish Lella. The project was built in a single day as a public demonstration of rapid AI product development.

**Previous days:**
- Day 1: MeetingMind AI (meeting prep)
- Day 2: ContentRepurpose AI (content repurposing)
- Day 3: ScenarioMind AI (this project)

---

*Last updated: 2026-04-04*
