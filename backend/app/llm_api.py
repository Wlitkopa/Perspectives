from app.extensions import db
from app.models import *

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from openai import OpenAI
import json

with open('app/api.key', 'r') as f:
    client = OpenAI(api_key=f.read())

tokenizer = AutoTokenizer.from_pretrained("google/gemma-2b-it")
model = AutoModelForCausalLM.from_pretrained(
    "./model",
    device_map="auto",
    torch_dtype=torch.bfloat16,
    use_safetensors=True
)

gpt_function_schema = {
    "name": "generate_culture_post",
    "description": "Generate social media post content adapted to a culture.",
    "parameters": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Text adapted to the culture, including local idioms, emojis, and style"
            },
            "eng_text": {
                "type": "string",
                "description": "Translation of the above text into English"
            },
            "image": {
                "type": "string",
                "description": "Description of how the image should be modified to match the culture"
            }
        },
        "required": ["text", "eng_text", "image"]
    }
}

def get_cultural_context(text, region):
    prompt_text = f"""Create a brief set of cultural characteristics of things mentioned in text "{text}" for region: {region}"""

    prompt = tokenizer(prompt_text, return_tensors="pt")

    print("Generating...")
    outputs = model.generate(**prompt, max_new_tokens=200)
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(generated_text)
    return generated_text

def generate_posts(prompt: Prompt, regions):

    cultural_contexts = []

    for region in regions:
        cultural_contexts.append(get_cultural_context(prompt.text, region))

    for region, context in zip(regions, cultural_contexts):
        response = client.chat.completions.create(model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a social media assistant that localizes content for different cultures."},
            {"role": "user", "content": f'Generate social media post content adapted to a culture {region} and its context {context}'}
        ],
        functions=[gpt_function_schema],
        function_call={"name": "generate_culture_post"},
        temperature=0.8)

        result = json.loads(response.choices[0].message.function_call.arguments)
        print(result)
        db.session.add(Post(prompt_id=prompt.id, text=result['text'], eng_text=result['eng_text'], culture=region, image=None))
        db.session.commit()
