import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save } from 'lucide-react';
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

const CreateBOM = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packingMaterials, setPackingMaterials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (isEdit) {
      fetchBOM();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, rawRes, packRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/packing-materials`)
      ]);
      setProducts(productsRes.data);
      setRawMaterials(rawRes.data);
      setPackingMaterials(packRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const fetchBOM = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bom/${id}`);
      const bom = response.data;
      const product = products.find(p => p.id === bom.product_id);
      setSelectedProduct(product);
      setMaterials(bom.materials);
      setNotes(bom.notes || '');
    } catch (error) {
      console.error('Error fetching BOM:', error);
      toast.error('Failed to fetch BOM');
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        material_type: 'raw',
        material_id: '',
        material_name: '',
        quantity: 1,
        unit: '',
      },
    ]);
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;

    if (field === 'material_id' && value) {
      const allMaterials = newMaterials[index].material_type === 'raw' ? rawMaterials : packingMaterials;
      const material = allMaterials.find((m) => m.id === value);
      if (material) {
        newMaterials[index].material_name = material.name;
        newMaterials[index].unit = material.unit;
      }
    }

    if (field === 'material_type') {
      newMaterials[index].material_id = '';
      newMaterials[index].material_name = '';
      newMaterials[index].unit = '';
    }

    setMaterials(newMaterials);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (materials.length === 0) {
      toast.error('Please add at least one material');
      return;
    }

    if (materials.some((m) => !m.material_id)) {
      toast.error('Please select all materials');
      return;
    }

    try {
      const bomData = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        materials: materials.map((m) => ({
          material_type: m.material_type,
          material_id: m.material_id,
          material_name: m.material_name,
          quantity: parseFloat(m.quantity),
          unit: m.unit,
        })),
        notes: notes,
      };

      if (isEdit) {
        await axios.put(`${API}/bom/${id}`, { materials: bomData.materials, notes: bomData.notes });
        toast.success('BOM updated successfully');
      } else {
        await axios.post(`${API}/bom`, bomData);
        toast.success('BOM created successfully');
      }

      navigate('/bom');
    } catch (error) {
      console.error('Error saving BOM:', error);
      toast.error('Failed to save BOM');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit BOM' : 'Create Bill of Materials'}
        </h1>
        <p className="text-gray-500 mt-1">Define material requirements for production</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Product Details</h2>
          <div>
            <Label htmlFor="product">Product *</Label>
            <Select
              value={selectedProduct?.id || ''}
              onValueChange={(value) => {
                const product = products.find((p) => p.id === value);
                setSelectedProduct(product);
              }}
              disabled={isEdit}
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Materials Required</h2>
            <Button type="button" onClick={addMaterial} size="sm" data-testid="add-material-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>

          {materials.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No materials added. Click "Add Material" to begin.</p>
          ) : (
            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <Label>Type *</Label>
                      <Select
                        value={material.material_type}
                        onValueChange={(value) => updateMaterial(index, 'material_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="raw">Raw Material</SelectItem>
                          <SelectItem value="packing">Packing Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Label>Material *</Label>
                      <Select
                        value={material.material_id}
                        onValueChange={(value) => updateMaterial(index, 'material_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {(material.material_type === 'raw' ? rawMaterials : packingMaterials).map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit</Label>
                      <Input type="text" value={material.unit} readOnly className="bg-gray-50" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes or instructions"
            rows={3}
            data-testid="notes-textarea"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/bom')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="save-bom-btn">
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Update BOM' : 'Create BOM'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBOM;
