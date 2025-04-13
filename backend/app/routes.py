
from flask import Blueprint, jsonify, request
from app.models import *
from app.extensions import db
import app.llm_api
import json

api = Blueprint('api', __name__)




# ENDPOINT 1: POST /posts
@api.route('/prompts', methods=['POST'])
def create_prompt_and_generate_posts():
    data = request.form
    image = data.get('image')
    text = data.get('text')
    regions = json.loads(data.get('locations', "[]"))

    new_prompt = Prompt(image=image, text=text)
    db.session.add(new_prompt)
    db.session.commit()

    app.llm_api.generate_posts(new_prompt, regions)

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

