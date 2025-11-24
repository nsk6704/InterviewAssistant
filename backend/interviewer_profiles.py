import random

# Interviewer profiles with diverse names and genders
INTERVIEWER_PROFILES = [
    # Female - English/American
    {"name": "Emma Richardson", "gender": "female", "voice": "Ruby-PlayAI"},
    {"name": "Sarah Mitchell", "gender": "female", "voice": "Eleanor-PlayAI"},
    {"name": "Jennifer Hayes", "gender": "female", "voice": "Jennifer-PlayAI"},
    
    # Male - English/American
    {"name": "James Anderson", "gender": "male", "voice": "Mason-PlayAI"},
    {"name": "Michael Chen", "gender": "male", "voice": "Calum-PlayAI"},
    {"name": "Robert Williams", "gender": "male", "voice": "Mitch-PlayAI"},
    
    # Female - Australian
    {"name": "Adelaide Harper", "gender": "female", "voice": "Adelaide-PlayAI"},
    {"name": "Sophie Thompson", "gender": "female", "voice": "Celeste-PlayAI"},
    
    # Male - Australian
    {"name": "Liam O'Connor", "gender": "male", "voice": "Cillian-PlayAI"},
    {"name": "Noah Bennett", "gender": "male", "voice": "Briggs-PlayAI"},
    
    # Female - Indian
    {"name": "Priya Sharma", "gender": "female", "voice": "Aaliyah-PlayAI"},
    {"name": "Ananya Patel", "gender": "female", "voice": "Nia-PlayAI"},
    
    # Male - Indian
    {"name": "Arjun Kumar", "gender": "male", "voice": "Mikail-PlayAI"},
    {"name": "Rohan Mehta", "gender": "male", "voice": "Angelo-PlayAI"},
]

def get_random_interviewer():
    """Select a random interviewer profile"""
    return random.choice(INTERVIEWER_PROFILES)

def get_voice_for_gender(gender: str) -> str:
    """Get appropriate voice based on gender"""
    # This is used as fallback if profile doesn't have voice
    if gender.lower() == "male":
        return random.choice(["Mason-PlayAI", "Calum-PlayAI", "Mitch-PlayAI", "Cillian-PlayAI"])
    else:
        return random.choice(["Ruby-PlayAI", "Eleanor-PlayAI", "Jennifer-PlayAI", "Celeste-PlayAI"])
