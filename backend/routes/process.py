from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from models.signal import Signal
from models.trade import Trade, TradeStatus
from exchanges.exchange_factory import get_exchange
from services.risk_engine import RiskEngine
from services.telegram_bot import telegram_bot
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/process-signals")
async def process_pending_signals(db: AsyncSession = Depends(get_db)):
    risk_engine = RiskEngine()
    results = []
    
    # Get pending signals
    stmt = select(Signal).where(Signal.status == "pending")
    result = await db.execute(stmt)
    signals = result.scalars().all()
    
    for signal in signals:
        try:
            # Check allowed symbols
            if signal.symbol not in settings.ALLOWED_SYMBOLS:
                signal.status = "ignored"
                results.append({"id": signal.id, "status": "ignored", "reason": "symbol not allowed"})
                continue
            
            # Risk check
            if not await risk_engine.is_trade_allowed(signal, db):
                signal.status = "ignored"
                results.append({"id": signal.id, "status": "ignored", "reason": "risk check failed"})
                continue
            
            # Execute trade
            exchange = get_exchange(signal.mode)
            try:
                balance = await exchange.get_balance()
                usdt_balance = float(balance.get("total", {}).get("USDT", 0))
                
                # Get actual fill price and calculate SL/TP based on entry
                fill_price = order.get("price", signal.price_at_signal)
                
                # SL/TP based on actual entry price
                sl = fill_price * 0.98 if signal.action.upper() == "BUY" else fill_price * 1.02
                tp = fill_price * 1.04 if signal.action.upper() == "BUY" else fill_price * 0.96
                
                qty = risk_engine.calculate_position_size(usdt_balance, settings.RISK_PER_TRADE_PCT, signal.price_at_signal, sl)
                if qty <= 0:
                    qty = 0.001
                
                # Round to reasonable precision (3 decimals for most coins)
                qty = round(qty, 3)
                
                order = await exchange.place_market_order(signal.symbol, signal.action, qty)
                
                # Save trade
                trade = Trade(
                    signal_id=signal.id,
                    exchange="binance",
                    symbol=signal.symbol,
                    side=signal.action,
                    entry_price=order.get("price", signal.price_at_signal),
                    quantity=order.get("amount", qty),
                    mode=signal.mode,
                    order_id_exchange=order.get("id"),
                    stop_loss=sl,
                    take_profit=tp
                )
                db.add(trade)
                signal.status = "processed"
                
                results.append({"id": signal.id, "status": "processed", "symbol": signal.symbol, "side": signal.action, "qty": qty})
                
                # Send Telegram notification
                try:
                    await telegram_bot.send_trade_alert({
                        "symbol": signal.symbol,
                        "side": signal.action,
                        "amount": qty,
                        "price": order.get("price", signal.price_at_signal),
                        "created_at": "now"
                    })
                except Exception as e:
                    logger.warning(f"Failed to send telegram notification: {e}")
            finally:
                await exchange.close()
        except Exception as e:
            logger.error(f"Error processing signal {signal.id}: {e}")
            signal.status = "error"
            results.append({"id": signal.id, "status": "error", "error": str(e)})
    
    await db.commit()
    return {"processed": results}