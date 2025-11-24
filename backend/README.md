# Interview Practice Partner Backend

FastAPI backend for the Interview Practice Partner AI Agent.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Groq API key
echo GROQ_API_KEY=your_groq_api_key_here > .env

# Run server
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `POST /start_interview` - Start new interview session
- `POST /chat` - Send message and get response
- `POST /feedback_result` - End interview and get feedback

## Environment Variables

- `GROQ_API_KEY` - Your Groq API key (required)
