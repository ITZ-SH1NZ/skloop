import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/utils/supabase/server';

if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(userId)
    if (!entry || entry.resetAt < now) { rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 }); return true }
    if (entry.count >= 20) return false
    entry.count++
    return true
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!checkRateLimit(user.id)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const systemPrompt = `You are a learning roadmap generator. 
Generate a structured learning path as JSON with the following format:

{
  "nodes": [
    {
      "id": "1",
      "label": "Topic Name",
      "description": "Brief description (max 50 chars)",
      "x": 200,
      "y": 50
    }
  ],
  "edges": [
    {"from": "1", "to": "2"}
  ]
}

Rules:
1. Create 6-10 nodes representing learning milestones
2. Each node must have unique id (string number)
3. Label should be concise (2-3 words max)
4. Description should be actionable and brief
5. Position nodes in a logical flow (x: 100-500, y: 50-450)
6. Edges show prerequisites (learn "from" before "to")
7. Output ONLY valid JSON, no markdown or explanations
8. Create a clear visual hierarchy with proper spacing`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: `Generate a learning roadmap for: ${prompt}`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000,
        });

        let responseText = chatCompletion.choices[0]?.message?.content?.trim() || '';

        // Safely extract the JSON object, ignoring any conversational preamble from the AI
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in the AI response');
        }

        const roadmapData = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!roadmapData.nodes || !roadmapData.edges) {
            throw new Error('Invalid roadmap structure');
        }

        return NextResponse.json(roadmapData);
    } catch (error) {
        console.error('Error generating roadmap:', error);
        return NextResponse.json(
            { error: 'Failed to generate roadmap' },
            { status: 500 }
        );
    }
}
