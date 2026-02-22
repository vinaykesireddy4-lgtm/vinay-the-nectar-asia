import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, Key, Shield, Upload, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'employee',
    role_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API}/admin/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/hr/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(`${API}/admin/users/${editingId}`, updateData);
        toast.success('User updated successfully!');
      } else {
        await axios.post(`${API}/admin/users`, formData);
        toast.success('User created successfully!');
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save user');
    }
  };

  const handleBulkImport = async () => {
    try {
      // Parse CSV/JSON data
      const lines = bulkData.trim().split('\n');
      const results = { success: [], failed: [] };
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;
        
        const [username, email, full_name, password, role] = line.split(',').map(s => s.trim());
        
        if (!username || !email || !full_name || !password) {
          results.failed.push({ row: i + 1, reason: 'Missing required fields' });
          continue;
        }
        
        try {
          await axios.post(`${API}/admin/users`, {
            username,
            email,
            full_name,
            password,
            role: role || 'employee',
            is_active: true
          });
          results.success.push({ row: i + 1, username });
        } catch (error) {
          results.failed.push({ 
            row: i + 1, 
            username, 
            reason: error.response?.data?.detail || 'Failed to create' 
          });
        }
      }
      
      toast.success(`Created ${results.success.length} users. ${results.failed.length} failed.`);
      if (results.failed.length > 0) {
        console.error('Failed users:', results.failed);
      }
      
      setBulkData('');
      setShowBulkImport(false);
      fetchUsers();
    } catch (error) {
      toast.error('Bulk import failed');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      password: '',
      role: user.role,
      role_id: user.role_id || '',
      is_active: user.is_active
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API}/admin/users/${id}`);
        toast.success('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      try {
        await axios.post(`${API}/admin/users/${userId}/reset-password`, { password: newPassword });
        toast.success('Password reset successfully!');
      } catch (error) {
        toast.error('Failed to reset password');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      role: 'employee',
      role_id: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      hr_manager: 'bg-blue-100 text-blue-800',
      finance_manager: 'bg-green-100 text-green-800',
      inventory_manager: 'bg-purple-100 text-purple-800',
      sales_manager: 'bg-indigo-100 text-indigo-800',
      purchase_manager: 'bg-orange-100 text-orange-800',
      employee: 'bg-gray-100 text-gray-800'
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const generateCSVTemplate = () => {
    const template = `username,email,full_name,password,role
emp001,emp001@company.com,John Doe,password123,employee
emp002,emp002@company.com,Jane Smith,password123,employee
emp003,emp003@company.com,Bob Johnson,password123,employee`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportUsers = () => {
    const csv = ['username,email,full_name,role,is_active'];
    users.forEach(user => {
      csv.push(`${user.username},${user.email},${user.full_name},${user.role},${user.is_active}`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-sm text-gray-600">Manage user accounts and credentials</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers} data-testid="export-users-btn">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" onClick={() => setShowBulkImport(!showBulkImport)} data-testid="bulk-import-btn">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowForm(!showForm)} data-testid="add-user-btn">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add User'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'employee').length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Bulk Import Form */}
      {showBulkImport && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Import Users
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Download the CSV template by clicking the button below</li>
                <li>Fill in the employee details (username, email, full_name, password, role)</li>
                <li>Copy the content and paste it in the text area below</li>
                <li>Click "Import Users" to create all accounts</li>
              </ol>
              <Button 
                variant="outline" 
                className="mt-3" 
                onClick={generateCSVTemplate}
                data-testid="download-template-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>

            <div>
              <Label>CSV Data (Format: username,email,full_name,password,role)</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                rows="10"
                placeholder="username,email,full_name,password,role
emp001,emp001@company.com,John Doe,password123,employee
emp002,emp002@company.com,Jane Smith,password123,employee"
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                data-testid="bulk-import-textarea"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBulkImport} disabled={!bulkData.trim()} data-testid="import-users-btn">
                <Upload className="w-4 h-4 mr-2" />
                Import Users
              </Button>
              <Button variant="outline" onClick={() => {
                setShowBulkImport(false);
                setBulkData('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Single User Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit User' : 'Create New User'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={editingId}
                  placeholder="emp001"
                  data-testid="username-input"
                />
              </div>
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="John Doe"
                  data-testid="fullname-input"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@company.com"
                  data-testid="email-input"
                />
              </div>
              <div>
                <Label>Password {editingId ? '(leave blank to keep current)' : '*'}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  placeholder="Minimum 8 characters"
                  data-testid="password-input"
                />
              </div>
              <div>
                <Label>Role *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  data-testid="role-select"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="purchase_manager">Purchase Manager</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="active-checkbox"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" data-testid="save-user-btn">
                {editingId ? 'Update User' : 'Create User'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Users ({users.length})</h2>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Full Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                      <td className="px-4 py-3 text-sm">{user.full_name}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            data-testid={`edit-user-${user.username}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(user.id)}
                            data-testid={`reset-password-${user.username}`}
                          >
                            <Key className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`delete-user-${user.username}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EnhancedUserManagement;
