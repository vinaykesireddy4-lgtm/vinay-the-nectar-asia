import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`${API}/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to fetch invoice');
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const response = await axios.get(`${API}/company-settings`);
      setCompany(response.data);
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    fetchCompanySettings();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero Rupees Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const integerPart = Math.floor(num);
    
    if (integerPart === 0) return 'Zero Rupees Only';
    if (integerPart < 1000) return convertLessThanThousand(integerPart) + ' Rupees Only';

    const crore = Math.floor(integerPart / 10000000);
    const lakh = Math.floor((integerPart % 10000000) / 100000);
    const thousand = Math.floor((integerPart % 100000) / 1000);
    const remainder = integerPart % 1000;

    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim() + ' Rupees Only';
  };

  const formatPaymentTerms = (terms) => {
    const termsMap = {
      'immediate': 'Immediate',
      'net_15': 'Net 15 Days',
      'net_30': 'Net 30 Days',
      'net_45': 'Net 45 Days',
      'net_60': 'Net 60 Days',
      'cod': 'Cash on Delivery',
      'advance': 'Advance Payment',
    };
    return termsMap[terms] || terms || 'Immediate';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Invoice not found</p>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Action Buttons - Hidden on Print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700">
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Content - Printable A4 Size */}
      <div className="bg-white mx-auto print:p-0" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '210mm', padding: '20mm' }}>
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-4" style={{ fontSize: '24px' }}>INVOICE</h1>

        {/* Company and Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 border border-gray-300" style={{ fontSize: '10px' }}>
          {/* Company Details - Left Side */}
          <div className="border-r border-gray-300 p-2">
            <div className="flex items-start gap-2 mb-2">
              {company?.logo_url && (
                <img src={company.logo_url} alt="Company Logo" className="w-12 h-12 object-contain" style={{ width: '48px', height: '48px' }} />
              )}
              <div>
                <h2 className="font-bold" style={{ fontSize: '14px' }}>{company?.company_name || 'Company Name'}</h2>
              </div>
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.3' }}>
              <p>{company?.address || 'Address'}</p>
              <p>{company?.city ? `${company.city}, ` : ''}{company?.state ? `${company.state} ` : ''}{company?.pincode || ''}</p>
              <p>Ph: {company?.phone || 'N/A'}</p>
              <p>GSTIN: {company?.gst_number || 'N/A'}</p>
              <p>Email: {company?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Invoice Info - Right Side */}
          <div className="p-2">
            <table className="w-full" style={{ fontSize: '9px' }}>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-1 font-semibold">Invoice No.</td>
                  <td className="py-1 font-semibold">Invoice Date:</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">{invoice.invoice_number}</td>
                  <td className="py-1">{new Date(invoice.invoice_date).toLocaleDateString('en-GB')}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1" style={{ fontSize: '8px' }}>Bank A/c: {company?.account_number || 'N/A'}</td>
                  <td className="py-1" style={{ fontSize: '8px' }}>Bank IFSC: {company?.ifsc_code || 'N/A'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1" style={{ fontSize: '8px' }}>A/c: {(company?.account_holder || company?.company_name || 'N/A').substring(0, 20)}</td>
                  <td className="py-1" style={{ fontSize: '8px' }}>Bank: {(company?.bank_name || 'N/A').substring(0, 15)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">Buyer Order</td>
                  <td className="py-1">Vehicle No</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">{invoice.buyer_order_no || 'N/A'}</td>
                  <td className="py-1">{invoice.vehicle_no || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1" colSpan="2">Payment: {formatPaymentTerms(invoice.payment_terms)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="border border-gray-300 p-2 mb-3" style={{ fontSize: '9px' }}>
          <p className="font-semibold mb-1" style={{ fontSize: '10px' }}>Buyer</p>
          <p className="font-bold" style={{ fontSize: '11px' }}>{invoice.customer_name}</p>
          <p style={{ fontSize: '9px' }}>{invoice.customer_address}</p>
          <p style={{ fontSize: '9px' }}>Ph: {invoice.customer_phone} | GSTIN: {invoice.customer_gst}</p>
        </div>

        {/* Items Table - Compact */}
        <div className="border border-gray-300 mb-3">
          <table className="w-full" style={{ fontSize: '8px', tableLayout: 'fixed' }}>
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 p-1" style={{ width: '3%' }}>S.No</th>
                <th className="border-r border-gray-300 p-1 text-left" style={{ width: '22%' }}>Product</th>
                <th className="border-r border-gray-300 p-1" style={{ width: '6%' }}>HSN</th>
                <th className="border-r border-gray-300 p-1" style={{ width: '4%' }}>UOM</th>
                <th className="border-r border-gray-300 p-1 text-right" style={{ width: '6%' }}>Qty</th>
                <th className="border-r border-gray-300 p-1 text-right" style={{ width: '8%' }}>Rate</th>
                <th className="border-r border-gray-300 p-1 text-right" style={{ width: '9%' }}>Amt</th>
                <th className="border-r border-gray-300 p-1 text-right" style={{ width: '5%' }}>Disc</th>
                <th className="border-r border-gray-300 p-1 text-right" style={{ width: '9%' }}>Taxable</th>
                <th className="border-r border-gray-300 p-1 text-center" colSpan="2" style={{ width: '12%' }}>SGST</th>
                <th className="border-r border-gray-300 p-1 text-center" colSpan="2" style={{ width: '12%' }}>CGST</th>
                <th className="p-1 text-right" style={{ width: '10%' }}>Total</th>
              </tr>
              <tr className="border-b border-gray-300" style={{ fontSize: '7px' }}>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0"></th>
                <th className="border-r border-gray-300 p-0">%</th>
                <th className="border-r border-gray-300 p-0">₹</th>
                <th className="border-r border-gray-300 p-0">%</th>
                <th className="border-r border-gray-300 p-0">₹</th>
                <th className="p-0"></th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '8px' }}>
              {invoice.items?.map((item, index) => {
                const itemAmount = item.quantity * item.price;
                const discountAmount = itemAmount * (item.discount_percent / 100);
                const taxableAmount = itemAmount - discountAmount;
                const sgstRate = invoice.is_interstate ? 0 : item.gst_rate / 2;
                const cgstRate = invoice.is_interstate ? 0 : item.gst_rate / 2;
                const sgstAmount = invoice.is_interstate ? 0 : taxableAmount * (sgstRate / 100);
                const cgstAmount = invoice.is_interstate ? 0 : taxableAmount * (cgstRate / 100);
                const total = taxableAmount + sgstAmount + cgstAmount;

                return (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="border-r border-gray-300 p-1 text-center">{index + 1}</td>
                    <td className="border-r border-gray-300 p-1" style={{ wordBreak: 'break-word', fontSize: '8px' }}>{item.product_name}</td>
                    <td className="border-r border-gray-300 p-1 text-center">{item.hsn_code || '-'}</td>
                    <td className="border-r border-gray-300 p-1 text-center">{item.unit}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{item.quantity.toFixed(2)}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{item.price.toFixed(2)}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{itemAmount.toFixed(2)}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{item.discount_percent.toFixed(0)}%</td>
                    <td className="border-r border-gray-300 p-1 text-right">{taxableAmount.toFixed(2)}</td>
                    <td className="border-r border-gray-300 p-1 text-center">{sgstRate.toFixed(1)}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{sgstAmount.toFixed(2)}</td>
                    <td className="border-r border-gray-300 p-1 text-center">{cgstRate.toFixed(1)}</td>
                    <td className="border-r border-gray-300 p-1 text-right">{cgstAmount.toFixed(2)}</td>
                    <td className="p-1 text-right font-semibold">{total.toFixed(2)}</td>
                  </tr>
                );
              })}
              
              {/* Total Row */}
              <tr className="font-bold border-b border-gray-300 bg-gray-50">
                <td className="border-r border-gray-300 p-1 text-center" colSpan="4">Total</td>
                <td className="border-r border-gray-300 p-1 text-right">
                  {invoice.items?.reduce((sum, item) => sum + item.quantity, 0).toFixed(0)}
                </td>
                <td className="border-r border-gray-300 p-1 text-center">-</td>
                <td className="border-r border-gray-300 p-1 text-right">{invoice.subtotal.toFixed(2)}</td>
                <td className="border-r border-gray-300 p-1 text-center">-</td>
                <td className="border-r border-gray-300 p-1 text-right">{invoice.taxable_amount.toFixed(2)}</td>
                <td className="border-r border-gray-300 p-1 text-center">-</td>
                <td className="border-r border-gray-300 p-1 text-right">{invoice.sgst_amount.toFixed(2)}</td>
                <td className="border-r border-gray-300 p-1 text-center">-</td>
                <td className="border-r border-gray-300 p-1 text-right">{invoice.cgst_amount.toFixed(2)}</td>
                <td className="p-1 text-right">{invoice.grand_total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words and Summary */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Amount in Words */}
          <div className="border border-gray-300 p-2">
            <p className="font-semibold mb-1" style={{ fontSize: '9px' }}>Amount In words</p>
            <p className="font-bold" style={{ fontSize: '10px' }}>{numberToWords(invoice.grand_total)}</p>
          </div>

          {/* Summary */}
          <div className="border border-gray-300">
            <table className="w-full" style={{ fontSize: '9px' }}>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-1 text-right font-semibold">Total Amount before Tax</td>
                  <td className="p-1 text-right">{invoice.taxable_amount.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1 text-right">SGST</td>
                  <td className="p-1 text-right">{invoice.sgst_amount.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1 text-right">CGST</td>
                  <td className="p-1 text-right">{invoice.cgst_amount.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1 text-right font-semibold">Total Tax</td>
                  <td className="p-1 text-right">{invoice.total_gst.toFixed(2)}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="p-1 text-right font-bold">Total Amount</td>
                  <td className="p-1 text-right font-bold">{invoice.grand_total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border border-gray-300 p-2 mb-3" style={{ fontSize: '8px' }}>
          <p className="font-bold mb-1">Terms and Conditions</p>
          <p>{company?.terms_and_conditions || 'Standard terms and conditions apply.'}</p>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-3 border border-gray-300 mb-2">
          <div className="border-r border-gray-300 p-2" style={{ height: '60px', fontSize: '9px' }}>
            <p className="font-semibold">Customer's Seal and Signature</p>
          </div>
          <div className="p-2 flex items-end justify-end" style={{ height: '60px', fontSize: '9px' }}>
            <p className="font-semibold">For {company?.company_name || 'Company Name'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center" style={{ fontSize: '8px', color: '#666' }}>
          <p>This is computer generated Invoice</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
