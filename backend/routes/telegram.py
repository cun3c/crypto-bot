from fastapi import APIRouter, Request
from services.telegram_bot import telegram_bot
from services.order_monitor import OrderMonitor
from exchanges.exchange_factory import get_exchange
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/telegram")
async def handle_telegram_update(request: Request):
    if not settings.TELEGRAM_BOT_TOKEN:
        return {"ok": True}
    
    try:
        data = await request.json()
        
        if "message" in data:
            message = data["message"]
            chat_id = str(message["chat"]["id"])
            text = message.get("text", "")
            
            if text.startswith("/"):
                await handle_command(text, chat_id)
        
        return {"ok": True}
    except Exception as e:
        logger.error(f"Telegram error: {e}")
        return {"ok": True}

async def handle_command(command: str, chat_id: str):
    parts = command.split()
    cmd = parts[0].lower()
    
    if cmd == "/start":
        await telegram_bot.send_message(
            "🤖 *Crypto Algo Bot*\n\n"
            "Welcome! Use these commands:\n"
            "/status - Check balance & status\n"
            "/trades - View recent trades\n"
            "/risk on - Enable risk management\n"
            "/risk off - Disable risk management\n"
            "/help - Show all commands",
            chat_id
        )
    
    elif cmd == "/status":
        exchange = get_exchange(settings.MODE)
        try:
            balance = await exchange.get_balance()
            await telegram_bot.send_status(
                balance, 
                settings.MODE, 
                settings.USE_RISK_MANAGEMENT
            )
        finally:
            await exchange.close()
    
    elif cmd == "/trades":
        await telegram_bot.send_message(
            "📋 *Recent Trades*\n\n"
            "Check the web dashboard or API for trade history.",
            chat_id
        )
    
    elif cmd == "/risk":
        if len(parts) > 1:
            if parts[1].lower() == "on":
                settings.USE_RISK_MANAGEMENT = True
                await telegram_bot.send_message("✅ Risk management enabled", chat_id)
            elif parts[1].lower() == "off":
                settings.USE_RISK_MANAGEMENT = False
                await telegram_bot.send_message("❌ Risk management disabled", chat_id)
            else:
                await telegram_bot.send_message("Use /risk on or /risk off", chat_id)
        else:
            status = "ON" if settings.USE_RISK_MANAGEMENT else "OFF"
            await telegram_bot.send_message(f"Risk management is currently *{status}*", chat_id)
    
    elif cmd == "/help":
        await telegram_bot.send_message(
            "📖 *Commands*\n\n"
            "/start - Welcome message\n"
            "/status - Bot status & balance\n"
            "/trades - Recent trades\n"
            "/risk on/off - Toggle risk management\n"
            "/help - Show this help",
            chat_id
        )
    
    else:
        await telegram_bot.send_message(f"Unknown command: {cmd}\nUse /help for available commands.", chat_id)