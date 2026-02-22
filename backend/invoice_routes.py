# Invoice Management Backend APIs
# Add this section to your server.py

from typing import List, Optional
from datetime import datetime, timezone
from uuid import uuid4
import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

# Invoice Models
class InvoiceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    item_name: str
    description: Optional[str] = ""
    quantity: float
    unit_price: float
    tax_rate: Optional[float] = 0
    amount: float

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    invoice_number: str
    invoice_date: str
    due_date: str
    
    # Customer/Dealer Info
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = ""
    customer_address: Optional[str] = ""
    customer_gstin: Optional[str] = ""
    
    # Invoice Items
    items: List[InvoiceItem]
    
    # Amounts
    subtotal: float
    tax_amount: float
    discount_amount: Optional[float] = 0
    total_amount: float
    
    # Payment Info
    payment_terms: Optional[str] = "Net 30"
    payment_status: str = "unpaid"  # unpaid, partially_paid, paid
    paid_amount: Optional[float] = 0
    
    # WhatsApp
    send_whatsapp: Optional[bool] = False
    whatsapp_sent: Optional[bool] = False
    whatsapp_sent_at: Optional[str] = None
    
    # Metadata
    notes: Optional[str] = ""
    status: str = "draft"  # draft, sent, paid, cancelled
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: Optional[str] = None

class InvoiceCreate(BaseModel):
    invoice_number: str
    invoice_date: str
    due_date: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = ""
    customer_address: Optional[str] = ""
    customer_gstin: Optional[str] = ""
    items: List[InvoiceItem]
    subtotal: float
    tax_amount: float
    discount_amount: Optional[float] = 0
    total_amount: float
    payment_terms: Optional[str] = "Net 30"
    notes: Optional[str] = ""
    send_whatsapp: Optional[bool] = False

