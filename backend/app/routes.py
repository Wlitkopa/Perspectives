
from flask import Blueprint, jsonify, request
from app.models import *
from app.extensions import db


api = Blueprint('api', __name__)


# SYMULACJA GENERATORA POSTÓW
def generatePosts(prompt_data):
    # Tu wrzucasz swoją logikę AI lub LLM
    return [
        f"Generated post based on: {prompt_data['text']} - #{tag}"
        for tag in prompt_data['tags']
    ]

# ENDPOINT 1: POST /posts
@api.route('/posts', methods=['POST'])
def create_prompt_and_generate_posts():
    data = request.json
    image = data.get('image')
    text = data.get('text')
    tags = data.get('tags', [])

    new_prompt = Prompt(image=image, text=text, tags=tags)
    db.session.add(new_prompt)
    db.session.commit()

    # Wygeneruj posty i zapisz
    generated = generatePosts({'text': text, 'tags': tags})
    for content in generated:
        db.session.add(Post(prompt_id=new_prompt.id, content=content))
    db.session.commit()

    return jsonify({
        'prompt_id': new_prompt.id
    }), 201

# ENDPOINT 2: GET /prompts
@api.route('/prompts', methods=['GET'])
def get_all_prompts():
    prompts = Prompt.query.all()

    return [p.to_json() for p in prompts], 200

# ENDPOINT 3: GET /posts/<id>
@api.route('/posts/<int:prompt_id>', methods=['GET'])
def get_posts_by_prompt_id(prompt_id):
    posts = Post.query.filter_by(prompt_id=prompt_id).all()
    if not posts:
        return jsonify({'error': 'No posts for given prompt id.'}), 404

    return [p.to_json() for p in posts], 200

