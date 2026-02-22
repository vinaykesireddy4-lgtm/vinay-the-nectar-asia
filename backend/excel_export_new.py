@api_router.get("/reports/customer-ledger/{customer_id}/export-excel")
async def export_customer_ledger_excel(customer_id: str):
    """Export customer ledger to Excel format - Organized layout"""
    # Get ledger data
    ledger_response = await get_customer_ledger(customer_id)
    customer = ledger_response['customer']
    summary = ledger_response['summary']
    
    # Create Excel workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Customer Ledger"
    
    # Styling
    title_font = Font(bold=True, size=16)
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=11)
    item_header_fill = PatternFill(start_color="E7E6E6", end_color="E7E6E6", fill_type="solid")
    item_header_font = Font(bold=True, size=10)
    bold_font = Font(bold=True)
    red_font = Font(bold=True, color="FF0000")
    border = Border(
        left=Side(style='thin'), right=Side(style='thin'),
        top=Side(style='thin'), bottom=Side(style='thin')
    )
    
    # Title
    ws.merge_cells('A1:I1')
    ws['A1'] = f"Customer Ledger - {customer.get('name', 'N/A')}"
    ws['A1'].font = title_font
    ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[1].height = 25
    
    # Customer Details
    row = 3
    details = [
        ('Customer ID:', customer.get('id', 'N/A')),
        ('Address:', customer.get('address', 'N/A')),
        ('Phone:', customer.get('phone', 'N/A')),
        ('GST:', customer.get('gst_number', 'N/A'))
    ]
    for label, value in details:
        ws[f'A{row}'] = label
        ws[f'A{row}'].font = bold_font
        ws[f'B{row}'] = value
        ws.merge_cells(f'B{row}:C{row}')
        row += 1
    
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
    
    # Main Headers
    row = 14
    headers = ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance']
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=row, column=col_num)
        cell.value = header
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center')
        cell.border = border
    
    # Process transactions chronologically
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
        if txn_type == 'invoice':
            running_balance += data.get('grand_total', 0)
            date_str = txn_date.strftime('%Y-%m-%d %H:%M') if isinstance(txn_date, datetime) else str(txn_date)
            
            ws.cell(row, 1).value = date_str
            ws.cell(row, 2).value = 'Invoice'
            ws.cell(row, 3).value = data.get('invoice_number')
            ws.cell(row, 4).value = data.get('grand_total', 0)
            ws.cell(row, 4).number_format = '₹#,##0.00'
            ws.cell(row, 5).value = ''
            ws.cell(row, 6).value = running_balance
            ws.cell(row, 6).number_format = '₹#,##0.00'
            for c in range(1, 7):
                ws.cell(row, c).border = border
            row += 1
            
            if data.get('items'):
                # Item headers
                item_hdrs = ['', 'Product Name', 'Qty', 'Price', 'Discount %', 'GST %', 'Tax Amt', 'Total']
                for col_num, hdr in enumerate(item_hdrs, 1):
                    cell = ws.cell(row, col_num)
                    cell.value = hdr
                    cell.fill = item_header_fill
                    cell.font = item_header_font
                    cell.alignment = Alignment(horizontal='center')
                    cell.border = border
                row += 1
                
                for item in data.get('items', []):
                    item_total = item.get('quantity', 0) * item.get('price', 0)
                    disc = item_total * (item.get('discount_percent', 0) / 100)
                    taxable = item_total - disc
                    tax = taxable * (item.get('gst_rate', 0) / 100)
                    final = taxable + tax
                    
                    ws.cell(row, 1).value = ''
                    ws.cell(row, 2).value = item.get('product_name', '')
                    ws.cell(row, 3).value = f"{item.get('quantity', 0)} {item.get('unit', '')}"
                    ws.cell(row, 4).value = item.get('price', 0)
                    ws.cell(row, 4).number_format = '₹#,##0.00'
                    ws.cell(row, 5).value = f"{item.get('discount_percent', 0)}%"
                    ws.cell(row, 6).value = f"{item.get('gst_rate', 0)}%"
                    ws.cell(row, 7).value = tax
                    ws.cell(row, 7).number_format = '₹#,##0.00'
                    ws.cell(row, 8).value = final
                    ws.cell(row, 8).number_format = '₹#,##0.00'
                    for c in range(1, 9):
                        ws.cell(row, c).border = border
                    row += 1
        
        elif txn_type == 'credit_note':
            running_balance -= data.get('credit_amount', 0)
            date_str = txn_date.strftime('%Y-%m-%d %H:%M') if isinstance(txn_date, datetime) else str(txn_date)
            
            ws.cell(row, 1).value = date_str
            ws.cell(row, 2).value = 'Credit Note'
            ws.cell(row, 3).value = data.get('credit_note_number')
            ws.cell(row, 4).value = ''
            ws.cell(row, 5).value = data.get('credit_amount', 0)
            ws.cell(row, 5).number_format = '₹#,##0.00'
            ws.cell(row, 6).value = running_balance
            ws.cell(row, 6).number_format = '₹#,##0.00'
            for c in range(1, 7):
                ws.cell(row, c).border = border
            row += 1
            
            if data.get('items'):
                item_hdrs = ['', 'Product Name', 'Qty', 'Price', 'Discount %', 'GST %', 'Tax Amt', 'Total']
                for col_num, hdr in enumerate(item_hdrs, 1):
                    cell = ws.cell(row, col_num)
                    cell.value = hdr
                    cell.fill = item_header_fill
                    cell.font = item_header_font
                    cell.alignment = Alignment(horizontal='center')
                    cell.border = border
                row += 1
                
                for item in data.get('items', []):
                    item_total = item.get('quantity', 0) * item.get('price', 0)
                    disc = item_total * (item.get('discount_percent', 0) / 100)
                    taxable = item_total - disc
                    tax = taxable * (item.get('gst_rate', 0) / 100)
                    final = taxable + tax
                    
                    ws.cell(row, 1).value = ''
                    ws.cell(row, 2).value = item.get('product_name', '')
                    ws.cell(row, 3).value = f"{item.get('quantity', 0)} {item.get('unit', '')}"
                    ws.cell(row, 4).value = item.get('price', 0)
                    ws.cell(row, 4).number_format = '₹#,##0.00'
                    ws.cell(row, 5).value = f"{item.get('discount_percent', 0)}%"
                    ws.cell(row, 6).value = f"{item.get('gst_rate', 0)}%"
                    ws.cell(row, 7).value = tax
                    ws.cell(row, 7).number_format = '₹#,##0.00'
                    ws.cell(row, 8).value = final
                    ws.cell(row, 8).number_format = '₹#,##0.00'
                    for c in range(1, 9):
                        ws.cell(row, c).border = border
                    row += 1
        
        elif txn_type == 'payment':
            running_balance -= data.get('payment_amount', 0)
            date_str = txn_date.strftime('%Y-%m-%d %H:%M') if isinstance(txn_date, datetime) else str(txn_date)
            
            ws.cell(row, 1).value = date_str
            ws.cell(row, 2).value = 'Payment'
            ws.cell(row, 3).value = data.get('payment_number')
            ws.cell(row, 4).value = ''
            ws.cell(row, 5).value = data.get('payment_amount', 0)
            ws.cell(row, 5).number_format = '₹#,##0.00'
            ws.cell(row, 6).value = running_balance
            ws.cell(row, 6).number_format = '₹#,##0.00'
            for c in range(1, 7):
                ws.cell(row, c).border = border
            row += 1
        
        elif txn_type == 'journal':
            amount = data.get('amount', 0)
            entry_type = data.get('entry_type', '')
            date_str = txn_date.strftime('%Y-%m-%d %H:%M') if isinstance(txn_date, datetime) else str(txn_date)
            
            ws.cell(row, 1).value = date_str
            if entry_type == 'opening_balance':
                ws.cell(row, 2).value = 'Opening Balance'
                ws.cell(row, 3).value = data.get('entry_number')
                if amount >= 0:
                    running_balance += amount
                    ws.cell(row, 4).value = amount
                    ws.cell(row, 4).number_format = '₹#,##0.00'
                    ws.cell(row, 5).value = ''
                else:
                    running_balance -= abs(amount)
                    ws.cell(row, 4).value = ''
                    ws.cell(row, 5).value = abs(amount)
                    ws.cell(row, 5).number_format = '₹#,##0.00'
            elif entry_type == 'freight':
                running_balance -= abs(amount)
                ws.cell(row, 2).value = 'Freight'
                ws.cell(row, 3).value = data.get('entry_number')
                ws.cell(row, 4).value = ''
                ws.cell(row, 5).value = abs(amount)
                ws.cell(row, 5).number_format = '₹#,##0.00'
            elif entry_type == 'discount' or amount < 0:
                running_balance -= abs(amount)
                ws.cell(row, 2).value = 'Discount'
                ws.cell(row, 3).value = data.get('entry_number')
                ws.cell(row, 4).value = ''
                ws.cell(row, 5).value = abs(amount)
                ws.cell(row, 5).number_format = '₹#,##0.00'
            else:
                running_balance += abs(amount)
                ws.cell(row, 2).value = 'Other Charges'
                ws.cell(row, 3).value = data.get('entry_number')
                ws.cell(row, 4).value = abs(amount)
                ws.cell(row, 4).number_format = '₹#,##0.00'
                ws.cell(row, 5).value = ''
            
            ws.cell(row, 6).value = running_balance
            ws.cell(row, 6).number_format = '₹#,##0.00'
            for c in range(1, 7):
                ws.cell(row, c).border = border
            row += 1
    
    # Column widths
    ws.column_dimensions['A'].width = 20
    ws.column_dimensions['B'].width = 25
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 15
    ws.column_dimensions['F'].width = 15
    ws.column_dimensions['G'].width = 12
    ws.column_dimensions['H'].width = 15
    
    # Save
    excel_file = io.BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)
    
    filename = f"customer_ledger_{customer.get('name', 'unknown').replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
