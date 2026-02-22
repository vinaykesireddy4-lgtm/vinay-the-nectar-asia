@api_router.get("/reports/customer-ledger/{customer_id}/export-excel")
async def export_customer_ledger_excel(customer_id: str):
    """Export customer ledger - Each item as separate row"""
    ledger_response = await get_customer_ledger(customer_id)
    customer = ledger_response['customer']
    summary = ledger_response['summary']
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Customer Ledger"
    
    # Styling
    title_font = Font(bold=True, size=16)
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=11)
    bold_font = Font(bold=True)
    red_font = Font(bold=True, color="FF0000")
    border = Border(left=Side(style='thin'), right=Side(style='thin'), 
                   top=Side(style='thin'), bottom=Side(style='thin'))
    
    # Title
    ws.merge_cells('A1:L1')
    ws['A1'] = f"Customer Ledger - {customer.get('name', 'N/A')}"
    ws['A1'].font = title_font
    ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[1].height = 25
    
    # Customer Details
    row = 3
    ws[f'A{row}'] = "Customer ID:"
    ws[f'A{row}'].font = bold_font
    ws[f'B{row}'] = customer.get('id', 'N/A')
    ws.merge_cells(f'B{row}:D{row}')
    row += 1
    ws[f'A{row}'] = "Address:"
    ws[f'A{row}'].font = bold_font
    ws[f'B{row}'] = customer.get('address', 'N/A')
    ws.merge_cells(f'B{row}:D{row}')
    row += 1
    ws[f'A{row}'] = "Phone:"
    ws[f'A{row}'].font = bold_font
    ws[f'B{row}'] = customer.get('phone', 'N/A')
    row += 1
    ws[f'A{row}'] = "GST:"
    ws[f'A{row}'].font = bold_font
    ws[f'B{row}'] = customer.get('gst_number', 'N/A')
    
    # Summary
    row = 8
    ws[f'A{row}'] = "Summary"
    ws[f'A{row}'].font = Font(bold=True, size=14)
    row += 1
    ws[f'A{row}'] = "Total Invoiced:"
    ws[f'A{row}'].font = bold_font
    ws[f'B{row}'] = summary.get('total_invoiced', 0)
    ws[f'B{row}'].number_format = '₹#,##0.00'
    row += 1
    ws[f'A{row}'] = "Total Paid:"
    ws[f'A{row}'].font = bold_font
    ws[f'B{row}'] = summary.get('total_paid', 0)
    ws[f'B{row}'].number_format = '₹#,##0.00'
    row += 1
    ws[f'A{row}'] = "Outstanding Balance:"
    ws[f'A{row}'].font = red_font
    ws[f'B{row}'] = summary.get('net_balance', 0)
    ws[f'B{row}'].number_format = '₹#,##0.00'
    ws[f'B{row}'].font = red_font
    
    # Headers - ONE row for all columns
    row = 14
    headers = ['Date', 'Type', 'Reference', 'Product Name', 'Quantity', 'Rate', 'Discount %', 'GST %', 'Tax Amt', 'Debit', 'Credit', 'Balance']
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=row, column=col_num)
        cell.value = header
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = border
    
    # Process transactions
    row = 15
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
        date_str = txn_date.strftime('%Y-%m-%d %H:%M') if isinstance(txn_date, datetime) else str(txn_date)
        
        if txn_type == 'invoice':
            invoice_total = data.get('grand_total', 0)
            running_balance += invoice_total
            
            if data.get('items'):
                # Each item gets its own row
                for idx, item in enumerate(data.get('items', [])):
                    item_total = item.get('quantity', 0) * item.get('price', 0)
                    disc_amt = item_total * (item.get('discount_percent', 0) / 100)
                    taxable = item_total - disc_amt
                    tax_amt = taxable * (item.get('gst_rate', 0) / 100)
                    item_final = taxable + tax_amt
                    
                    # Date, Type, Reference
                    ws.cell(row, 1).value = date_str if idx == 0 else ''
                    ws.cell(row, 2).value = 'Invoice' if idx == 0 else ''
                    ws.cell(row, 3).value = data.get('invoice_number') if idx == 0 else ''
                    
                    # Item details
                    ws.cell(row, 4).value = item.get('product_name', '')
                    ws.cell(row, 5).value = f"{item.get('quantity', 0)} {item.get('unit', '')}"
                    ws.cell(row, 6).value = item.get('price', 0)
                    ws.cell(row, 6).number_format = '₹#,##0.00'
                    ws.cell(row, 7).value = f"{item.get('discount_percent', 0)}%"
                    ws.cell(row, 8).value = f"{item.get('gst_rate', 0)}%"
                    ws.cell(row, 9).value = tax_amt
                    ws.cell(row, 9).number_format = '₹#,##0.00'
                    
                    # Debit, Credit, Balance - only on first item
                    if idx == 0:
                        ws.cell(row, 10).value = invoice_total
                        ws.cell(row, 10).number_format = '₹#,##0.00'
                        ws.cell(row, 11).value = ''
                        ws.cell(row, 12).value = running_balance
                        ws.cell(row, 12).number_format = '₹#,##0.00'
                    else:
                        ws.cell(row, 10).value = ''
                        ws.cell(row, 11).value = ''
                        ws.cell(row, 12).value = ''
                    
                    for c in range(1, 13):
                        ws.cell(row, c).border = border
                    row += 1
            else:
                # Invoice without items
                ws.cell(row, 1).value = date_str
                ws.cell(row, 2).value = 'Invoice'
                ws.cell(row, 3).value = data.get('invoice_number')
                ws.cell(row, 4).value = ''
                ws.cell(row, 5).value = ''
                ws.cell(row, 6).value = ''
                ws.cell(row, 7).value = ''
                ws.cell(row, 8).value = ''
                ws.cell(row, 9).value = ''
                ws.cell(row, 10).value = invoice_total
                ws.cell(row, 10).number_format = '₹#,##0.00'
                ws.cell(row, 11).value = ''
                ws.cell(row, 12).value = running_balance
                ws.cell(row, 12).number_format = '₹#,##0.00'
                
                for c in range(1, 13):
                    ws.cell(row, c).border = border
                row += 1
        
        elif txn_type == 'credit_note':
            credit_amt = data.get('credit_amount', 0)
            running_balance -= credit_amt
            
            if data.get('items'):
                for idx, item in enumerate(data.get('items', [])):
                    item_total = item.get('quantity', 0) * item.get('price', 0)
                    disc_amt = item_total * (item.get('discount_percent', 0) / 100)
                    taxable = item_total - disc_amt
                    tax_amt = taxable * (item.get('gst_rate', 0) / 100)
                    
                    ws.cell(row, 1).value = date_str if idx == 0 else ''
                    ws.cell(row, 2).value = 'Credit Note' if idx == 0 else ''
                    ws.cell(row, 3).value = data.get('credit_note_number') if idx == 0 else ''
                    ws.cell(row, 4).value = item.get('product_name', '')
                    ws.cell(row, 5).value = f"{item.get('quantity', 0)} {item.get('unit', '')}"
                    ws.cell(row, 6).value = item.get('price', 0)
                    ws.cell(row, 6).number_format = '₹#,##0.00'
                    ws.cell(row, 7).value = f"{item.get('discount_percent', 0)}%"
                    ws.cell(row, 8).value = f"{item.get('gst_rate', 0)}%"
                    ws.cell(row, 9).value = tax_amt
                    ws.cell(row, 9).number_format = '₹#,##0.00'
                    
                    if idx == 0:
                        ws.cell(row, 10).value = ''
                        ws.cell(row, 11).value = credit_amt
                        ws.cell(row, 11).number_format = '₹#,##0.00'
                        ws.cell(row, 12).value = running_balance
                        ws.cell(row, 12).number_format = '₹#,##0.00'
                    else:
                        ws.cell(row, 10).value = ''
                        ws.cell(row, 11).value = ''
                        ws.cell(row, 12).value = ''
                    
                    for c in range(1, 13):
                        ws.cell(row, c).border = border
                    row += 1
            else:
                ws.cell(row, 1).value = date_str
                ws.cell(row, 2).value = 'Credit Note'
                ws.cell(row, 3).value = data.get('credit_note_number')
                for c in range(4, 10):
                    ws.cell(row, c).value = ''
                ws.cell(row, 10).value = ''
                ws.cell(row, 11).value = credit_amt
                ws.cell(row, 11).number_format = '₹#,##0.00'
                ws.cell(row, 12).value = running_balance
                ws.cell(row, 12).number_format = '₹#,##0.00'
                
                for c in range(1, 13):
                    ws.cell(row, c).border = border
                row += 1
        
        elif txn_type == 'payment':
            running_balance -= data.get('payment_amount', 0)
            
            ws.cell(row, 1).value = date_str
            ws.cell(row, 2).value = 'Payment'
            ws.cell(row, 3).value = data.get('payment_number')
            for c in range(4, 10):
                ws.cell(row, c).value = ''
            ws.cell(row, 10).value = ''
            ws.cell(row, 11).value = data.get('payment_amount', 0)
            ws.cell(row, 11).number_format = '₹#,##0.00'
            ws.cell(row, 12).value = running_balance
            ws.cell(row, 12).number_format = '₹#,##0.00'
            
            for c in range(1, 13):
                ws.cell(row, c).border = border
            row += 1
        
        elif txn_type == 'journal':
            amount = data.get('amount', 0)
            entry_type = data.get('entry_type', '')
            
            ws.cell(row, 1).value = date_str
            if entry_type == 'opening_balance':
                ws.cell(row, 2).value = 'Opening Balance'
            elif entry_type == 'freight':
                ws.cell(row, 2).value = 'Freight'
            elif entry_type == 'discount':
                ws.cell(row, 2).value = 'Discount'
            else:
                ws.cell(row, 2).value = 'Other Charges'
            
            ws.cell(row, 3).value = data.get('entry_number')
            for c in range(4, 10):
                ws.cell(row, c).value = ''
            
            if entry_type == 'opening_balance':
                if amount >= 0:
                    running_balance += amount
                    ws.cell(row, 10).value = amount
                    ws.cell(row, 10).number_format = '₹#,##0.00'
                    ws.cell(row, 11).value = ''
                else:
                    running_balance -= abs(amount)
                    ws.cell(row, 10).value = ''
                    ws.cell(row, 11).value = abs(amount)
                    ws.cell(row, 11).number_format = '₹#,##0.00'
            elif entry_type in ['freight', 'discount'] or amount < 0:
                running_balance -= abs(amount)
                ws.cell(row, 10).value = ''
                ws.cell(row, 11).value = abs(amount)
                ws.cell(row, 11).number_format = '₹#,##0.00'
            else:
                running_balance += abs(amount)
                ws.cell(row, 10).value = abs(amount)
                ws.cell(row, 10).number_format = '₹#,##0.00'
                ws.cell(row, 11).value = ''
            
            ws.cell(row, 12).value = running_balance
            ws.cell(row, 12).number_format = '₹#,##0.00'
            
            for c in range(1, 13):
                ws.cell(row, c).border = border
            row += 1
    
    # Column widths
    ws.column_dimensions['A'].width = 18
    ws.column_dimensions['B'].width = 15
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 25
    ws.column_dimensions['E'].width = 12
    ws.column_dimensions['F'].width = 12
    ws.column_dimensions['G'].width = 12
    ws.column_dimensions['H'].width = 10
    ws.column_dimensions['I'].width = 12
    ws.column_dimensions['J'].width = 15
    ws.column_dimensions['K'].width = 15
    ws.column_dimensions['L'].width = 15
    
    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)
    
    filename = f"customer_ledger_{customer.get('name', 'unknown').replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
