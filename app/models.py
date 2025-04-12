from app.extensions import db

# MODELE

class Prompt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.String, nullable=True)
    text = db.Column(db.Text, nullable=False)
    posts = db.relationship('Post', backref='prompt', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'image': self.image,
            'text': self.text
        }


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    prompt_id = db.Column(db.Integer, db.ForeignKey('prompt.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    eng_text = db.Column(db.Text, nullable=False)
    culture = db.Column(db.String, nullable=False)
    image = db.Column(db.String, nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'prompt_id': self.prompt_id,
            'text': self.text,
            'eng_text': self.eng_text,
            'culture': self.culture,
            'image': self.image
        }