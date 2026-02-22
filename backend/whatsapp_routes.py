# WhatsApp Integration Routes
# Add this to your FastAPI backend

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

whatsapp_router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

WHATSAPP_SERVICE_URL = "http://localhost:3001"

class SendMessageRequest(BaseModel):
    phone_number: str
    message: str

class SendDocumentRequest(BaseModel):
    phone_number: str
    file_path: str
    file_name: str
    caption: Optional[str] = ""

class SendInvoiceRequest(BaseModel):
    phone_number: str
    invoice_number: str
    dealer_name: Optional[str] = "Customer"
    amount: Optional[str] = "N/A"
    due_date: Optional[str] = "N/A"
    pdf_path: str

@whatsapp_router.get("/qr")
async def get_whatsapp_qr():
    """Get QR code for WhatsApp authentication"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/qr", timeout=10.0)
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get QR code: {str(e)}")

@whatsapp_router.get("/status")
async def get_whatsapp_status():
    """Get WhatsApp connection status"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/status", timeout=10.0)
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@whatsapp_router.post("/send-message")
async def send_whatsapp_message(request: SendMessageRequest):
    """Send text message via WhatsApp"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send-message",
                json={
                    "phone_number": request.phone_number,
                    "message": request.message
                },
                timeout=30.0
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@whatsapp_router.post("/send-document")
async def send_whatsapp_document(request: SendDocumentRequest):
    """Send document via WhatsApp"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send-document",
                json={
                    "phone_number": request.phone_number,
                    "file_path": request.file_path,
                    "file_name": request.file_name,
                    "caption": request.caption
                },
                timeout=60.0
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send document: {str(e)}")

@whatsapp_router.post("/send-invoice")
async def send_invoice_whatsapp(request: SendInvoiceRequest):
    """Send invoice with PDF via WhatsApp"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send-invoice",
                json={
                    "phone_number": request.phone_number,
                    "invoice_number": request.invoice_number,
                    "dealer_name": request.dealer_name,
                    "amount": request.amount,
                    "due_date": request.due_date,
                    "pdf_path": request.pdf_path
                },
                timeout=60.0
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invoice: {str(e)}")

@whatsapp_router.post("/disconnect")
async def disconnect_whatsapp():
    """Disconnect from WhatsApp"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{WHATSAPP_SERVICE_URL}/disconnect", timeout=10.0)
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect: {str(e)}")
