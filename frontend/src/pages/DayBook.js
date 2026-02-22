import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, DollarSign, Download, FileSpreadsheet, FileText, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DayBook = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    purpose: '',
    debit: '',
    credit: ''
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/daybook`);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to fetch day book entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || (!formData.debit && !formData.credit)) {
      toast.error('Please fill description and either debit or credit');
      return;
    }

    try {
      if (editingId) {
        // Update existing entry
        await axios.put(`${API}/daybook/${editingId}`, {
          ...formData,
          debit: parseFloat(formData.debit) || 0,
          credit: parseFloat(formData.credit) || 0
        });
        toast.success('Entry updated successfully');
        setEditingId(null);
      } else {
        // Create new entry
        await axios.post(`${API}/daybook`, {
          ...formData,
          debit: parseFloat(formData.debit) || 0,
          credit: parseFloat(formData.credit) || 0
        });
        toast.success('Entry added successfully');
      }
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        purpose: '',
        debit: '',
        credit: ''
      });
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error(editingId ? 'Failed to update entry' : 'Failed to add entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      date: entry.date.split('T')[0],
      description: entry.description,
      purpose: entry.purpose || '',
      debit: entry.debit > 0 ? entry.debit.toString() : '',
      credit: entry.credit > 0 ? entry.credit.toString() : ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      purpose: '',
      debit: '',
      credit: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await axios.delete(`${API}/daybook/${id}`);
      toast.success('Entry deleted');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`${API}/daybook/export-excel`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daybook_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`${API}/daybook/export-pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daybook_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              Day Book
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Record all daily transactions - Bank statement format (Credit = Money In, Debit = Money Out)
            </p>
          </div>
          
          {/* Download Buttons */}
          {entries.length > 0 && (
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadExcel}
                variant="outline"
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download Excel
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
              >
                <FileText className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </div>

        {/* Entry Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Entry' : 'Add New Entry'}
            </h2>
            {editingId && (
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="outline"
                className="text-sm"
              >
                Cancel Edit
              </Button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Loan from Bank"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Business expansion"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit (Money In) ₹
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.credit}
                  onChange={(e) => setFormData({ ...formData, credit: e.target.value, debit: '' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Debit (Money Out) ₹
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.debit}
                  onChange={(e) => setFormData({ ...formData, debit: e.target.value, credit: '' })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              {editingId ? (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Update Entry
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Entries</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit (In)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit (Out)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No entries yet. Add your first transaction above.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {entry.purpose || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 text-right">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 text-right">
                        {formatCurrency(entry.balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          {entries.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-8">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Total Credit (In)</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(entries.reduce((sum, e) => sum + e.credit, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Total Debit (Out)</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(entries.reduce((sum, e) => sum + e.debit, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Current Balance</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {entries.length > 0 ? formatCurrency(entries[entries.length - 1].balance) : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayBook;
