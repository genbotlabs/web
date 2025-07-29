from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, chatbot, voicebot, bot, model_bot, s3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(voicebot.router, prefix="/voicebot", tags=["Voicebot"])
app.include_router(bot.router, prefix="/bots", tags=["Bot"])
app.include_router(s3.router, prefix="/s3", tags=["S3"])
# app.include_router(session.router, prefix="/sessions", tags=["Session"])
app.include_router(model_bot.router, prefix="/sessions", tags=["ModelBot"])
