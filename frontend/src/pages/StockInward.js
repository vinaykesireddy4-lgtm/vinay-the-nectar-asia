import { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StockInward = () => {
  const [materialType, setMaterialType] = useState('raw_material');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('');
  
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packingMaterials, setPackingMaterials] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchHistory();
  }, []);

  const fetchMaterials = async () => {
    try {
      const [rawMat, packMat] = await Promise.all([
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/packing-materials`)
      ]);
      
      setRawMaterials(rawMat.data);
      setPackingMaterials(packMat.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/stock-inward`);
      setStockHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    
    if (!selectedMaterialId) {
      toast.error('Please select a material');
      return;
    }
    
    if (!quantityToAdd || parseFloat(quantityToAdd) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/stock-inward`, {
        material_type: materialType,
        material_id: selectedMaterialId,
        quantity_added: parseFloat(quantityToAdd)
      });
      
      toast.success(`✅ ${response.data.quantity_added} ${response.data.unit} added to ${response.data.material_name}. New stock: ${response.data.new_stock_quantity} ${response.data.unit}`);
      
      // Reset form
      setSelectedMaterialId('');
      setQuantityToAdd('');
      
      // Refresh data
      fetchMaterials();
      fetchHistory();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error(error.response?.data?.detail || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const currentMaterials = materialType === 'raw_material' ? rawMaterials : packingMaterials;
  const selectedMaterial = currentMaterials.find(m => m.id === selectedMaterialId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <PackagePlus className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Stock Inward</h1>
        </div>
        <p className="text-gray-600">Add stock quantities to raw materials and packing materials</p>
      </div>

      {/* Add Stock Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Stock</h2>
        
        <form onSubmit={handleAddStock} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Material Type */}
            <div>
              <Label>Material Type *</Label>
              <Select
                value={materialType}
                onValueChange={(value) => {
                  setMaterialType(value);
                  setSelectedMaterialId('');
                }}
              >
                <SelectTrigger data-testid="material-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_material">Raw Material</SelectItem>
                  <SelectItem value="packing_material">Packing Material</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Material Selection */}
            <div>
              <Label>Select Material *</Label>
              <Select
                value={selectedMaterialId}
                onValueChange={setSelectedMaterialId}
              >
                <SelectTrigger data-testid="material-select">
                  <SelectValue placeholder="Choose material..." />
                </SelectTrigger>
                <SelectContent>
                  {currentMaterials.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-gray-500">No materials available</div>
                  ) : (
                    currentMaterials.map(material => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} (Current: {material.stock_quantity} {material.unit})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <Label>Quantity to Add *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  placeholder="0.00"
                  required
                  data-testid="quantity-input"
                />
                {selectedMaterial && (
                  <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                    {selectedMaterial.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} data-testid="add-stock-button">
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Adding Stock...' : 'Add Stock'}
          </Button>
        </form>
      </div>

      {/* Current Stock Display */}
      {selectedMaterial && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Selected Material</p>
              <p className="text-lg font-bold text-blue-900">{selectedMaterial.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Current Stock</p>
              <p className="text-2xl font-bold text-blue-900">
                {selectedMaterial.stock_quantity} {selectedMaterial.unit}
              </p>
            </div>
            {quantityToAdd && parseFloat(quantityToAdd) > 0 && (
              <div className="text-right">
                <p className="text-sm text-green-600">After Adding</p>
                <p className="text-2xl font-bold text-green-900">
                  {(parseFloat(selectedMaterial.stock_quantity) + parseFloat(quantityToAdd)).toFixed(2)} {selectedMaterial.unit}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Inward History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Stock Inward History</h2>
          <p className="text-sm text-gray-600">{stockHistory.length} total entries</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Added</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No stock additions yet
                  </td>
                </tr>
              ) : (
                stockHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(entry.added_date).toLocaleDateString()} {new Date(entry.added_date).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.material_type === 'raw_material' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {entry.material_type === 'raw_material' ? 'Raw Material' : 'Packing Material'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.material_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      +{entry.quantity_added}
                    </td>
                    <td className="px-6 py-4 text-sm">{entry.unit}</td>
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

export default StockInward;
