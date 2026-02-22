import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OutstandingInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceType, setInvoiceType] = useState('sales');
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    fetchOutstandingInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceType]);

  const fetchOutstandingInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/outstanding-invoices`, {
        params: { invoice_type: invoiceType },
      });
      setInvoices(response.data);
      
      // Calculate total outstanding
      const total = response.data.reduce((sum, inv) => sum + inv.outstanding_amount, 0);
      setTotalOutstanding(total);
    } catch (error) {
      console.error('Error fetching outstanding invoices:', error);
      toast.error('Failed to fetch outstanding invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (daysOverdue) => {
    if (daysOverdue <= 0) return 'text-green-600';
    if (daysOverdue <= 30) return 'text-yellow-600';
    if (daysOverdue <= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (daysOverdue) => {
    if (daysOverdue <= 0) return 'bg-green-100 text-green-800';
    if (daysOverdue <= 30) return 'bg-yellow-100 text-yellow-800';
    if (daysOverdue <= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Outstanding Invoices Report</h1>
        <p className="text-gray-500 mt-1">Track unpaid and partially paid invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600" data-testid="total-outstanding-amount">
                ₹{totalOutstanding.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="total-invoices-count">
                {invoices.length}
              </p>
            </div>
            <FileText className="h-10 w-10 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Invoice Type</p>
              <Select value={invoiceType} onValueChange={setInvoiceType}>
                <SelectTrigger className="w-40" data-testid="invoice-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Outstanding Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {invoiceType === 'sales' ? 'Sales' : 'Purchase'} Invoices Outstanding
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {invoiceType === 'sales' ? 'Customer' : 'Supplier'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No outstanding invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.invoice_number} className="hover:bg-gray-50" data-testid={`invoice-row-${invoice.invoice_number}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-indigo-600">
                        {invoice.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.partner_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{invoice.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{invoice.paid_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-red-600">
                        ₹{invoice.outstanding_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(invoice.days_overdue)}`}>
                        {invoice.days_overdue > 0 ? `${invoice.days_overdue} days` : 'Not due'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getStatusBadge(invoice.days_overdue)
                        }`}
                      >
                        {invoice.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {invoices.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    Total Outstanding:
                  </td>
                  <td colSpan="3" className="px-6 py-4 text-sm font-bold text-red-600">
                    ₹{totalOutstanding.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutstandingInvoices;