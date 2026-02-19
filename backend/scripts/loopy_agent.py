"""
Loopy AI Agent (Python)
Matches the pattern of generate_roadmap.py.
Handles "Helpful" and "Story" modes, calls Groq, and outputs JSON.

Usage:
    python loopy_agent.py "User Input" "mode" "history_json_string"
"""

import os
import json
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

# ------------------------------------------------------------------------------
# PROMPTS
# ------------------------------------------------------------------------------

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

def generate_response(user_input: str, mode: str, history: list) -> dict:
    """
    Generate a response using GROQ API
    Returns: dict with 'content', 'xp_gain' (optional)
    """
    
    system_prompt = HELPFUL_SYSTEM_PROMPT if mode == "helpful" else STORY_SYSTEM_PROMPT
    
    # Construct messages
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history (limit to last 10 messages to save context)
    for msg in history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": user_input})

    try:
        if not client:
            raise ValueError("GROQ_API_KEY not found")

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=500,
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Parse for XP if in story mode (simple heuristic or structure)
        xp_gain = 0
        if mode == "story":
            # Simple check if "XP" is mentioned in a positive context
            if "XP" in response_text and ("gain" in response_text.lower() or "+" in response_text):
                xp_gain = 50 

        return {
            "content": response_text,
            "xp_gain": xp_gain
        }

    except Exception as e:
        # Fallback Mock
        if mode == "helpful":
            return {"content": "I see you're typing... (Groq API Key missing or Error). Check your scope!", "xp_gain": 0}
        else:
            return {"content": "The spell hits with a **LIME GREEN EXPLOSION**! 💥 (Mock Response)", "xp_gain": 50}

def main():
    if len(sys.argv) < 3:
        # Default for testing
        user_input = "Hello"
        mode = "helpful"
        history = []
    else:
        user_input = sys.argv[1]
        mode = sys.argv[2]
        history_str = sys.argv[3] if len(sys.argv) > 3 else "[]"
        try:
            history = json.loads(history_str)
        except:
            history = []

    response = generate_response(user_input, mode, history)
    
    # Output JSON to stdout (so Node can capture it)
    print(json.dumps(response), flush=True)

if __name__ == "__main__":
    main()
