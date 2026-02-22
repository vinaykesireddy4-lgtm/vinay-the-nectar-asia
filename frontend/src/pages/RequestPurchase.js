import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ShoppingCart, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RequestPurchase = () => {
  const navigate = useNavigate();
  const [requesterName, setRequesterName] = useState('Inventory Manager');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{
    material_type: 'raw_material',
    material_id: '',
    material_name: '',
    quantity: '',
    unit: 'kg'
  }]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packingMaterials, setPackingMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
    
    // Check if there are pre-filled items from session storage (from production order)
    const storedItems = sessionStorage.getItem('purchaseRequestItems');
    const storedNote = sessionStorage.getItem('purchaseRequestNote');
    
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        if (parsedItems.length > 0) {
          setItems(parsedItems);
          toast.info('Materials pre-filled from production order');
        }
      } catch (error) {
        console.error('Error parsing stored items:', error);
      }
      sessionStorage.removeItem('purchaseRequestItems');
    }
    
    if (storedNote) {
      setNotes(storedNote);
      sessionStorage.removeItem('purchaseRequestNote');
    }
  }, []);

  const fetchMaterials = async () => {
    try {
      const [rawRes, packRes] = await Promise.all([
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/packing-materials`)
      ]);
      setRawMaterials(rawRes.data);
      setPackingMaterials(packRes.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const addItem = () => {
    setItems([...items, {
      material_type: 'raw_material',
      material_id: '',
      material_name: '',
      quantity: '',
      unit: 'kg'
    }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-populate material name when material is selected
    if (field === 'material_id') {
      const materials = newItems[index].material_type === 'raw_material' ? rawMaterials : packingMaterials;
      const selectedMaterial = materials.find(m => m.id === value);
      if (selectedMaterial) {
        newItems[index].material_name = selectedMaterial.name;
        newItems[index].unit = selectedMaterial.unit || 'kg';
      }
    }
    
    setItems(newItems);
  };

  const calculateTotalCost = () => {
    // Cost will be determined by purchase manager
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requesterName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    const validItems = items.filter(item => item.material_id && item.quantity);
    
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/purchase-requests`, {
        requested_by: requesterName,
        items: validItems.map(item => ({
          material_type: item.material_type,
          material_id: item.material_id,
          material_name: item.material_name,
          quantity: parseFloat(item.quantity),
          estimated_cost: 0, // Cost will be determined by purchase manager
          unit: item.unit
        })),
        total_estimated_cost: calculateTotalCost(),
        notes
      });
      
      toast.success('Purchase request created successfully!');
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase request:', error);
      toast.error('Failed to create purchase request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-indigo-600" />
          Request Purchase
        </h1>
        <p className="text-gray-500 mt-1">Create purchase request for raw materials or packing materials</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Requester Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <Input
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Inventory Manager"
              required
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Materials to Purchase</h3>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50 relative">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <Select
                  value={item.material_type}
                  onValueChange={(value) => updateItem(index, 'material_type', value)}
                >
                  <SelectTrigger className="w-full" data-testid="type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_material">Raw Material</SelectItem>
                    <SelectItem value="packing_material">Packing Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Material *</label>
                <Select
                  value={item.material_id}
                  onValueChange={(value) => updateItem(index, 'material_id', value)}
                >
                  <SelectTrigger className="w-full" data-testid="material-select">
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {(item.material_type === 'raw_material' ? rawMaterials : packingMaterials).length === 0 ? (
                      <div className="px-2 py-3 text-sm text-gray-500">No materials available</div>
                    ) : (
                      (item.material_type === 'raw_material' ? rawMaterials : packingMaterials).map(mat => (
                        <SelectItem key={mat.id} value={mat.id}>
                          {mat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <Input
                  value={item.unit}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  placeholder="kg"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes / Reason for Request
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="3"
            placeholder="Low stock - needed for upcoming production orders"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Purchase Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestPurchase;
