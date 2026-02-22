import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, AlertCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const PackingMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hsn_code: '',
    unit: 'pcs',
    price: '',
    gst_rate: '0',
    stock_quantity: '',
    min_stock_level: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API}/packing-materials`);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching packing materials:', error);
      toast.error('Failed to fetch packing materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        hsn_code: formData.hsn_code,
        unit: formData.unit,
        purchase_price: 0,
        gst_rate: 0,
        stock_quantity: parseFloat(formData.stock_quantity) || 0,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
      };

      if (editingMaterial) {
        await axios.put(`${API}/packing-materials/${editingMaterial.id}`, data);
        toast.success('Packing material updated successfully');
      } else {
        await axios.post(`${API}/packing-materials`, data);
        toast.success('Packing material created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error('Error saving packing material:', error);
      toast.error('Failed to save packing material');
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      hsn_code: material.hsn_code || '',
      unit: material.unit,
      price: material.purchase_price?.toString() || '0',
      gst_rate: material.gst_rate.toString(),
      stock_quantity: material.stock_quantity?.toString() || '0',
      min_stock_level: material.min_stock_level?.toString() || '0',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this packing material?')) return;

    try {
      await axios.delete(`${API}/packing-materials/${id}`);
      toast.success('Packing material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting packing material:', error);
      toast.error('Failed to delete packing material');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      hsn_code: '',
      unit: 'pcs',
      price: '',
      gst_rate: '0',
      stock_quantity: '',
      min_stock_level: '',
    });
    setEditingMaterial(null);
  };

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLowStock = (material) => {
    return material.stock_quantity <= material.min_stock_level;
  };

  // Calculate statistics
  const stats = {
    totalItems: materials.length,
    lowStockCount: materials.filter(m => isLowStock(m) && m.stock_quantity > 0).length,
    outOfStockCount: materials.filter(m => m.stock_quantity <= 0).length,
    totalValue: materials.reduce((sum, m) => sum + (m.stock_quantity * (m.purchase_price || 0)), 0),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Packing Materials</h1>
            <p className="text-gray-500 mt-1">Manage packing materials inventory with stock tracking</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/request-purchase')}
              variant="outline"
              data-testid="request-purchase-btn"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Request Purchase
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="add-packing-material-btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Packing Material
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Packing Materials</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
            <p className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-between items-center" style={{display: 'none'}}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packing Materials</h1>
          <p className="text-gray-500 mt-1">Manage packing materials inventory with stock tracking</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
          data-testid="add-packing-material-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Packing Material
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search packing materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-packing-materials-input"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No packing materials found
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {isLowStock(material) && (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900">{material.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.hsn_code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${
                          isLowStock(material) ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {material.stock_quantity || 0} {material.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isLowStock(material) ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : material.stock_quantity === 0 ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(material)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        data-testid={`edit-packing-material-${material.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900"
                        data-testid={`delete-packing-material-${material.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="packing-material-dialog" aria-describedby="packing-material-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Edit Packing Material' : 'Add New Packing Material'}
            </DialogTitle>
            <p id="packing-material-dialog-description" className="sr-only">
              Form to add or edit packing material details including stock
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Material Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="packing-material-name-input"
                />
              </div>
              <div>
                <Label htmlFor="hsn_code">HSN Code</Label>
                <Input
                  id="hsn_code"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                  data-testid="packing-material-hsn-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger data-testid="packing-material-unit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="roll">Roll</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="mtr">Meter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Current Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    step="0.01"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    data-testid="packing-material-stock-input"
                  />
                </div>
                <div>
                  <Label htmlFor="min_stock_level">Min Stock Level</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    step="0.01"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    data-testid="packing-material-min-stock-input"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="save-packing-material-btn">
                {editingMaterial ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackingMaterials;