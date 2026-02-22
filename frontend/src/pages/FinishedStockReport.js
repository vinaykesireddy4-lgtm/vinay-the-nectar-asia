import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FinishedStockReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalStockValue: 0,
    outOfStockCount: 0,
  });

  useEffect(() => {
    fetchFinishedStock();
  }, []);

  const fetchFinishedStock = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const productsData = response.data;
      setProducts(productsData);

      // Calculate statistics
      const lowStock = productsData.filter(p => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length;
      const outOfStock = productsData.filter(p => p.stock_quantity <= 0).length;
      const totalValue = productsData.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0);

      setStats({
        totalProducts: productsData.length,
        lowStockCount: lowStock,
        totalStockValue: totalValue,
        outOfStockCount: outOfStock,
      });
    } catch (error) {
      console.error('Error fetching finished stock:', error);
      toast.error('Failed to fetch finished stock');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    if (product.stock_quantity <= 0) {
      return { status: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { status: 'Low Stock', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finished Stock Report</h1>
        <p className="text-gray-500 mt-1">Monitor finished goods inventory and stock levels</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="total-products">
                {stats.totalProducts}
              </p>
            </div>
            <Package className="h-10 w-10 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600" data-testid="low-stock-count">
                {stats.lowStockCount}
              </p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600" data-testid="out-of-stock-count">
                {stats.outOfStockCount}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Stock Value</p>
              <p className="text-2xl font-bold text-green-600" data-testid="total-stock-value">
                ₹{stats.totalStockValue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <Label htmlFor="search">Search Products</Label>
        <Input
          id="search"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="search-products-input"
        />
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Finished Goods Inventory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const stockValue = product.stock_quantity * product.price;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50" data-testid={`product-row-${product.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.stock_quantity <= product.min_stock_level && (
                            <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.hsn_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${stockStatus.color}`}>
                          {product.stock_quantity} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.min_stock_level} {product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{stockValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredProducts.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    Total Stock Value:
                  </td>
                  <td colSpan="2" className="px-6 py-4 text-sm font-bold text-green-600">
                    ₹{stats.totalStockValue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock Status Guide:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 mr-2">
              In Stock
            </span>
            <span className="text-sm text-gray-600">Stock above minimum level</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600 mr-2">
              Low Stock
            </span>
            <span className="text-sm text-gray-600">Stock at or below minimum level</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 mr-2">
              Out of Stock
            </span>
            <span className="text-sm text-gray-600">No stock available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishedStockReport;
