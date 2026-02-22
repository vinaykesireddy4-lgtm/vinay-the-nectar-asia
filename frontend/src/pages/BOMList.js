import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Eye, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BOMList = () => {
  const navigate = useNavigate();
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      const response = await axios.get(`${API}/bom`);
      setBoms(response.data);
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      toast.error('Failed to fetch BOMs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this BOM?')) return;

    try {
      await axios.delete(`${API}/bom/${id}`);
      toast.success('BOM deleted successfully');
      fetchBOMs();
    } catch (error) {
      console.error('Error deleting BOM:', error);
      toast.error('Failed to delete BOM');
    }
  };

  const filteredBOMs = boms.filter((bom) =>
    bom.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill of Materials (BOM)</h1>
          <p className="text-gray-500 mt-1">Manage product recipes and material requirements</p>
        </div>
        <Button
          onClick={() => navigate('/create-bom')}
          className="bg-indigo-600 hover:bg-indigo-700"
          data-testid="create-bom-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create BOM
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-bom-input"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materials Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredBOMs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No BOMs found
                  </td>
                </tr>
              ) : (
                filteredBOMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-gray-50" data-testid={`bom-row-${bom.id}`}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{bom.product_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bom.materials?.length || 0} materials
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bom.updated_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/bom/${bom.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        data-testid={`view-bom-${bom.id}`}
                      >
                        <Eye className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => navigate(`/edit-bom/${bom.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        data-testid={`edit-bom-${bom.id}`}
                      >
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(bom.id)}
                        className="text-red-600 hover:text-red-900"
                        data-testid={`delete-bom-${bom.id}`}
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BOMList;