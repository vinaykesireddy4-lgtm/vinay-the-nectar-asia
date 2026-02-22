import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, XCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmployeePortal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: '',
    leave_type_name: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.id) {
      checkTodayAttendance(userData.id);
      fetchLeaveRequests(userData.id);
      fetchLeaveTypes();
    }
  }, []);

  const checkTodayAttendance = async (employeeId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API}/hr/attendance?employee_id=${employeeId}&date=${today}`);
      setAttendanceMarked(response.data.length > 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLeaveRequests = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/hr/leave-requests?employee_id=${employeeId}`);
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

  const markAttendance = async () => {
    if (!user || !user.id) return;
    
    try {
      const now = new Date();
      await axios.post(`${API}/hr/attendance`, {
        employee_id: user.id,
        employee_name: user.full_name || user.username,
        date: now.toISOString(),
        check_in: now.toISOString(),
        status: 'present',
        work_hours: 8,
        notes: 'Self marked'
      });
      setAttendanceMarked(true);
      toast.success('Attendance marked successfully!');
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;

    try {
      const startDate = new Date(leaveForm.start_date);
      const endDate = new Date(leaveForm.end_date);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      await axios.post(`${API}/hr/leave-requests`, {
        employee_id: user.id,
        employee_name: user.full_name || user.username,
        leave_type_id: leaveForm.leave_type_id,
        leave_type_name: leaveForm.leave_type_name,
        start_date: new Date(leaveForm.start_date).toISOString(),
        end_date: new Date(leaveForm.end_date).toISOString(),
        days_requested: days,
        reason: leaveForm.reason
      });
      
      toast.success('Leave request submitted successfully!');
      setShowLeaveForm(false);
      setLeaveForm({
        leave_type_id: '',
        leave_type_name: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      fetchLeaveRequests(user.id);
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || '';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Employee Portal</h1>
              <p className="text-sm text-gray-600">{user?.full_name || user?.username}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Card */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0] || user?.username}!</h2>
          <p className="opacity-90">Mark your attendance and manage your leaves from here.</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-bold">Today's Attendance</h2>
            </div>
            
            {attendanceMarked ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900">Attendance Marked!</p>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-4">Mark Your Attendance</p>
                <p className="text-sm text-gray-600 mb-6">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <Button onClick={markAttendance} className="w-full max-w-xs">
                  Mark Present
                </Button>
              </div>
            )}
          </Card>

          {/* Apply Leave Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
              <h2 className="text-xl font-bold">Apply for Leave</h2>
            </div>

            {!showLeaveForm ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">Need time off? Submit a leave request here.</p>
                <Button onClick={() => setShowLeaveForm(true)} className="w-full max-w-xs">
                  Apply for Leave
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <Label>Leave Type *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={leaveForm.leave_type_id}
                    onChange={(e) => {
                      const lt = leaveTypes.find(l => l.id === e.target.value);
                      setLeaveForm({
                        ...leaveForm,
                        leave_type_id: e.target.value,
                        leave_type_name: lt ? lt.name : ''
                      });
                    }}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={leaveForm.start_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={leaveForm.end_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Reason *</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setShowLeaveForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Leave Requests History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">My Leave Requests</h2>
          {leaveRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No leave requests yet</p>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((leave) => (
                <div key={leave.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(leave.status)}
                    <div>
                      <p className="font-semibold text-gray-900">{leave.leave_type_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{leave.days_requested} day(s)</p>
                      <p className="text-sm text-gray-700 mt-1">{leave.reason}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(leave.status)}`}>
                    {leave.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmployeePortal;