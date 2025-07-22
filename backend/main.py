from fastapi import FastAPI

from api import auth, chatbot, voicebot

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
# app.include_router(bot.router, prefix="/bots", tags=["Bot"])
app.include_router(chatbot.router, prefix="/chatbot/sessions", tags=["Session"])
app.include_router(voicebot.router, prefix="/voicebot/sessions", tags=["Session"])