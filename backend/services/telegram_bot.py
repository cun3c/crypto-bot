import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.base_url = f"https://api.telegram.org/bot{self.token}"
    
    async def send_message(self, text: str, chat_id: str = None):
        if not self.token:
            logger.warning("Telegram bot token not configured")
            return
        
        target_chat = chat_id or self.chat_id
        if not target_chat:
            logger.warning("Telegram chat_id not configured")
            return
        
        url = f"{self.base_url}/sendMessage"
        data = {
            "chat_id": target_chat,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(url, json=data)
                if res.status_code != 200:
                    logger.error(f"Telegram send failed: {res.text}")
            except Exception as e:
                logger.error(f"Telegram error: {e}")
    
    async def send_trade_alert(self, trade: dict):
        symbol = trade.get("symbol", "N/A")
        side = trade.get("side", "N/A").upper()
        quantity = trade.get("amount", 0)
        price = trade.get("price", 0)
        
        emoji = "🟢" if side == "BUY" else "🔴"
        text = f"""
{emoji} *Trade Executed*

*Symbol:* `{symbol}`
*Side:* {side}
*Quantity:* {quantity}
*Price:* ${price:.4f}
*Time:* {trade.get('created_at', 'N/A')}
"""
        await self.send_message(text)
    
    async def send_signal_alert(self, signal: dict):
        symbol = signal.get("symbol", "N/A")
        strategy = signal.get("strategy", "N/A")
        text = f"""
📊 *New Signal Received*

*Symbol:* `{symbol}`
*Strategy:* {strategy}
*Action:* {signal.get('action', 'N/A').upper()}
*Price:* ${signal.get('price', 0):.4f}
"""
        await self.send_message(text)
    
    async def send_status(self, balance: dict, mode: str, risk_enabled: bool):
        usdt = balance.get("total", {}).get("USDT", 0)
        text = f"""
🤖 *Bot Status*

*Mode:* {'🧪 Demo' if mode == 'demo' else '⚠️ Live'}
*Balance:* ${usdt:.2f} USDT
*Risk Management:* {'✅ ON' if risk_enabled else '❌ OFF'}
"""
        await self.send_message(text)

telegram_bot = TelegramBot()