# PDF Generation Function
async def generate_invoice_pdf(invoice: Invoice) -> str:
    """Generate PDF for invoice and return file path"""
    try:
        # Create invoices directory if doesn't exist
        invoices_dir = Path("/app/invoices")
        invoices_dir.mkdir(exist_ok=True)
        
        pdf_filename = f"Invoice_{invoice.invoice_number}.pdf"
        pdf_path = invoices_dir / pdf_filename
        
        # Create PDF
        doc = SimpleDocTemplate(str(pdf_path), pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a56db'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        story.append(Paragraph("INVOICE", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Company Info & Invoice Details (side by side)
        company_invoice_data = [
            [
                Paragraph("<b>Nectar</b><br/>Your Business Address<br/>Phone: +91-XXXXXXXXXX<br/>Email: info@nectar.com", styles['Normal']),
                Paragraph(f"<b>Invoice #:</b> {invoice.invoice_number}<br/><b>Date:</b> {invoice.invoice_date[:10]}<br/><b>Due Date:</b> {invoice.due_date[:10]}", styles['Normal'])
            ]
        ]
        
        company_invoice_table = Table(company_invoice_data, colWidths=[3*inch, 3*inch])
        company_invoice_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        story.append(company_invoice_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Bill To
        story.append(Paragraph("<b>Bill To:</b>", styles['Heading3']))
        bill_to_text = f"{invoice.customer_name}<br/>"
        if invoice.customer_address:
            bill_to_text += f"{invoice.customer_address}<br/>"
        bill_to_text += f"Phone: {invoice.customer_phone}<br/>"
        if invoice.customer_email:
            bill_to_text += f"Email: {invoice.customer_email}<br/>"
        if invoice.customer_gstin:
            bill_to_text += f"GSTIN: {invoice.customer_gstin}"
        
        story.append(Paragraph(bill_to_text, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Items Table
        items_data = [['Item', 'Description', 'Qty', 'Rate', 'Tax', 'Amount']]
        
        for item in invoice.items:
            items_data.append([
                item.item_name,
                item.description or '-',
                str(item.quantity),
                f"₹{item.unit_price:,.2f}",
                f"{item.tax_rate}%",
                f"₹{item.amount:,.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[1.5*inch, 2*inch, 0.7*inch, 1*inch, 0.7*inch, 1*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),
        ]))
        story.append(items_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Totals
        totals_data = [
            ['Subtotal:', f"₹{invoice.subtotal:,.2f}"],
            ['Tax:', f"₹{invoice.tax_amount:,.2f}"],
        ]
        
        if invoice.discount_amount and invoice.discount_amount > 0:
            totals_data.append(['Discount:', f"-₹{invoice.discount_amount:,.2f}"])
        
        totals_data.append(['<b>Total Amount:</b>', f"<b>₹{invoice.total_amount:,.2f}</b>"])
        
        totals_table = Table(totals_data, colWidths=[4.5*inch, 1.5*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#1a56db')),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#1a56db')),
        ]))
        story.append(totals_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Payment Terms & Notes
        if invoice.payment_terms:
            story.append(Paragraph(f"<b>Payment Terms:</b> {invoice.payment_terms}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        if invoice.notes:
            story.append(Paragraph(f"<b>Notes:</b><br/>{invoice.notes}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph("Thank you for your business!", footer_style))
        
        # Build PDF
        doc.build(story)
        
        return str(pdf_path)
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

# Invoice Routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: InvoiceCreate):
    """Create a new invoice"""
    try:
        invoice = Invoice(**invoice_data.dict())
        invoice.status = "sent"
        
        # Generate PDF
        pdf_path = await generate_invoice_pdf(invoice)
        
        # Save to database
        await db.invoices.insert_one(invoice.dict())
        
        # Send via WhatsApp if requested
        if invoice.send_whatsapp and invoice.customer_phone:
            try:
                async with httpx.AsyncClient() as client:
                    whatsapp_data = {
                        "phone_number": invoice.customer_phone,
                        "invoice_number": invoice.invoice_number,
                        "dealer_name": invoice.customer_name,
                        "amount": str(invoice.total_amount),
                        "due_date": invoice.due_date[:10],
                        "pdf_path": pdf_path
                    }
                    
                    response = await client.post(
                        "http://localhost:3001/send-invoice",
                        json=whatsapp_data,
                        timeout=60.0
                    )
                    
                    if response.json().get('success'):
                        invoice.whatsapp_sent = True
                        invoice.whatsapp_sent_at = datetime.now(timezone.utc).isoformat()
                        
                        # Update in database
                        await db.invoices.update_one(
                            {"id": invoice.id},
                            {"$set": {
                                "whatsapp_sent": True,
                                "whatsapp_sent_at": invoice.whatsapp_sent_at
                            }}
                        )
            except Exception as e:
                print(f"WhatsApp send failed: {e}")
                # Continue even if WhatsApp fails
        
        return invoice
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create invoice: {str(e)}")

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(
    status: Optional[str] = None,
    customer_name: Optional[str] = None,
    limit: int = 100
):
    """Get all invoices with optional filters"""
    try:
        query = {}
        
        if status:
            query["status"] = status
        
        if customer_name:
            query["customer_name"] = {"$regex": customer_name, "$options": "i"}
        
        invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        return invoices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str):
    """Get invoice by ID"""
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@api_router.put("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, invoice_data: InvoiceCreate):
    """Update invoice"""
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    updated_data = invoice_data.dict()
    updated_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.invoices.update_one(
        {"id": invoice_id},
        {"$set": updated_data}
    )
    
    updated_invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    return updated_invoice

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str):
    """Delete invoice"""
    result = await db.invoices.delete_one({"id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted successfully"}

@api_router.post("/invoices/{invoice_id}/send-whatsapp")
async def resend_invoice_whatsapp(invoice_id: str):
    """Resend invoice via WhatsApp"""
    invoice_data = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice_data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice = Invoice(**invoice_data)
    
    # Find PDF
    pdf_path = f"/app/invoices/Invoice_{invoice.invoice_number}.pdf"
    
    if not os.path.exists(pdf_path):
        # Regenerate PDF if not found
        pdf_path = await generate_invoice_pdf(invoice)
    
    try:
        async with httpx.AsyncClient() as client:
            whatsapp_data = {
                "phone_number": invoice.customer_phone,
                "invoice_number": invoice.invoice_number,
                "dealer_name": invoice.customer_name,
                "amount": str(invoice.total_amount),
                "due_date": invoice.due_date[:10],
                "pdf_path": pdf_path
            }
            
            response = await client.post(
                "http://localhost:3001/send-invoice",
                json=whatsapp_data,
                timeout=60.0
            )
            
            if response.json().get('success'):
                # Update database
                await db.invoices.update_one(
                    {"id": invoice_id},
                    {"$set": {
                        "whatsapp_sent": True,
                        "whatsapp_sent_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                return {"success": True, "message": "Invoice sent via WhatsApp"}
            else:
                return {"success": False, "message": "Failed to send via WhatsApp"}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send WhatsApp: {str(e)}")

@api_router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str):
    """Download invoice PDF"""
    invoice_data = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice_data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice = Invoice(**invoice_data)
    pdf_path = f"/app/invoices/Invoice_{invoice.invoice_number}.pdf"
    
    if not os.path.exists(pdf_path):
        # Generate PDF if not found
        pdf_path = await generate_invoice_pdf(invoice)
    
    from fastapi.responses import FileResponse
    return FileResponse(
        pdf_path,
        media_type='application/pdf',
        filename=f"Invoice_{invoice.invoice_number}.pdf"
    )
