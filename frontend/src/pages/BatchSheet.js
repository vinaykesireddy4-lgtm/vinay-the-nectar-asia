import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BatchSheet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      const [orderRes, companyRes] = await Promise.all([
        axios.get(`${API}/production-orders/${id}`),
        axios.get(`${API}/company-settings`)
      ]);
      setOrder(orderRes.data);
      setCompany(companyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch batch sheet data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center">Loading batch sheet...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-red-600">Production order not found</div>;
  }

  return (
    <div>
      {/* Print Controls - Hidden when printing */}
      <div className="no-print p-8 pb-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/production-orders/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Production Order
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700">
              <Printer className="h-4 w-4 mr-2" />
              Print Batch Sheet
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Batch Sheet */}
      <div className="batch-sheet p-8 bg-white">
        {/* Header */}
        <div className="border-4 border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company?.company_name || 'Company Name'}</h1>
              <p className="text-sm text-gray-600 mt-1">{company?.address || ''}</p>
              {company?.gstin && <p className="text-sm text-gray-600">GSTIN: {company.gstin}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-indigo-600">BATCH SHEET</h2>
              <p className="text-sm text-gray-600 mt-1">Production Work Order</p>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-gray-300 p-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Order Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Batch/Order Number:</span>
                <span className="text-sm font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Product:</span>
                <span className="text-sm font-bold">{order.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity to Produce:</span>
                <span className="text-sm font-bold text-indigo-600 text-lg">{order.quantity_to_produce} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Date:</span>
                <span className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-300 p-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Production Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-bold px-3 py-1 rounded ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              {order.start_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Time:</span>
                  <span className="text-sm font-bold">{new Date(order.start_date).toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.completion_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion Time:</span>
                  <span className="text-sm font-bold">{new Date(order.completion_date).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Materials Required (BOM) */}
        {order.materials_required && order.materials_required.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
              MATERIALS REQUIRED (Bill of Materials)
            </h3>
            <table className="w-full border-2 border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold">S.No</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold">Material Type</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold">Material Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-bold">Required Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold">Unit</th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold">Issued</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {order.materials_required.map((material, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm">{idx + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        material.material_type === 'raw' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {material.material_type === 'raw' ? 'Raw Material' : 'Packing Material'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{material.material_name}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right font-bold">{material.required_quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-center">{material.unit}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                      <div className="w-6 h-6 border-2 border-gray-400 mx-auto"></div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      <div className="border-b border-gray-300 h-6"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Production Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
            PRODUCTION INSTRUCTIONS
          </h3>
          <div className="border-2 border-gray-300 p-4 min-h-[100px]">
            {order.notes ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No special instructions</p>
            )}
          </div>
        </div>

        {/* Quality Checkpoints */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
            QUALITY CHECKPOINTS
          </h3>
          <table className="w-full border-2 border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold">Checkpoint</th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold">Status</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-3 text-sm">Raw Material Quality Check</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="flex justify-center gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" /> OK
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" /> Not OK
                    </label>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="border-b border-gray-300 h-6"></div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 text-sm">In-Process Quality Check</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="flex justify-center gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" /> OK
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" /> Not OK
                    </label>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="border-b border-gray-300 h-6"></div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 text-sm">Final Product Quality Check</td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="flex justify-center gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" /> OK
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" /> Not OK
                    </label>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="border-b border-gray-300 h-6"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Production Record */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
            PRODUCTION RECORD
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-gray-300 p-4">
              <label className="text-sm font-bold text-gray-700 block mb-2">Actual Quantity Produced:</label>
              <div className="border-b-2 border-gray-400 h-8"></div>
            </div>
            <div className="border-2 border-gray-300 p-4">
              <label className="text-sm font-bold text-gray-700 block mb-2">Rejected/Waste Quantity:</label>
              <div className="border-b-2 border-gray-400 h-8"></div>
            </div>
            <div className="border-2 border-gray-300 p-4">
              <label className="text-sm font-bold text-gray-700 block mb-2">Production Start Time:</label>
              <div className="border-b-2 border-gray-400 h-8"></div>
            </div>
            <div className="border-2 border-gray-300 p-4">
              <label className="text-sm font-bold text-gray-700 block mb-2">Production End Time:</label>
              <div className="border-b-2 border-gray-400 h-8"></div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t-2 border-gray-300">
          <div className="text-center">
            <div className="border-b-2 border-gray-800 mb-2 pb-16"></div>
            <p className="text-sm font-bold">Prepared By</p>
            <p className="text-xs text-gray-500">Name & Signature</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-800 mb-2 pb-16"></div>
            <p className="text-sm font-bold">Supervisor</p>
            <p className="text-xs text-gray-500">Name & Signature</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-800 mb-2 pb-16"></div>
            <p className="text-sm font-bold">QC Approved By</p>
            <p className="text-xs text-gray-500">Name & Signature</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>This is a computer-generated batch sheet. Generated on {new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .batch-sheet {
            padding: 20px;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default BatchSheet;
