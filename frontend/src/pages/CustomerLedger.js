import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, FileSpreadsheet, FileDown, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const fetchLedger = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/customer-ledger/${selectedCustomer}`);
      
      // Transform the backend data into transactions format with items
      const transactions = [];
      let runningBalance = 0;
      
      // Add invoices with item details
      if (response.data.invoices) {
        response.data.invoices.forEach(inv => {
          runningBalance += inv.grand_total;
          transactions.push({
            date: inv.invoice_date,
            type: 'invoice',
            reference_number: inv.invoice_number,
            debit: inv.grand_total,
            credit: 0,
            balance: runningBalance,
            items: inv.items || [],
            subtotal: inv.subtotal,
            total_discount: inv.total_discount,
            taxable_amount: inv.taxable_amount,
            cgst_amount: inv.cgst_amount,
            sgst_amount: inv.sgst_amount,
            igst_amount: inv.igst_amount,
            total_gst: inv.total_gst,
            is_interstate: inv.is_interstate
          });
        });
      }
      
      // Add credit notes with item details
      if (response.data.credit_notes) {
        response.data.credit_notes.forEach(cn => {
          runningBalance -= cn.credit_amount;
          transactions.push({
            date: cn.credit_note_date,
            type: 'credit_note',
            reference_number: cn.credit_note_number,
            debit: 0,
            credit: cn.credit_amount,
            balance: runningBalance,
            items: cn.items || [],
            reason: cn.reason
          });
        });
      }
      
      // Add payments
      if (response.data.payments) {
        response.data.payments.forEach(payment => {
          runningBalance -= payment.payment_amount;
          transactions.push({
            date: payment.payment_date,
            type: 'payment',
            reference_number: payment.payment_number,
            debit: 0,
            credit: payment.payment_amount,
            balance: runningBalance,
            payment_method: payment.payment_method,
            memo: payment.memo
          });
        });
      }
      
      // Add journal entries
      if (response.data.journal_entries) {
        response.data.journal_entries.forEach(je => {
          // Freight charges paid by customer on behalf of company = Credit (reduces their balance)
          if (je.entry_type === 'freight') {
            const amount = Math.abs(je.amount);
            runningBalance -= amount; // Reduces balance
            transactions.push({
              date: je.entry_date,
              type: 'freight',
              reference_number: je.entry_number,
              debit: 0,
              credit: amount,
              balance: runningBalance,
              description: je.description
            });
          }
          // Discounts given = Credit (reduces balance)
          else if (je.entry_type === 'discount' || je.amount < 0) {
            const amount = Math.abs(je.amount);
            runningBalance -= amount;
            transactions.push({
              date: je.entry_date,
              type: 'discount',
              reference_number: je.entry_number,
              debit: 0,
              credit: amount,
              balance: runningBalance,
              description: je.description
            });
          }
          // Opening balance
          else if (je.entry_type === 'opening_balance') {
            if (je.amount >= 0) {
              runningBalance += je.amount;
              transactions.push({
                date: je.entry_date,
                type: 'opening_balance',
                reference_number: je.entry_number,
                debit: je.amount,
                credit: 0,
                balance: runningBalance,
                description: je.description
              });
            } else {
              runningBalance -= Math.abs(je.amount);
              transactions.push({
                date: je.entry_date,
                type: 'opening_balance',
                reference_number: je.entry_number,
                debit: 0,
                credit: Math.abs(je.amount),
                balance: runningBalance,
                description: je.description
              });
            }
          }
          // Other charges/adjustments = Debit (increases balance)
          else {
            runningBalance += je.amount;
            transactions.push({
              date: je.entry_date,
              type: 'journal_debit',
              reference_number: je.entry_number,
              debit: je.amount,
              credit: 0,
              balance: runningBalance,
              description: je.description
            });
          }
        });
      }
      
      // Sort by date
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setLedgerData({
        customer: response.data.customer,
        customer_name: response.data.customer.name,
        total_invoiced: response.data.summary.total_invoiced,
        total_credited: response.data.summary.total_credited,
        total_paid: response.data.summary.total_paid,
        journal_debits: response.data.summary.journal_debits,
        journal_credits: response.data.summary.journal_credits,
        outstanding_balance: response.data.summary.net_balance,
        transactions: transactions
      });
    } catch (error) {
      console.error('Error fetching customer ledger:', error);
      toast.error('Failed to fetch customer ledger');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const downloadExcel = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }

    try {
      const response = await axios.get(
        `${API}/reports/customer-ledger/${selectedCustomer}/export-excel`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customer_ledger_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    }
  };

  const downloadPDF = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }

    try {
      const response = await axios.get(
        `${API}/reports/customer-ledger/${selectedCustomer}/export-pdf`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customer_ledger_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF file');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Ledger</h1>
        <p className="text-gray-500 mt-1">View customer transaction history and balance</p>
      </div>

      {/* Customer Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer">Select Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger data-testid="customer-select">
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchLedger} className="w-full" data-testid="view-ledger-btn">
              <FileText className="h-4 w-4 mr-2" />
              View Ledger
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Info & Balance */}
      {ledgerData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Customer Name</p>
              <p className="text-xl font-bold text-gray-900" data-testid="customer-name">
                {ledgerData.customer_name}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <p className="text-xl font-bold text-indigo-600" data-testid="total-sales">
                ₹{ledgerData.total_invoiced?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Outstanding Balance</p>
              <p className="text-xl font-bold text-red-600" data-testid="outstanding-balance">
                ₹{ledgerData.outstanding_balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={downloadExcel} 
                  variant="outline" 
                  size="sm"
                  data-testid="download-excel-btn"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Download Excel
                </Button>
                <Button 
                  onClick={downloadPDF} 
                  variant="outline" 
                  size="sm"
                  data-testid="download-pdf-btn"
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4 text-red-600" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference #
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : ledgerData.transactions?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    ledgerData.transactions?.map((txn, index) => (
                      <>
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-2 py-4 whitespace-nowrap">
                            {(txn.type === 'invoice' || txn.type === 'credit_note') && txn.items?.length > 0 && (
                              <button
                                onClick={() => toggleRow(index)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedRows[index] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(txn.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              txn.type === 'invoice' ? 'bg-blue-100 text-blue-800' :
                              txn.type === 'payment' ? 'bg-green-100 text-green-800' :
                              txn.type === 'credit_note' ? 'bg-orange-100 text-orange-800' :
                              txn.type === 'freight' ? 'bg-purple-100 text-purple-800' :
                              txn.type === 'discount' ? 'bg-pink-100 text-pink-800' :
                              txn.type === 'opening_balance' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {txn.type === 'invoice' ? 'Invoice' :
                               txn.type === 'payment' ? 'Payment' :
                               txn.type === 'credit_note' ? 'Credit Note' :
                               txn.type === 'freight' ? 'Freight Paid' :
                               txn.type === 'discount' ? 'Discount' :
                               txn.type === 'opening_balance' ? 'Opening Balance' :
                               'Other Charges'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-indigo-600">
                            {txn.reference_number}
                            {txn.description && (
                              <span className="text-xs text-gray-500 block mt-1">{txn.description}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {txn.debit > 0 ? `₹${txn.debit.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                            {txn.credit > 0 ? `₹${txn.credit.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            ₹{txn.balance.toFixed(2)}
                          </td>
                        </tr>
                        
                        {/* Expanded Item Details Row */}
                        {expandedRows[index] && (txn.type === 'invoice' || txn.type === 'credit_note') && txn.items?.length > 0 && (
                          <tr key={`${index}-items`} className="bg-gray-50">
                            <td colSpan="7" className="px-12 py-4">
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Item Details</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Product Name</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Quantity</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Price</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Discount %</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">GST %</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Tax Amount</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {txn.items.map((item, itemIndex) => {
                                        const itemTotal = item.quantity * item.price;
                                        const discountAmount = itemTotal * (item.discount_percent / 100);
                                        const taxableAmount = itemTotal - discountAmount;
                                        const taxAmount = taxableAmount * (item.gst_rate / 100);
                                        const finalTotal = taxableAmount + taxAmount;
                                        
                                        return (
                                          <tr key={itemIndex} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-gray-900">{item.product_name}</td>
                                            <td className="px-3 py-2 text-center text-gray-700">
                                              {item.quantity} {item.unit}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-700">
                                              ₹{item.price.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-600">
                                              {item.discount_percent}%
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-600">
                                              {item.gst_rate}%
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-700">
                                              ₹{taxAmount.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                                              ₹{finalTotal.toFixed(2)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                
                                {/* Invoice Summary */}
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Subtotal:</span>
                                      <span className="ml-2 font-medium">₹{txn.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Discount:</span>
                                      <span className="ml-2 font-medium text-orange-600">₹{txn.total_discount?.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        {txn.is_interstate ? 'IGST:' : 'CGST+SGST:'}
                                      </span>
                                      <span className="ml-2 font-medium">₹{txn.total_gst?.toFixed(2)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Grand Total:</span>
                                      <span className="ml-2 font-bold text-indigo-600">₹{txn.debit > 0 ? txn.debit.toFixed(2) : txn.credit.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!ledgerData && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a customer and click "View Ledger" to see their transaction history.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;