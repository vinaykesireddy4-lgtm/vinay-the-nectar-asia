# Recovery Module Backend APIs
# Payment Recovery and Follow-up Management

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
import os

# Create recovery router
recovery_router = APIRouter()

# MongoDB connection (will be shared from server.py)
mongo_url = os.environ.get('MONGO_URL', '')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nectar_db')]


# ========== MODELS FOR RECOVERY ==========

class PaymentRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    invoice_id: str
    invoice_number: str
    payment_date: str
    amount: float
    payment_method: str  # cash, cheque, bank_transfer, upi, etc.
    reference_number: Optional[str] = ""
    notes: Optional[str] = ""
    recorded_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class FollowUpNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    invoice_id: str
    invoice_number: str
    follow_up_date: str
    contacted_person: Optional[str] = ""
    contact_method: str  # phone, email, whatsapp, visit
    notes: str
    next_follow_up_date: Optional[str] = None
    status: str  # contacted, promised_payment, disputed, no_response
    recorded_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ========== RECOVERY ROUTES ==========

@recovery_router.get("/recovery/stats")
async def get_recovery_stats():
    """Get recovery dashboard statistics"""
    try:
        # Get all invoices
        all_invoices = await db.invoices.find({"status": {"$ne": "cancelled"}}, {"_id": 0}).to_list(1000)
        
        today = datetime.now(timezone.utc)
        
        stats = {
            "total_outstanding": 0,
            "overdue_count": 0,
            "overdue_amount": 0,
            "due_this_week": 0,
            "due_this_week_amount": 0,
            "partially_paid_count": 0,
            "partially_paid_amount": 0,
            "critical_overdue": 0,  # >30 days
            "critical_overdue_amount": 0,
            "by_age": {
                "0-7": {"count": 0, "amount": 0},
                "8-15": {"count": 0, "amount": 0},
                "16-30": {"count": 0, "amount": 0},
                "31-60": {"count": 0, "amount": 0},
                "60+": {"count": 0, "amount": 0}
            }
        }
        
        for invoice in all_invoices:
            if invoice.get('payment_status') == 'paid':
                continue
                
            due_date = datetime.fromisoformat(invoice['due_date'].replace('Z', '+00:00'))
            days_overdue = (today - due_date).days
            
            outstanding = invoice['total_amount'] - invoice.get('paid_amount', 0)
            stats['total_outstanding'] += outstanding
            
            # Overdue invoices
            if days_overdue > 0:
                stats['overdue_count'] += 1
                stats['overdue_amount'] += outstanding
                
                # Critical overdue (>30 days)
                if days_overdue > 30:
                    stats['critical_overdue'] += 1
                    stats['critical_overdue_amount'] += outstanding
                
                # Age buckets
                if days_overdue <= 7:
                    stats['by_age']['0-7']['count'] += 1
                    stats['by_age']['0-7']['amount'] += outstanding
                elif days_overdue <= 15:
                    stats['by_age']['8-15']['count'] += 1
                    stats['by_age']['8-15']['amount'] += outstanding
                elif days_overdue <= 30:
                    stats['by_age']['16-30']['count'] += 1
                    stats['by_age']['16-30']['amount'] += outstanding
                elif days_overdue <= 60:
                    stats['by_age']['31-60']['count'] += 1
                    stats['by_age']['31-60']['amount'] += outstanding
                else:
                    stats['by_age']['60+']['count'] += 1
                    stats['by_age']['60+']['amount'] += outstanding
            
            # Due this week
            if 0 <= days_overdue <= 7:
                stats['due_this_week'] += 1
                stats['due_this_week_amount'] += outstanding
            
            # Partially paid
            if invoice.get('payment_status') == 'partially_paid':
                stats['partially_paid_count'] += 1
                stats['partially_paid_amount'] += outstanding
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.get("/recovery/overdue-invoices")
async def get_overdue_invoices(
    days_overdue: Optional[int] = None,
    customer_name: Optional[str] = None,
    min_amount: Optional[float] = None
):
    """Get all overdue invoices with filters"""
    try:
        query = {
            "status": {"$ne": "cancelled"},
            "payment_status": {"$in": ["unpaid", "partially_paid"]}
        }
        
        if customer_name:
            query["customer_name"] = {"$regex": customer_name, "$options": "i"}
        
        invoices = await db.invoices.find(query, {"_id": 0}).to_list(1000)
        
        today = datetime.now(timezone.utc)
        overdue_invoices = []
        
        for invoice in invoices:
            due_date = datetime.fromisoformat(invoice['due_date'].replace('Z', '+00:00'))
            days_past = (today - due_date).days
            
            if days_past > 0:  # Only overdue
                outstanding = invoice['total_amount'] - invoice.get('paid_amount', 0)
                
                # Apply filters
                if days_overdue and days_past < days_overdue:
                    continue
                if min_amount and outstanding < min_amount:
                    continue
                
                invoice['days_overdue'] = days_past
                invoice['outstanding_amount'] = outstanding
                
                # Get last follow-up
                last_followup = await db.follow_ups.find_one(
                    {"invoice_id": invoice['id']},
                    {"_id": 0},
                    sort=[("created_at", -1)]
                )
                invoice['last_follow_up'] = last_followup
                
                # Get payment history
                payments = await db.payment_records.find(
                    {"invoice_id": invoice['id']},
                    {"_id": 0}
                ).to_list(100)
                invoice['payment_history'] = payments
                
                overdue_invoices.append(invoice)
        
        # Sort by days overdue (most critical first)
        overdue_invoices.sort(key=lambda x: x['days_overdue'], reverse=True)
        
        return overdue_invoices
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.post("/recovery/record-payment")
async def record_payment(payment: PaymentRecord):
    """Record a payment against an invoice"""
    try:
        # Get invoice
        invoice = await db.invoices.find_one({"id": payment.invoice_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Save payment record
        await db.payment_records.insert_one(payment.model_dump())
        
        # Update invoice
        paid_amount = invoice.get('paid_amount', 0) + payment.amount
        
        if paid_amount >= invoice['total_amount']:
            payment_status = 'paid'
        elif paid_amount > 0:
            payment_status = 'partially_paid'
        else:
            payment_status = 'unpaid'
        
        await db.invoices.update_one(
            {"id": payment.invoice_id},
            {"$set": {
                "paid_amount": paid_amount,
                "payment_status": payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": "Payment recorded successfully",
            "paid_amount": paid_amount,
            "payment_status": payment_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.post("/recovery/follow-up")
async def add_follow_up(follow_up: FollowUpNote):
    """Add a follow-up note for an invoice"""
    try:
        await db.follow_ups.insert_one(follow_up.model_dump())
        return {"success": True, "message": "Follow-up note added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.get("/recovery/follow-ups/{invoice_id}")
async def get_follow_ups(invoice_id: str):
    """Get all follow-ups for an invoice"""
    try:
        follow_ups = await db.follow_ups.find(
            {"invoice_id": invoice_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        return follow_ups
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.get("/recovery/payments/{invoice_id}")
async def get_payment_history(invoice_id: str):
    """Get payment history for an invoice"""
    try:
        payments = await db.payment_records.find(
            {"invoice_id": invoice_id},
            {"_id": 0}
        ).sort("payment_date", -1).to_list(100)
        return payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.post("/recovery/send-reminder/{invoice_id}")
async def send_payment_reminder(invoice_id: str):
    """Send payment reminder via WhatsApp"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        today = datetime.now(timezone.utc)
        due_date = datetime.fromisoformat(invoice['due_date'].replace('Z', '+00:00'))
        days_overdue = (today - due_date).days
        
        outstanding = invoice['total_amount'] - invoice.get('paid_amount', 0)
        
        # Create reminder message
        message = f"""🔔 Payment Reminder - Nectar

Dear {invoice['customer_name']},

This is a friendly reminder regarding:

📄 Invoice: {invoice['invoice_number']}
💰 Amount Due: ₹{outstanding:,.2f}
📅 Due Date: {invoice['due_date'][:10]}
⚠️ Days Overdue: {days_overdue} days

Please process the payment at your earliest convenience.

For any queries, contact us.

Thank you!"""

        # Send via WhatsApp
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:3001/send-message",
                json={
                    "phone_number": invoice['customer_phone'],
                    "message": message
                },
                timeout=30.0
            )
            
            if response.json().get('success'):
                # Record follow-up
                follow_up = FollowUpNote(
                    invoice_id=invoice_id,
                    invoice_number=invoice['invoice_number'],
                    follow_up_date=datetime.now(timezone.utc).isoformat(),
                    contact_method="whatsapp",
                    notes=f"Payment reminder sent via WhatsApp. Days overdue: {days_overdue}",
                    status="contacted",
                    recorded_by="System"
                )
                await db.follow_ups.insert_one(follow_up.model_dump())
                
                return {"success": True, "message": "Payment reminder sent via WhatsApp"}
            else:
                return {"success": False, "message": "Failed to send WhatsApp reminder"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@recovery_router.get("/recovery/customer-summary")
async def get_customer_summary():
    """Get outstanding summary by customer"""
    try:
        invoices = await db.invoices.find(
            {
                "status": {"$ne": "cancelled"},
                "payment_status": {"$in": ["unpaid", "partially_paid"]}
            },
            {"_id": 0}
        ).to_list(1000)
        
        customer_summary = {}
        today = datetime.now(timezone.utc)
        
        for invoice in invoices:
            customer_name = invoice['customer_name']
            
            if customer_name not in customer_summary:
                customer_summary[customer_name] = {
                    "customer_name": customer_name,
                    "customer_phone": invoice['customer_phone'],
                    "customer_email": invoice.get('customer_email', ''),
                    "total_outstanding": 0,
                    "invoice_count": 0,
                    "oldest_invoice_days": 0,
                    "invoices": []
                }
            
            outstanding = invoice['total_amount'] - invoice.get('paid_amount', 0)
            due_date = datetime.fromisoformat(invoice['due_date'].replace('Z', '+00:00'))
            days_overdue = (today - due_date).days
            
            if days_overdue > 0:
                customer_summary[customer_name]['total_outstanding'] += outstanding
                customer_summary[customer_name]['invoice_count'] += 1
                customer_summary[customer_name]['oldest_invoice_days'] = max(
                    customer_summary[customer_name]['oldest_invoice_days'],
                    days_overdue
                )
                customer_summary[customer_name]['invoices'].append({
                    "invoice_number": invoice['invoice_number'],
                    "invoice_date": invoice['invoice_date'],
                    "due_date": invoice['due_date'],
                    "days_overdue": days_overdue,
                    "outstanding": outstanding
                })
        
        # Convert to list and sort by total outstanding
        result = list(customer_summary.values())
        result.sort(key=lambda x: x['total_outstanding'], reverse=True)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
