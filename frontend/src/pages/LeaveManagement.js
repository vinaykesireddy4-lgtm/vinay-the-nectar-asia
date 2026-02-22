import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    leave_type_id: '',
    leave_type_name: '',
    start_date: '',
    end_date: '',
    days_requested: 1,
    reason: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
    fetchEmployees();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${API}/hr/leave-requests`);
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(`${API}/hr/leave-types`);
      setLeaveTypes(response.data);
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
      await axios.post(`${API}/hr/leave-requests`, {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      });
      toast.success('Leave request submitted!');
      setShowForm(false);
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API}/hr/leave-requests/${id}/approve`, { approved_by: 'HR Manager' });
      toast.success('Leave approved');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await axios.put(`${API}/hr/leave-requests/${id}/reject`, { rejection_reason: reason });
        toast.success('Leave rejected');
        fetchLeaveRequests();
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Leave Management</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Leave Request'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={(e) => {
                    const emp = employees.find(e => e.id === e.target.value);
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
                <Label>Leave Type</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={(e) => {
                    const lt = leaveTypes.find(l => l.id === e.target.value);
                    setFormData({
                      ...formData,
                      leave_type_id: e.target.value,
                      leave_type_name: lt ? lt.name : ''
                    });
                  }}
                  required
                >
                  <option value="">Select Type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Reason</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit">Submit Request</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {leaveRequests.map((leave) => (
          <Card key={leave.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{leave.employee_name}</h3>
                <p className="text-sm text-gray-600">{leave.leave_type_name}</p>
                <p className="text-sm mt-2">
                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">{leave.days_requested} days</p>
                <p className="mt-2">{leave.reason}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(leave.status)}`}>
                  {leave.status}
                </span>
                {leave.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => handleApprove(leave.id)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(leave.id)}>Reject</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeaveManagement;
