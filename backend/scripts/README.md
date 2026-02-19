# Roadmap Generator Setup

## Install Dependencies

```bash
pip install groq python-dotenv
```

## Setup

1. Get your GROQ API key from: https://console.groq.com/keys
2. Create `.env` file in `scripts/` directory:
   ```
   GROQ_API_KEY=your_api_key_here
   ```

## Usage

### Command Line
```bash
python scripts/generate_roadmap.py "I want to learn backend development"
```

### Output
- Prints JSON to console
- Saves to `roadmap.json`

### Example Output
```json
{
  "nodes": [
    {"id": "1", "label": "HTTP Basics", "description": "...", "x": 300, "y": 50},
    {"id": "2", "label": "Node.js", "description": "...", "x": 200, "y": 150}
  ],
  "edges": [
    {"from": "1", "to": "2"}
  ]
}
```

## Integration with Next.js

To integrate with the roadmap page, you can:

1. **Option A: API Route** (Recommended)
   - Create `/app/api/generate-roadmap/route.ts`
   - Call GROQ from server-side
   - Frontend calls this endpoint

2. **Option B: Python Microservice**
   - Run Python script as separate service
   - Expose REST endpoint
   - Frontend calls Python service

Example API route:
```typescript
// app/api/generate-roadmap/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  
  // ... call GROQ and return JSON
}
```

## Available GROQ Models

- `llama-3.3-70b-versatile` (Default, fast & capable)
- `mixtral-8x7b-32768` (Good for long context)
- `gemma2-9b-it` (Lightweight)

See docs: https://console.groq.com/docs/models
