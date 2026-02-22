import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Payroll = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: 0,
    components: []
  });
  const [newComponent, setNewComponent] = useState({
    component_name: '',
    component_type: 'earning',
    amount: 0
  });

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, []);

  const fetchPayslips = async () => {
    try {
      const response = await axios.get(`${API}/hr/payslips`);
      setPayslips(response.data);
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

  const addComponent = () => {
    if (newComponent.component_name && newComponent.amount) {
      setFormData({
        ...formData,
        components: [...formData.components, { ...newComponent }]
      });
      setNewComponent({ component_name: '', component_type: 'earning', amount: 0 });
    }
  };

  const removeComponent = (index) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/hr/payslips`, formData);
      toast.success('Payslip generated successfully!');
      setShowForm(false);
      fetchPayslips();
      setFormData({
        employee_id: '',
        employee_name: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basic_salary: 0,
        components: []
      });
    } catch (error) {
      toast.error('Failed to generate payslip');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      processed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800'
    };
    return colors[status] || '';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Payroll Management</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Generate Payslip'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Generate Payslip</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.employee_id}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === e.target.value);
                    setFormData({
                      ...formData,
                      employee_id: e.target.value,
                      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : '',
                      basic_salary: emp ? emp.salary : 0
                    });
                  }}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Basic Salary *</Label>
                <Input
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Month *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  required
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{monthNames[m-1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* Add Components */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Salary Components</h3>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <Input
                  placeholder="Component Name"
                  value={newComponent.component_name}
                  onChange={(e) => setNewComponent({ ...newComponent, component_name: e.target.value })}
                />
                <select
                  className="px-3 py-2 border rounded-md"
                  value={newComponent.component_type}
                  onChange={(e) => setNewComponent({ ...newComponent, component_type: e.target.value })}
                >
                  <option value="earning">Earning</option>
                  <option value="deduction">Deduction</option>
                </select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newComponent.amount}
                  onChange={(e) => setNewComponent({ ...newComponent, amount: parseFloat(e.target.value) })}
                />
                <Button type="button" onClick={addComponent}>Add</Button>
              </div>
              
              {formData.components.length > 0 && (
                <div className="space-y-2">
                  {formData.components.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>{comp.component_name}</span>
                      <span className={comp.component_type === 'earning' ? 'text-green-600' : 'text-red-600'}>
                        {comp.component_type === 'earning' ? '+' : '-'} ₹{comp.amount}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeComponent(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit">Generate Payslip</Button>
          </form>
        </Card>
      )}

      {/* Payslips List */}
      <div className="space-y-4">
        {payslips.map((payslip) => (
          <Card key={payslip.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{payslip.employee_name}</h3>
                <p className="text-sm text-gray-600">
                  {monthNames[payslip.month - 1]} {payslip.year}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-lg font-semibold text-green-600">₹{payslip.total_earnings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Deductions</p>
                    <p className="text-lg font-semibold text-red-600">₹{payslip.total_deductions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Salary</p>
                    <p className="text-lg font-semibold text-blue-600">₹{payslip.net_salary}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(payslip.status)}`}>
                  {payslip.status}
                </span>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Payroll;