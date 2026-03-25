import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import webhook, trades, stats, settings, mode, signals, account, ws, telegram, process
from config import settings as app_settings
from services.signal_processor import SignalProcessor
from services.order_monitor import OrderMonitor
from services.telegram_bot import telegram_bot
from database.db import engine, Base
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Crypto Algo Bot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Setup database (optional - skip if no DATABASE_URL)
    if app_settings.DATABASE_URL:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            logging.warning(f"Database connection failed: {e}")
    else:
        logging.info("No DATABASE_URL - running without database")

    # Start the signal processor background task (only if Redis available)
    if app_settings.REDIS_URL:
        processor = SignalProcessor()
        asyncio.create_task(processor.start())
    
    # Start the order monitor background task (only if DB available)
    if app_settings.DATABASE_URL:
        monitor = OrderMonitor()
        asyncio.create_task(monitor.start())
    
    # Start the WS redis listener (only if Redis available)
    if app_settings.REDIS_URL:
        asyncio.create_task(ws.manager.listen_to_redis())
    
    # Set Telegram webhook
    if app_settings.TELEGRAM_BOT_TOKEN:
        await setup_telegram_webhook()

async def setup_telegram_webhook():
    import httpx
    base_url = f"https://api.telegram.org/bot{app_settings.TELEGRAM_BOT_TOKEN}"
    # Get the public URL - user needs to configure this
    webhook_url = f"{app_settings.WEBHOOK_BASE_URL}/telegram" if hasattr(app_settings, 'WEBHOOK_BASE_URL') else None
    
    if webhook_url:
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{base_url}/setWebhook", json={"url": webhook_url})
            except Exception as e:
                logger.warning(f"Could not set Telegram webhook: {e}")

app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
app.include_router(trades.router, prefix="/trades", tags=["trades"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(mode.router, prefix="/mode", tags=["mode"])
app.include_router(signals.router, prefix="/signals", tags=["signals"])
app.include_router(account.router, prefix="/account", tags=["account"])
app.include_router(ws.router, tags=["websocket"])
app.include_router(telegram.router, tags=["telegram"])
app.include_router(process.router, prefix="/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Crypto Algo Bot API is running", "mode": app_settings.MODE}
