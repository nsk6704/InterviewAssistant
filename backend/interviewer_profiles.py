import random

# Interviewer profiles with diverse names and genders
INTERVIEWER_PROFILES = [
    # Female - English/American
    {"name": "Emma Richardson", "gender": "female", "voice": "autumn", "tts_direction": "friendly"},
    {"name": "Sarah Mitchell", "gender": "female", "voice": "diana", "tts_direction": "professionally"},
    {"name": "Jennifer Hayes", "gender": "female", "voice": "hannah", "tts_direction": "warm"},
    
    # Male - English/American
    {"name": "James Anderson", "gender": "male", "voice": "austin", "tts_direction": "confidently"},
    {"name": "Michael Chen", "gender": "male", "voice": "daniel", "tts_direction": "professionally"},
    {"name": "Robert Williams", "gender": "male", "voice": "troy", "tts_direction": "authoritatively"},
    
    # Female - Australian
    {"name": "Adelaide Harper", "gender": "female", "voice": "autumn", "tts_direction": "casual"},
    {"name": "Sophie Thompson", "gender": "female", "voice": "hannah", "tts_direction": "friendly"},
    
    # Male - Australian
    {"name": "Liam O'Connor", "gender": "male", "voice": "daniel", "tts_direction": "casual"},
    {"name": "Noah Bennett", "gender": "male", "voice": "austin", "tts_direction": "confidently"},
    
    # Female - Indian
    {"name": "Priya Sharma", "gender": "female", "voice": "diana", "tts_direction": "professionally"},
    {"name": "Ananya Patel", "gender": "female", "voice": "autumn", "tts_direction": "warm"},
    
    # Male - Indian
    {"name": "Arjun Kumar", "gender": "male", "voice": "troy", "tts_direction": "authoritatively"},
    {"name": "Rohan Mehta", "gender": "male", "voice": "daniel", "tts_direction": "professionally"},
]

def get_random_interviewer():
    """Select a random interviewer profile"""
    return random.choice(INTERVIEWER_PROFILES)

def get_voice_for_gender(gender: str) -> str:
    """Get appropriate voice based on gender"""
    # This is used as fallback if profile doesn't have voice
    if gender.lower() == "male":
        return random.choice(["austin", "daniel", "troy"])
    else:
        return random.choice(["autumn", "diana", "hannah"])
