# ScenarioMind — AI Simulation Chat for Scenario Prediction

> Day 3 of 100 | 100 Days, 100 AI Agents  
> Built by: Sathish Lella  
> Powered by: MiroFish (Open Source Swarm Intelligence) + Groq

ScenarioMind is a multi-agent AI simulation platform for business scenario prediction. Users describe a business scenario in plain English, and the system spawns specialized AI agent personas that debate, challenge assumptions, and generate Monte Carlo-style prediction reports.

## 🚀 Deploy to Vercel (One Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fscenariomind&env=GROQ_API_KEY)

**Required Environment Variable:**
- `GROQ_API_KEY` - Get yours free at [console.groq.com/keys](https://console.groq.com/keys)

## 📁 Project Structure

```
├── api/
│   ├── simulate.js      # POST /api/simulate - Run simulation
│   └── followup.js      # POST /api/followup - Ask follow-up
├── lib/
│   └── agent.js         # Core simulation engine (Groq)
├── public/
│   └── index.html       # Web UI
├── agent.js             # CLI version
├── package.json
└── vercel.json
```

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Set environment variable
export GROQ_API_KEY=gsk_your_key_here

# Run CLI version
npm start

# Or run with Vercel locally
npm run dev
```

## 🌐 API Usage

### Run Simulation

```bash
curl -X POST https://your-app.vercel.app/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "What happens if we raise prices 25%?",
    "domain": "pricing",
    "timeHorizon": "90d",
    "company": "B2B SaaS, $5M ARR",
    "agents": ["ceo", "customer", "competitor", "investor", "pessimist", "data"]
  }'
```

### Ask Follow-up

```bash
curl -X POST https://your-app.vercel.app/api/followup \
  -H "Content-Type: application/json" \
  -d '{
    "report": { ...full report object... },
    "question": "What is the biggest risk?"
  }'
```

## 🤖 Agent Personas (9 Specialized Roles)

| Agent | Name | Focus Areas |
|-------|------|-------------|
| `ceo` | Alex Rivera | Long-term positioning, competitive moat, capital efficiency |
| `customer` | Priya Shah | Churn probability, NPS impact, segment analysis |
| `competitor` | James Wu | Rival response scenarios, market positioning |
| `investor` | Sarah Kim | Valuation impact, metric trajectories |
| `pessimist` | Marcus Cole | Tail risks, assumption stress-testing |
| `data` | Lena Patel | Probability distributions, sensitivity analysis |
| `legal` | David Okonkwo | Regulatory risk, compliance requirements |
| `media` | Nina Torres | Narrative framing, social amplification |
| `employee` | Ryan Kim | Morale curves, flight risk, internal comms |

## 📊 How It Works

1. **Round 1**: Each selected agent analyzes the scenario independently
2. **Round 2**: Agents see all Round 1 responses and debate/challenge assumptions
3. **Synthesis**: A dedicated Synthesis Agent aggregates all analyses into:
   - Outcome probability distribution (4-5 outcomes, sums to 100%)
   - 5 key insights from agent disagreements
   - Confidence score (50-90 based on consensus)
   - Executive summary
   - Recommended action

## 🔧 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **AI Model**: Llama 3.3 70B via Groq (fast inference)
- **Frontend**: Vanilla HTML/CSS/JS
- **Deployment**: Vercel Serverless Functions

## 📄 License

MIT - Built by Sathish Lella as part of 100 Days, 100 AI Agents challenge.
