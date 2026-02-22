import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Define all available pages by module
const AVAILABLE_PERMISSIONS = {
  inventory: {
    label: 'Inventory',
    pages: [
      { path: '/inventory-dashboard', label: 'Inventory Dashboard' },
      { path: '/inventory-overview', label: 'Inventory Overview' },
      { path: '/raw-materials', label: 'Raw Materials' },
      { path: '/finished-goods', label: 'Finished Goods' },
      { path: '/packing-materials', label: 'Packing Materials' },
      { path: '/stock-inward', label: 'Stock Inward' },
      { path: '/pending-approvals', label: 'Pending Approvals' },
      { path: '/request-purchase', label: 'Request Purchase' }
    ]
  },
  manufacturing: {
    label: 'Manufacturing',
    pages: [
      { path: '/manufacturing-dashboard', label: 'Manufacturing Dashboard' },
      { path: '/bom', label: 'BOM' },
      { path: '/production-orders', label: 'Production Orders' }
    ]
  },
  sales: {
    label: 'Sales',
    pages: [
      { path: '/sales-dashboard', label: 'Sales Dashboard' },
      { path: '/customers', label: 'Customers' },
      { path: '/quotations', label: 'Quotations' },
      { path: '/sales-orders', label: 'Sales Orders' },
      { path: '/invoices', label: 'Invoices' },
      { path: '/delivery-challan', label: 'Delivery Challan' },
      { path: '/credit-notes', label: 'Credit Notes' }
    ]
  },
  purchase: {
    label: 'Purchase',
    pages: [
      { path: '/purchase-dashboard', label: 'Purchase Dashboard' },
      { path: '/suppliers', label: 'Suppliers' },
      { path: '/purchase-requests', label: 'Purchase Requests' },
      { path: '/purchase-orders', label: 'Purchase Orders' },
      { path: '/purchase-invoices', label: 'Purchase Invoices' }
    ]
  },
  finance: {
    label: 'Finance',
    pages: [
      { path: '/finance-dashboard', label: 'Finance Dashboard' },
      { path: '/balance-sheet', label: 'Balance Sheet' },
      { path: '/journal-entries', label: 'Journal Entries' },
      { path: '/supplier-bills', label: 'Supplier Bills' },
      { path: '/payment-received', label: 'Payment Received' },
      { path: '/payment-made', label: 'Payment Made' }
    ]
  },
  hr: {
    label: 'Human Resources',
    pages: [
      { path: '/hr/dashboard', label: 'HR Dashboard' },
      { path: '/hr/employees', label: 'Employees' },
      { path: '/hr/departments', label: 'Departments' },
      { path: '/hr/attendance/mark', label: 'Mark Attendance' },
      { path: '/hr/attendance/report', label: 'Attendance Reports' },
      { path: '/hr/leave', label: 'Leave Management' },
      { path: '/hr/payroll', label: 'Payroll' },
      { path: '/hr/performance', label: 'Performance Reviews' },
      { path: '/hr/goals', label: 'Goals & KPIs' },
      { path: '/hr/jobs', label: 'Job Postings' },
      { path: '/hr/candidates', label: 'Candidates' },
      { path: '/hr/interviews', label: 'Interviews' }
    ]
  }
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API}/admin/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/admin/roles/${editingId}`, formData);
        toast.success('Role updated successfully!');
      } else {
        await axios.post(`${API}/admin/roles`, formData);
        toast.success('Role created successfully!');
      }
      resetForm();
      fetchRoles();
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setEditingId(role.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`${API}/admin/roles/${id}`);
        toast.success('Role deleted successfully!');
        fetchRoles();
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  const togglePagePermission = (module, pagePath) => {
    const permissions = [...formData.permissions];
    const moduleIndex = permissions.findIndex(p => p.module === module);

    if (moduleIndex === -1) {
      // Add new module with this page
      permissions.push({ module, pages: [pagePath] });
    } else {
      const pages = [...permissions[moduleIndex].pages];
      const pageIndex = pages.indexOf(pagePath);
      
      if (pageIndex === -1) {
        pages.push(pagePath);
      } else {
        pages.splice(pageIndex, 1);
      }

      if (pages.length === 0) {
        permissions.splice(moduleIndex, 1);
      } else {
        permissions[moduleIndex].pages = pages;
      }
    }

    setFormData({ ...formData, permissions });
  };

  const toggleModulePermission = (module) => {
    const permissions = [...formData.permissions];
    const moduleIndex = permissions.findIndex(p => p.module === module);
    const allPages = AVAILABLE_PERMISSIONS[module].pages.map(p => p.path);

    if (moduleIndex === -1 || permissions[moduleIndex].pages.length < allPages.length) {
      // Select all pages in module
      const index = permissions.findIndex(p => p.module === module);
      if (index === -1) {
        permissions.push({ module, pages: allPages });
      } else {
        permissions[index].pages = allPages;
      }
    } else {
      // Deselect all
      permissions.splice(moduleIndex, 1);
    }

    setFormData({ ...formData, permissions });
  };

  const isPageSelected = (module, pagePath) => {
    const modulePermission = formData.permissions.find(p => p.module === module);
    return modulePermission?.pages.includes(pagePath) || false;
  };

  const isModuleFullySelected = (module) => {
    const modulePermission = formData.permissions.find(p => p.module === module);
    const allPages = AVAILABLE_PERMISSIONS[module].pages.map(p => p.path);
    return modulePermission?.pages.length === allPages.length;
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Role Management</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Role'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Role' : 'New Role'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., inventory_manager"
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Permissions - Select Pages</h3>
              <div className="space-y-4">
                {Object.entries(AVAILABLE_PERMISSIONS).map(([module, moduleData]) => (
                  <div key={module} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={isModuleFullySelected(module)}
                        onChange={() => toggleModulePermission(module)}
                        className="w-4 h-4"
                      />
                      <label className="font-semibold text-lg">{moduleData.label}</label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-6">
                      {moduleData.pages.map((page) => (
                        <div key={page.path} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isPageSelected(module, page.path)}
                            onChange={() => togglePagePermission(module, page.path)}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">{page.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">{editingId ? 'Update' : 'Create'} Role</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {roles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl">{role.name}</h3>
                {role.description && (
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                )}
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((perm, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {AVAILABLE_PERMISSIONS[perm.module]?.label} ({perm.pages.length} pages)
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(role.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
