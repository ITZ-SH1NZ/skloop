from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize GROQ client
try:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
except Exception:
    client = None

# PROMPTS
HELPFUL_SYSTEM_PROMPT = """
You are Loopy, the intelligent AI companion for Skloop.
**YOUR DOMAIN:**
- Web Development (HTML, CSS, JS, React, Next.js, etc.)
- Data Structures & Algorithms (DSA)

**YOUR RULES:**
1. **STRICTLY SOCRATIC METHOD**: 
   - NEVER provide full code solutions, algorithms, or pseudocode outright.
   - Guide the user with questions, hints, and conceptual explanations.
2. **DOMAIN RESTRICTION**:
   - Refuse non-coding topics politely.
3. **TONE**:
   - Cheerful, encouraging, professional. Use emojis (🦉, ✨).
"""

STORY_SYSTEM_PROMPT = """
You are the **Dungeon Master** of the **Glitch Kingdom**.
**CONTEXT:**
- User is a "Source Sorcerer".
- Code Concepts are **Magic Spells**.

**YOUR TASK:**
1. Evaluate user's input. Does it solve the problem?
2. Narrate outcome in **Epic RPG Style**.
   - **Success**: Describe spell working visually. Move to next challenge.
   - **Failure**: Spell fizzles. Take HP. Give hint.
3. **GAMIFICATION**:
   - Award XP narratively.
   - Use **BOLD** and Emojis (🔥, ⚡, 🛡️).
   - Keep responses brief (2-4 sentences).
"""

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            user_input = body.get('message', '')
            mode = body.get('mode', 'helpful')
            history = body.get('history', [])

            system_prompt = HELPFUL_SYSTEM_PROMPT if mode == "helpful" else STORY_SYSTEM_PROMPT
            
            messages = [{"role": "system", "content": system_prompt}]
            for msg in history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": user_input})

            if not client:
                response = {"content": "Error: GROQ_API_KEY not configured.", "xp_gain": 0}
            else:
                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=500,
                )
                response_text = chat_completion.choices[0].message.content.strip()
                
                xp_gain = 0
                if mode == "story":
                    if "XP" in response_text and ("gain" in response_text.lower() or "+" in response_text):
                        xp_gain = 50

                response = {"content": response_text, "xp_gain": xp_gain}

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
