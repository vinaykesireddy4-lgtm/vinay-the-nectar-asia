import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateProductionOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get id from URL for edit mode
  const isEditMode = Boolean(id);
  
  const [products, setProducts] = useState([]);
  const [boms, setBOMs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [materialPreview, setMaterialPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (isEditMode) {
      fetchProductionOrder();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [productsRes, bomsRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/bom`)
      ]);
      setProducts(productsRes.data);
      setBOMs(bomsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const fetchProductionOrder = async () => {
    try {
      const response = await axios.get(`${API}/production-orders/${id}`);
      const order = response.data;
      
      setSelectedProduct(products.find(p => p.id === order.product_id) || { id: order.product_id, name: order.product_name });
      setQuantity(order.quantity_to_produce);
      setNotes(order.notes || '');
      
      if (order.bom_id) {
        const bom = boms.find(b => b.id === order.bom_id);
        setSelectedBOM(bom);
        if (bom) {
          updateMaterialPreview(bom, order.quantity_to_produce);
        }
      }
    } catch (error) {
      console.error('Error fetching production order:', error);
      toast.error('Failed to fetch production order');
    }
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    
    // Find BOM for this product
    const bom = boms.find(b => b.product_id === productId);
    setSelectedBOM(bom || null);
    
    // Calculate material requirements
    if (bom) {
      updateMaterialPreview(bom, quantity);
    } else {
      setMaterialPreview([]);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    if (selectedBOM) {
      updateMaterialPreview(selectedBOM, newQuantity);
    }
  };

  const updateMaterialPreview = (bom, qty) => {
    const preview = bom.materials.map(m => ({
      ...m,
      required_quantity: m.quantity * qty
    }));
    setMaterialPreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity_to_produce: parseFloat(quantity),
        bom_id: selectedBOM?.id || null,
        notes: notes,
      };

      if (isEditMode) {
        await axios.put(`${API}/production-orders/${id}`, orderData);
        toast.success('Production order updated successfully');
      } else {
        await axios.post(`${API}/production-orders`, orderData);
        toast.success('Production order created successfully');
      }
      
      navigate('/production-orders');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} production order:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} production order`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Production Order' : 'Create Production Order'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode ? 'Update production order details' : 'Schedule a new production run'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Production Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product">Product *</Label>
              <Select
                value={selectedProduct?.id || ''}
                onValueChange={handleProductChange}
              >
                <SelectTrigger data-testid="product-select">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && !selectedBOM && (
                <p className="text-xs text-orange-600 mt-1">⚠️ No BOM found for this product</p>
              )}
              {selectedBOM && (
                <p className="text-xs text-green-600 mt-1">✓ BOM found - materials will be auto-calculated</p>
              )}
            </div>
            <div>
              <Label htmlFor="quantity">Quantity to Produce *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                data-testid="quantity-input"
              />
            </div>
          </div>
        </div>

        {materialPreview.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Material Requirements Preview</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materialPreview.map((mat, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          mat.material_type === 'raw' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {mat.material_type === 'raw' ? 'Raw' : 'Packing'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{mat.material_name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                        {mat.required_quantity} {mat.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Production instructions or special notes"
            rows={3}
            data-testid="notes-textarea"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/production-orders')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="create-production-order-submit-btn" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (isEditMode ? 'Update Production Order' : 'Create Production Order')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductionOrder;
