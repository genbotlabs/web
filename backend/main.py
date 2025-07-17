from fastapi import FastAPI

from api import auth, session

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
# app.include_router(bot.router, prefix="/bots", tags=["Bot"])
app.include_router(session.router, prefix="/chatbot/sessions", tags=["Session"])