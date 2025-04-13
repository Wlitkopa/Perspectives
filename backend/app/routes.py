
from flask import Blueprint, jsonify, request
from backend.app.models import *
from backend.app.extensions import db
from llm_api import *

api = Blueprint('api', __name__)




# ENDPOINT 1: POST /posts
@api.route('/prompts', methods=['POST'])
def create_prompt_and_generate_posts():
    data = request.json
    image = data.get('image')
    text = data.get('text')
    tags = data.get('tags', [])

    new_prompt = Prompt(image=image, text=text, tags=tags)
    db.session.add(new_prompt)
    db.session.commit()



    return jsonify({
        'prompt_id': new_prompt.id
    }), 201

# ENDPOINT 2: GET /prompts
@api.route('/prompts', methods=['GET'])
def get_all_prompts():
    prompts = Prompt.query.all()

    return [p.to_json() for p in prompts], 200

# ENDPOINT 3: GET /prompts/<id>/posts
@api.route('/prompts/<int:prompt_id>/posts', methods=['GET'])
def get_posts_by_prompt_id(prompt_id):
    posts = Post.query.filter_by(prompt_id=prompt_id).all()
    if not posts:
        return jsonify({'error': 'No posts for given prompt id.'}), 404

    return [p.to_json() for p in posts], 200

