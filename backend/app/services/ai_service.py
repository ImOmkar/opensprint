import os
import json
from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def generate_sprint_summary(sprint, dives):

    deep_dive_text = "\n\n".join([
        f"""
Title: {d.get("title")}
Problem: {d.get("problem")}
Hypothesis: {d.get("hypothesis")}
Tests: {d.get("tests")}
Conclusion: {d.get("conclusion")}
"""
        for d in dives
    ])

    prompt = f"""
You are an expert engineering mentor.

Summarize the following sprint into:

1. Overall objective
2. Key learnings
3. Major challenges faced
4. Technical improvements
5. Recommended next steps

Sprint Title: {sprint.get("title")}
Sprint Goal: {sprint.get("goal")}

Deep Dives:
{deep_dive_text}

Make it structured and professional.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.5,
        )
    )

    return response.text


async def improve_text(text: str, field: str):

    prompt = f"""
You are an expert engineering writing assistant.

Rewrite the following {field} section to:

- Improve grammar
- Improve clarity
- Improve structure
- Keep original meaning
- Do NOT add new technical assumptions
- Keep it concise
- Keep markdown formatting if present

Text:
{text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text


async def generate_tags(content: str):

    prompt = f"""
You are an expert engineering knowledge classifier.

From the following content, extract 5-8 short technical tags.

Rules:
- lowercase
- single words when possible
- no duplicates
- no hashtags
- no explanations
- return comma-separated only

Content:
{content}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()

    tags = [t.strip().lower() for t in raw.split(",") if t.strip()]

    return list(set(tags))


import asyncio

async def expand_concept(concept: str):
    prompt = f"""
You are helping an engineer explore a technical concept.

concept: {concept}

Return ONLY valid JSON in this format:

{{
    "problem": "..."
    "hypothesis": "..."
    "tests": "..."
    "conclusion": "..."
}}

Keep explanations concise and technical.
"""

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=prompt,
        config={"response_mime_type": "application/json"}
    )

    try:
        data = json.loads(response.text)
    except: 
        data = {
            "problem": "",
            "hypothesis": "",
            "tests": "",
            "conclusion": ""
        }

    return {
        "test": concept,
        **data
    }



async def suggest_next_concepts(concept: str):

    prompt = f"""
You are helping an engineer explore related concepts.

Concept: {concept}

Suggest 5 related engineering concepts that should be explored next.

Return ONLY a JSON array.

Example:
["cache invalidation", "write-through caching"]
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip().replace("```json", "").replace("```", "")

    import json

    try:
        return json.loads(text)
    except:
        return []