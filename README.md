# Trust Debugger Auditor Service

**Scenario-based audit engine for trust-scoring logic** — compares `scoringInput` + `scoringResult` and returns structured pass/fail reports with contradiction detection.

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## Architecture

```
┌────────────────────┐     POST /debug/audit      ┌──────────────────────────────┐
│  API Client        │ ─────────────────────────► │  Express + TypeScript        │
│  (Demo / external) │ ◄───────────────────────── │  controllers/debugController │
└────────────────────┘     JSON AuditResult       └──────────────┬───────────────┘
                                                                 │
                                                    ┌────────────▼───────────────┐
                                                    │  TrustLogicAuditor         │
                                                    │  scenarios S01–S04         │
                                                    │  (affordability, compliance│
                                                    │   payments, verification)  │
                                                    └────────────────────────────┘
```

---

## Project structure

```
Debugger-Auditor-Service/
├── src/
│   ├── auditor/
│   │   ├── trustLogicAuditor.ts
│   │   └── scenarios.ts
│   ├── controllers/
│   ├── middleware/
│   └── types.ts
├── Dockerfile
├── .env.example
└── package.json
```

---

## Quick start (employers — no API keys)

```bash
cp .env.example .env
npm install
npm run dev
```

| | URL |
|---|-----|
| **API** | http://localhost:4000 |
| **Health check** | http://localhost:4000/health |

Try audit with defaults:

```bash
curl -X POST http://localhost:4000/debug/audit -H "Content-Type: application/json" -d "{\"scoringInput\":{\"pathway\":\"experienced_renter\",\"monthlyIncome\":2500,\"rentAmount\":2100,\"missedPayments\":2},\"scoringResult\":{\"totalScore\":85,\"fixedScore\":80,\"pathway\":\"experienced_renter\",\"fixedBreakdown\":{\"concerns\":[]}}}"
```

Production:

```bash
npm run build
npm start
```

Docker:

```bash
docker build -t trust-debugger-service .
docker run --rm -p 4000:4000 --env-file .env trust-debugger-service
```

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health |
| `POST` | `/debug/audit` | Single audit |
| `POST` | `/debug/batch-audit` | Batch audit (`cases[]`) |

### Example payload

```json
{
  "scoringInput": {
    "pathway": "experienced_renter",
    "monthlyIncome": 5000,
    "rentAmount": 3500,
    "missedPayments": 3
  },
  "scoringResult": {
    "totalScore": 72,
    "fixedScore": 45,
    "pathway": "experienced_renter",
    "fixedBreakdown": {
      "concerns": ["High rent-to-income ratio"]
    }
  }
}
```

---

## Scenarios

| ID | Name | Severity |
|----|------|----------|
| S01 | Rent-to-income not critically high or flagged | contradiction |
| S02 | Clean compliance checks should not produce low trust | warning |
| S03 | Multiple missed payments should produce concern | contradiction |
| S04 | Low verification signals should not be labelled high_trust | warning |

---

## Companion demo

Browser UI demo: [Demo](https://github.com/bagherianahita/Demo)

---

## License

MIT — see [LICENSE](LICENSE).
