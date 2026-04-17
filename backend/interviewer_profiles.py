import random

# Interviewer profiles with diverse names and genders
INTERVIEWER_PROFILES = [
    # Female - English/American
    {"name": "Emma Richardson", "gender": "female", "voice": "autumn"},
    {"name": "Sarah Mitchell", "gender": "female", "voice": "diana"},
    {"name": "Jennifer Hayes", "gender": "female", "voice": "hannah"},
    
    # Male - English/American
    {"name": "James Anderson", "gender": "male", "voice": "austin"},
    {"name": "Michael Chen", "gender": "male", "voice": "daniel"},
    {"name": "Robert Williams", "gender": "male", "voice": "troy"},
    
    # Female - Australian
    {"name": "Adelaide Harper", "gender": "female", "voice": "autumn"},
    {"name": "Sophie Thompson", "gender": "female", "voice": "hannah"},
    
    # Male - Australian
    {"name": "Liam O'Connor", "gender": "male", "voice": "daniel"},
    {"name": "Noah Bennett", "gender": "male", "voice": "austin"},
    
    # Female - Indian
    {"name": "Priya Sharma", "gender": "female", "voice": "diana"},
    {"name": "Ananya Patel", "gender": "female", "voice": "autumn"},
    
    # Male - Indian
    {"name": "Arjun Kumar", "gender": "male", "voice": "troy"},
    {"name": "Rohan Mehta", "gender": "male", "voice": "daniel"},
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
