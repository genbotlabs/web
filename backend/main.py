from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, chatbot, voicebot, bot, model_bot
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chatbot.router, prefix="/chatbot/sessions", tags=["Session"])
app.include_router(voicebot.router, prefix="/voicebot/sessions", tags=["Session"])
app.include_router(bot.router, prefix="/bots", tags=["Bot"])
# app.include_router(session.router, prefix="/sessions", tags=["Session"])
app.include_router(model_bot.router, prefix="/sessions", tags=["ModelBot"])
