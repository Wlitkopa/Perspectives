# run2.py
from backend.app.extensions import db
from backend.app.models import *


def get_cultural_context(prompt_data):
    pass

# SYMULACJA GENERATORA POSTÓW
async def generate_posts(prompt_data):

    # 1. Pobierz dane z 1 LLMa
    cultural_context = get_cultural_context(prompt_data)

    # 2. Pobierz wygenerowany post z 2 LLMa (chataGPT)
        # API call do chataGPT

    # 3. Zapisz w bazie danych
    # for post in posts:
    #     db.session.add(Post(prompt_id=new_prompt.id, content=content))
    # db.session.commit()