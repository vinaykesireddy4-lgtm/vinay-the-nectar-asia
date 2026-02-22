import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await axios.get(`${API}/quotations/${id}`);
      setQuotation(response.data);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-gray-600">Loading quotation...</div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation Not Found</h2>
          <p className="text-gray-600 mb-4">The quotation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/quotations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/quotations')}
            data-testid="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quotation.quotation_number}</h1>
            <p className="text-gray-500">Quotation Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(quotation.status)}
        </div>
      </div>

      {/* Quotation Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600">Quotation Number</p>
            <p className="font-semibold text-gray-900">{quotation.quotation_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold text-gray-900">{quotation.customer_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quotation Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(quotation.quotation_date).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="font-semibold text-gray-900">
              {new Date(quotation.valid_until).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {quotation.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">Notes:</p>
            <p className="text-sm text-blue-900">{quotation.notes}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN Code</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotation.items?.map((item, index) => {
                const itemTotal = item.quantity * item.price;
                const discountAmount = itemTotal * (item.discount_percent / 100);
                const taxableAmount = itemTotal - discountAmount;
                const gstAmount = taxableAmount * (item.gst_rate / 100);
                const lineTotal = taxableAmount + gstAmount;

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.hsn_code || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {item.discount_percent}%
                      {item.discount_percent > 0 && (
                        <div className="text-xs text-red-600">-₹{discountAmount.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {item.gst_rate}%
                      <div className="text-xs text-gray-500">₹{gstAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium text-right">
                      ₹{lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{quotation.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="font-medium text-red-600">-₹{quotation.discount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxable Amount:</span>
            <span className="font-medium">₹{quotation.taxable_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST:</span>
            <span className="font-medium">₹{quotation.gst_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Grand Total:</span>
            <span className="text-indigo-600">₹{quotation.grand_total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" data-testid="download-pdf-btn">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" data-testid="send-email-btn">
          <Send className="h-4 w-4 mr-2" />
          Send to Customer
        </Button>
      </div>
    </div>
  );
};

export default QuotationView;
