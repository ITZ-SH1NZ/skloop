"""
Roadmap Generator using GROQ API
Generates learning roadmap JSON from user prompts

Requirements:
    pip install groq python-dotenv

Usage:
    python generate_roadmap.py "I want to learn backend development"
"""

import os
import json
import sys
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize GROQ client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_roadmap(user_prompt: str) -> dict:
    """
    Generate a structured learning roadmap using GROQ API
    
    Args:
        user_prompt: User's learning goal (e.g., "I want to learn React")
    
    Returns:
        dict: Roadmap data with nodes and edges
    """
    
    system_prompt = """You are a learning roadmap generator. 
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
2. Each node must have unique id (string)
3. Label should be concise (2-3 words max)
4. Description should be actionable and brief
5. Position nodes in a logical flow (x: 0-600, y: 0-500)
6. Edges show prerequisites (learn "from" before "to")
7. Output ONLY valid JSON, no markdown or explanations

Example positions for visual flow:
- Start at top-center: x=300, y=50
- Spread nodes vertically and horizontally
- Create a tree-like structure
"""

    try:
        # Call GROQ API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"Generate a learning roadmap for: {user_prompt}"
                }
            ],
            model="llama-3.3-70b-versatile",  # Fast and capable model
            temperature=0.7,
            max_tokens=2000,
        )
        
        # Extract response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Parse JSON (handle potential markdown code blocks)
        if response_text.startswith("```"):
            # Remove markdown code block
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        roadmap_data = json.loads(response_text)
        
        # Validate structure
        if "nodes" not in roadmap_data or "edges" not in roadmap_data:
            raise ValueError("Invalid roadmap structure")
        
        return roadmap_data
    
    except Exception as e:
        print(f"Error generating roadmap: {e}", file=sys.stderr)
        return get_fallback_roadmap(user_prompt)


def get_fallback_roadmap(topic: str) -> dict:
    """Fallback roadmap if API call fails"""
    return {
        "nodes": [
            {"id": "1", "label": "Fundamentals", "description": f"Basic {topic} concepts", "x": 300, "y": 50},
            {"id": "2", "label": "Core Skills", "description": "Essential techniques", "x": 200, "y": 150},
            {"id": "3", "label": "Advanced", "description": "Complex topics", "x": 400, "y": 150},
            {"id": "4", "label": "Projects", "description": "Build real applications", "x": 300, "y": 250},
        ],
        "edges": [
            {"from": "1", "to": "2"},
            {"from": "1", "to": "3"},
            {"from": "2", "to": "4"},
            {"from": "3", "to": "4"},
        ]
    }


def save_roadmap(roadmap_data: dict, filename: str = "roadmap.json"):
    """Save roadmap to JSON file"""
    with open(filename, 'w') as f:
        json.dump(roadmap_data, f, indent=2)
    print(f"✅ Roadmap saved to {filename}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_roadmap.py \"Your learning goal\"")
        print("Example: python generate_roadmap.py \"I want to learn React\"")
        sys.exit(1)
    
    user_prompt = " ".join(sys.argv[1:])
    
    print(f"🎯 Generating roadmap for: {user_prompt}")
    print("⏳ Calling GROQ API...")
    
    roadmap = generate_roadmap(user_prompt)
    
    # Print to console
    print("\n📊 Generated Roadmap:")
    print(json.dumps(roadmap, indent=2))
    
    # Save to file
    save_roadmap(roadmap)


if __name__ == "__main__":
    main()
