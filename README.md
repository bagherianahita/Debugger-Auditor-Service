# trust-debugger-service

Express + TypeScript service that audits trust scoring logic by comparing `scoringInput` + `scoringResult` and returning an audit report.

## Requirements

- Node.js 22+ (recommended)
- npm

## Setup

```bash 
cp .env.example .env
npm install
```

## Run

### Dev 

```bash
npm run dev
```

### Build + start (prod)

```bash
npm run build
npm start
```

## Endpoints

- `GET /health`
- `POST /debug/audit`
- `POST /debug/batch-audit`

## Example payload (single audit)

```json
{
  "scoringInput": {
    "pathway": "some-pathway",
    "monthlyIncome": 5000,
    "rentAmount": 1500
  },
  "scoringResult": {
    "totalScore": 80,
    "fixedScore": 50,
    "variableScore": 30,
    "pathway": "some-pathway",
    "thresholdMet": true
  }
}
```

## Docker

```bash
docker build -t trust-debugger-service .
docker run --rm -p 4000:4000 --env-file .env trust-debugger-service
```

