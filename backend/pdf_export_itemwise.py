@api_router.get("/reports/customer-ledger/{customer_id}/export-pdf")
async def export_customer_ledger_pdf(customer_id: str):
    """Export customer ledger to PDF - Each item with individual amount and balance"""
    ledger_response = await get_customer_ledger(customer_id)
    customer = ledger_response['customer']
    summary = ledger_response['summary']
    
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4, leftMargin=20, rightMargin=20, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=16,
                                 textColor=colors.HexColor('#1a1a1a'), spaceAfter=12, alignment=TA_CENTER)
    
    title = Paragraph(f"<b>Customer Ledger - {customer.get('name', 'N/A')}</b>", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    customer_info = [
        ['Customer ID:', customer.get('id', 'N/A')],
        ['Address:', customer.get('address', 'N/A')],
        ['Phone:', customer.get('phone', 'N/A')],
        ['GST Number:', customer.get('gst_number', 'N/A')]
    ]
    
    customer_table = Table(customer_info, colWidths=[1.5*inch, 4*inch])
    customer_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(customer_table)
    elements.append(Spacer(1, 0.2*inch))
    
    summary_data = [
        ['Summary', ''],
        ['Total Invoiced:', f"₹{summary.get('total_invoiced', 0):,.2f}"],
        ['Total Paid:', f"₹{summary.get('total_paid', 0):,.2f}"],
        ['Outstanding Balance:', f"₹{summary.get('net_balance', 0):,.2f}"]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, -1), (1, -1), colors.red),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.3*inch))
    
    elements.append(Paragraph("<b>Transaction Details</b>", styles['Heading3']))
    elements.append(Spacer(1, 0.1*inch))
    
    # Transaction table
    txn_data = [['Date', 'Type', 'Ref', 'Product', 'Qty', 'Rate', 'Disc%', 'GST%', 'Tax', 'Debit', 'Credit', 'Balance']]
    
    running_balance = 0
    all_txns = []
    
    for inv in ledger_response['invoices']:
        all_txns.append(('invoice', inv.get('invoice_date'), inv))
    for cn in ledger_response['credit_notes']:
        all_txns.append(('credit_note', cn.get('credit_note_date'), cn))
    for pmt in ledger_response['payments']:
        all_txns.append(('payment', pmt.get('payment_date'), pmt))
    for je in ledger_response['journal_entries']:
        all_txns.append(('journal', je.get('entry_date'), je))
    
    all_txns.sort(key=lambda x: x[1] if x[1] else datetime.min)
    
    for txn_type, txn_date, data in all_txns:
        date_str = txn_date.strftime('%Y-%m-%d') if isinstance(txn_date, datetime) else str(txn_date)
        
        if txn_type == 'invoice':
            if data.get('items'):
                for idx, item in enumerate(data.get('items', [])):
                    item_total = item.get('quantity', 0) * item.get('price', 0)
                    disc_amt = item_total * (item.get('discount_percent', 0) / 100)
                    taxable = item_total - disc_amt
                    tax_amt = taxable * (item.get('gst_rate', 0) / 100)
                    item_final = taxable + tax_amt
                    
                    # Update balance for each item
                    running_balance += item_final
                    
                    row = [
                        date_str if idx == 0 else '',
                        'Invoice',
                        data.get('invoice_number', '') if idx == 0 else '',
                        item.get('product_name', ''),
                        f"{item.get('quantity', 0)}",
                        f"₹{item.get('price', 0):.0f}",
                        f"{item.get('discount_percent', 0)}%",
                        f"{item.get('gst_rate', 0)}%",
                        f"₹{tax_amt:.0f}",
                        f"₹{item_final:,.0f}",
                        '',
                        f"₹{running_balance:,.0f}"
                    ]
                    txn_data.append(row)
            else:
                invoice_total = data.get('grand_total', 0)
                running_balance += invoice_total
                txn_data.append([
                    date_str, 'Invoice', data.get('invoice_number', ''),
                    '', '', '', '', '', '',
                    f"₹{invoice_total:,.0f}", '', f"₹{running_balance:,.0f}"
                ])
        
        elif txn_type == 'credit_note':
            if data.get('items'):
                for idx, item in enumerate(data.get('items', [])):
                    item_total = item.get('quantity', 0) * item.get('price', 0)
                    disc_amt = item_total * (item.get('discount_percent', 0) / 100)
                    taxable = item_total - disc_amt
                    tax_amt = taxable * (item.get('gst_rate', 0) / 100)
                    item_final = taxable + tax_amt
                    
                    running_balance -= item_final
                    
                    row = [
                        date_str if idx == 0 else '',
                        'Credit Note',
                        data.get('credit_note_number', '') if idx == 0 else '',
                        item.get('product_name', ''),
                        f"{item.get('quantity', 0)}",
                        f"₹{item.get('price', 0):.0f}",
                        f"{item.get('discount_percent', 0)}%",
                        f"{item.get('gst_rate', 0)}%",
                        f"₹{tax_amt:.0f}",
                        '',
                        f"₹{item_final:,.0f}",
                        f"₹{running_balance:,.0f}"
                    ]
                    txn_data.append(row)
            else:
                credit_amt = data.get('credit_amount', 0)
                running_balance -= credit_amt
                txn_data.append([
                    date_str, 'Credit Note', data.get('credit_note_number', ''),
                    '', '', '', '', '', '',
                    '', f"₹{credit_amt:,.0f}", f"₹{running_balance:,.0f}"
                ])
        
        elif txn_type == 'payment':
            pmt_amt = data.get('payment_amount', 0)
            running_balance -= pmt_amt
            txn_data.append([
                date_str, 'Payment', data.get('payment_number', ''),
                '', '', '', '', '', '',
                '', f"₹{pmt_amt:,.0f}", f"₹{running_balance:,.0f}"
            ])
        
        elif txn_type == 'journal':
            amount = data.get('amount', 0)
            entry_type = data.get('entry_type', '')
            
            if entry_type == 'opening_balance':
                txn_type_label = 'Opening Bal'
                if amount >= 0:
                    running_balance += amount
                    debit_val = f"₹{amount:,.0f}"
                    credit_val = ''
                else:
                    running_balance -= abs(amount)
                    debit_val = ''
                    credit_val = f"₹{abs(amount):,.0f}"
            elif entry_type == 'freight':
                txn_type_label = 'Freight'
                running_balance -= abs(amount)
                debit_val = ''
                credit_val = f"₹{abs(amount):,.0f}"
            elif entry_type == 'discount':
                txn_type_label = 'Discount'
                running_balance -= abs(amount)
                debit_val = ''
                credit_val = f"₹{abs(amount):,.0f}"
            else:
                txn_type_label = 'Other'
                running_balance += abs(amount)
                debit_val = f"₹{abs(amount):,.0f}"
                credit_val = ''
            
            txn_data.append([
                date_str, txn_type_label, data.get('entry_number', ''),
                '', '', '', '', '', '',
                debit_val, credit_val, f"₹{running_balance:,.0f}"
            ])
    
    col_widths = [0.7*inch, 0.6*inch, 0.7*inch, 1.2*inch, 0.4*inch, 0.5*inch, 0.4*inch, 0.4*inch, 0.5*inch, 0.6*inch, 0.6*inch, 0.7*inch]
    txn_table = Table(txn_data, colWidths=col_widths)
    txn_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 7),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 6),
        ('ALIGN', (4, 0), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (3, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(txn_table)
    
    doc.build(elements)
    pdf_buffer.seek(0)
    
    filename = f"customer_ledger_{customer.get('name', 'unknown').replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
