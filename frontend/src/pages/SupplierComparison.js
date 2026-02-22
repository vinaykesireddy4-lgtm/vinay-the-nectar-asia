import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingDown, TrendingUp, DollarSign, Truck, Package, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SupplierComparison = () => {
  const [comparison, setComparison] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packingMaterials, setPackingMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMaterialType, setFilterMaterialType] = useState('all');
  
  // Add/Edit Price Modal
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceForm, setPriceForm] = useState({
    supplier_id: '',
    material_type: 'raw_material',
    material_id: '',
    price: '',
    lead_time_days: '',
    minimum_order_qty: '',
    notes: ''
  });
  
  // Delete confirmation
  const [deletingPrice, setDeletingPrice] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchData();
    fetchComparison();
  }, [filterMaterialType]);

  const fetchData = async () => {
    try {
      const [suppliersRes, rawMat, packMat] = await Promise.all([
        axios.get(`${API}/suppliers`),
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/packing-materials`)
      ]);
      
      setSuppliers(suppliersRes.data);
      setRawMaterials(rawMat.data);
      setPackingMaterials(packMat.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchComparison = async () => {
    try {
      const params = filterMaterialType && filterMaterialType !== 'all' ? `?material_type=${filterMaterialType}` : '';
      const response = await axios.get(`${API}/supplier-prices/comparison${params}`);
      setComparison(response.data);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      toast.error('Failed to load price comparison');
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    
    if (!priceForm.supplier_id || !priceForm.material_id || !priceForm.price) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/supplier-prices`, {
        supplier_id: priceForm.supplier_id,
        material_type: priceForm.material_type,
        material_id: priceForm.material_id,
        price: parseFloat(priceForm.price),
        lead_time_days: priceForm.lead_time_days ? parseInt(priceForm.lead_time_days) : null,
        minimum_order_qty: priceForm.minimum_order_qty ? parseFloat(priceForm.minimum_order_qty) : null,
        notes: priceForm.notes
      });
      
      toast.success('Supplier price added successfully');
      setShowPriceModal(false);
      setPriceForm({
        supplier_id: '',
        material_type: 'raw_material',
        material_id: '',
        price: '',
        lead_time_days: '',
        minimum_order_qty: '',
        notes: ''
      });
      fetchComparison();
    } catch (error) {
      console.error('Error adding price:', error);
      toast.error(error.response?.data?.detail || 'Failed to add supplier price');
    } finally {
      setLoading(false);
    }
  };

  const currentMaterials = priceForm.material_type === 'raw_material' ? rawMaterials : packingMaterials;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Supplier Price Comparison</h1>
          </div>
          <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-price-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier Price
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Supplier Price</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPrice} className="space-y-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select
                    value={priceForm.supplier_id}
                    onValueChange={(value) => setPriceForm({ ...priceForm, supplier_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Material Type *</Label>
                  <Select
                    value={priceForm.material_type}
                    onValueChange={(value) => setPriceForm({ ...priceForm, material_type: value, material_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_material">Raw Material</SelectItem>
                      <SelectItem value="packing_material">Packing Material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Material *</Label>
                  <Select
                    value={priceForm.material_id}
                    onValueChange={(value) => setPriceForm({ ...priceForm, material_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentMaterials.map(material => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Price per Unit *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>Lead Time (Days)</Label>
                  <Input
                    type="number"
                    value={priceForm.lead_time_days}
                    onChange={(e) => setPriceForm({ ...priceForm, lead_time_days: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Minimum Order Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={priceForm.minimum_order_qty}
                    onChange={(e) => setPriceForm({ ...priceForm, minimum_order_qty: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    value={priceForm.notes}
                    onChange={(e) => setPriceForm({ ...priceForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowPriceModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Price'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600">Compare supplier prices and find the best deals for your materials</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <Label className="text-sm mb-2">Material Type</Label>
            <Select value={filterMaterialType} onValueChange={setFilterMaterialType}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                <SelectItem value="raw_material">Raw Materials Only</SelectItem>
                <SelectItem value="packing_material">Packing Materials Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Price Comparison Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Price Comparison</h2>
          <p className="text-sm text-gray-600">{comparison.length} materials with pricing data</p>
        </div>

        {comparison.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No supplier prices added yet</p>
            <p className="text-sm text-gray-400 mb-4">Start by adding supplier prices for your materials</p>
            <Button onClick={() => setShowPriceModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Price
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comparison.map((material) => (
              <div key={material.material_id} className="p-6">
                {/* Material Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{material.material_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        material.material_type === 'raw_material' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {material.material_type === 'raw_material' ? 'Raw Material' : 'Packing Material'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Unit: {material.unit}
                      </span>
                    </div>
                  </div>
                  {material.cheapest_supplier && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Best Price</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{material.cheapest_price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{material.cheapest_supplier}</p>
                    </div>
                  )}
                </div>

                {/* Supplier Prices Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/{material.unit}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min. Order</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {material.suppliers.map((supplier, idx) => {
                        const isCheapest = idx === 0;
                        return (
                          <tr key={supplier.supplier_id} className={isCheapest ? 'bg-green-50' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isCheapest && <TrendingDown className="h-4 w-4 text-green-600" />}
                                <span className={`font-medium ${isCheapest ? 'text-green-700' : 'text-gray-900'}`}>
                                  {supplier.supplier_name}
                                </span>
                                {isCheapest && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    Best
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`px-4 py-3 font-semibold ${isCheapest ? 'text-green-700' : 'text-gray-900'}`}>
                              ₹{supplier.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {supplier.lead_time_days ? (
                                <div className="flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  {supplier.lead_time_days} days
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {supplier.minimum_order_qty ? `${supplier.minimum_order_qty} ${material.unit}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {supplier.notes || '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {new Date(supplier.updated_at).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierComparison;
