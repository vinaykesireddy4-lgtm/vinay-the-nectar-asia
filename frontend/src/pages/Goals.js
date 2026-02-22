import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    title: '',
    description: '',
    target_date: '',
    assigned_by: 'Administrator'
  });

  useEffect(() => {
    fetchGoals();
    fetchEmployees();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/hr/goals`);
      setGoals(response.data);
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
      await axios.post(`${API}/hr/goals`, {
        ...formData,
        target_date: new Date(formData.target_date).toISOString()
      });
      toast.success('Goal created successfully!');
      setShowForm(false);
      fetchGoals();
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const updateProgress = async (goalId, progress) => {
    try {
      await axios.put(`${API}/hr/goals/${goalId}`, {
        progress_percentage: progress,
        status: progress >= 100 ? 'completed' : 'in_progress'
      });
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Goals & KPIs</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
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
                      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : ''
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
                <Label>Target Date *</Label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Goal Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description *</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Create Goal</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.employee_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-4">{goal.description}</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-semibold">{goal.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600">
                Target: {new Date(goal.target_date).toLocaleDateString()}
              </p>
              {goal.status !== 'completed' && goal.status !== 'cancelled' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateProgress(goal.id, Math.min(goal.progress_percentage + 25, 100))}
                  >
                    +25%
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateProgress(goal.id, 100)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Goals;