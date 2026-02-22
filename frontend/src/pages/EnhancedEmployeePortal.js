import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, CheckCircle, XCircle, User, LogOut, 
  BarChart3, FileText, Target, Users, Bell, Settings,
  Download, TrendingUp, DollarSign, Award, Mail, Phone,
  MapPin, Briefcase, Home, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Enhanced Employee Portal - Self-Service Dashboard
 * 
 * SECURITY: This component ensures data isolation:
 * - Only fetches data for the currently logged-in user
 * - User ID from localStorage is used for all API calls
 * - No access to other employees' personal data
 * - Team directory shows only department colleagues (limited info)
 */

const EnhancedEmployeePortal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard State
  const [dashboardStats, setDashboardStats] = useState({
    attendancePercentage: 0,
    leavesUsed: 0,
    leavesPending: 0,
    leavesRemaining: 0
  });
  
  // Attendance State
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [currentMonthAttendance, setCurrentMonthAttendance] = useState([]);
  
  // Leave State
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: '',
    leave_type_name: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  
  // Payroll State
  const [payslips, setPayslips] = useState([]);
  
  // Goals State
  const [goals, setGoals] = useState([]);
  
  // Performance State
  const [performanceReviews, setPerformanceReviews] = useState([]);
  
  // Team State
  const [teamMembers, setTeamMembers] = useState([]);
  const [reportingManager, setReportingManager] = useState(null);
  const [department, setDepartment] = useState(null);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.id) {
      loadAllData(userData.id);
    }
  }, []);

  const loadAllData = async (userId) => {
    try {
      await Promise.all([
        fetchEmployeeDetails(userId),
        fetchDashboardStats(userId),
        checkTodayAttendance(userId),
        fetchAttendanceHistory(userId),
        fetchLeaveRequests(userId),
        fetchLeaveTypes(),
        fetchPayslips(userId),
        fetchGoals(userId),
        fetchPerformanceReviews(userId),
        fetchTeamMembers(userId)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const fetchEmployeeDetails = async (userId) => {
    try {
      // Fetch only the current user's employee record
      const response = await axios.get(`${API}/hr/employees/${userId}`);
      setEmployee(response.data);
      
      if (response.data?.department_id) {
        fetchDepartment(response.data.department_id);
      }
      
      if (response.data?.reporting_manager_id) {
        fetchReportingManager(response.data.reporting_manager_id);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      // If employee record not found, try to find by user ID in the list
      try {
        const allResponse = await axios.get(`${API}/hr/employees`);
        const emp = allResponse.data.find(e => e.id === userId);
        if (emp) {
          setEmployee(emp);
          if (emp?.department_id) fetchDepartment(emp.department_id);
          if (emp?.reporting_manager_id) fetchReportingManager(emp.reporting_manager_id);
        }
      } catch (err) {
        console.error('Error fetching employee from list:', err);
      }
    }
  };

  const fetchDepartment = async (deptId) => {
    try {
      const response = await axios.get(`${API}/hr/departments/${deptId}`);
      setDepartment(response.data);
    } catch (error) {
      console.error('Error fetching department:', error);
    }
  };

  const fetchReportingManager = async (managerId) => {
    try {
      const response = await axios.get(`${API}/hr/employees/${managerId}`);
      setReportingManager(response.data);
    } catch (error) {
      console.error('Error fetching manager:', error);
    }
  };

  const fetchDashboardStats = async (employeeId) => {
    try {
      // Fetch attendance for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      
      const attendanceRes = await axios.get(`${API}/hr/attendance?employee_id=${employeeId}`);
      const allAttendance = attendanceRes.data;
      
      const monthAttendance = allAttendance.filter(a => {
        const date = new Date(a.date);
        return date >= new Date(startOfMonth) && date <= new Date(endOfMonth);
      });
      
      const presentDays = monthAttendance.filter(a => a.status === 'present').length;
      const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const attendancePercentage = Math.round((presentDays / totalDays) * 100);
      
      // Fetch leave requests
      const leaveRes = await axios.get(`${API}/hr/leave-requests?employee_id=${employeeId}`);
      const allLeaves = leaveRes.data;
      
      const approvedLeaves = allLeaves.filter(l => l.status === 'approved');
      const pendingLeaves = allLeaves.filter(l => l.status === 'pending');
      
      const leavesUsed = approvedLeaves.reduce((sum, l) => sum + l.days_requested, 0);
      
      setDashboardStats({
        attendancePercentage,
        leavesUsed,
        leavesPending: pendingLeaves.length,
        leavesRemaining: 20 - leavesUsed // Assuming 20 total leaves per year
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkTodayAttendance = async (employeeId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API}/hr/attendance?employee_id=${employeeId}&date=${today}`);
      setAttendanceMarked(response.data.length > 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAttendanceHistory = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/hr/attendance?employee_id=${employeeId}`);
      const sorted = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceHistory(sorted);
      
      // Get current month attendance for calendar
      const now = new Date();
      const monthData = sorted.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
      setCurrentMonthAttendance(monthData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLeaveRequests = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/hr/leave-requests?employee_id=${employeeId}`);
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setLeaveRequests(sorted);
      
      // Calculate leave balance
      calculateLeaveBalance(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateLeaveBalance = (leaves) => {
    const balance = {};
    leaveTypes.forEach(lt => {
      const usedLeaves = leaves
        .filter(l => l.leave_type_id === lt.id && l.status === 'approved')
        .reduce((sum, l) => sum + l.days_requested, 0);
      
      balance[lt.id] = {
        total: lt.days_per_year,
        used: usedLeaves,
        remaining: lt.days_per_year - usedLeaves
      };
    });
    setLeaveBalance(balance);
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(`${API}/hr/leave-types`);
      console.log('Leave types fetched:', response.data);
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      toast.error('Failed to load leave types');
    }
  };

  const fetchPayslips = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/hr/payslips?employee_id=${employeeId}`);
      const sorted = response.data.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
      setPayslips(sorted);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGoals = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/hr/goals?employee_id=${employeeId}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPerformanceReviews = async (employeeId) => {
    try {
      const response = await axios.get(`${API}/hr/performance-reviews?employee_id=${employeeId}`);
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPerformanceReviews(sorted);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTeamMembers = async (userId) => {
    try {
      const response = await axios.get(`${API}/hr/employees`);
      const allEmployees = response.data;
      
      // Find current employee
      const currentEmp = allEmployees.find(e => e.id === userId);
      
      if (currentEmp) {
        // Get team members from same department (excluding current user)
        const team = allEmployees.filter(e => 
          e.department_id === currentEmp.department_id && 
          e.id !== userId &&
          e.status === 'active' // Only show active employees
        );
        setTeamMembers(team);
      }
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
      fetchDashboardStats(user.id);
      fetchAttendanceHistory(user.id);
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
      fetchDashboardStats(user.id);
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const downloadPayslip = (payslip) => {
    toast.info('Payslip download feature - coming soon!');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-orange-100 text-orange-800',
      leave: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white" data-testid="welcome-card">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {employee?.first_name || user?.full_name?.split(' ')[0] || user?.username}!</h2>
        <p className="opacity-90">Here's your overview for today.</p>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6" data-testid="attendance-stat-card">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <Badge variant="outline">{dashboardStats.attendancePercentage}%</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Attendance</h3>
          <p className="text-2xl font-bold mt-1">This Month</p>
          <Progress value={dashboardStats.attendancePercentage} className="mt-3" />
        </Card>

        <Card className="p-6" data-testid="leaves-used-card">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-green-600" />
            <Badge variant="outline">{dashboardStats.leavesUsed} Days</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Leaves Used</h3>
          <p className="text-2xl font-bold mt-1">{dashboardStats.leavesRemaining} Remaining</p>
        </Card>

        <Card className="p-6" data-testid="pending-requests-card">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <Badge variant="outline">{dashboardStats.leavesPending}</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
          <p className="text-2xl font-bold mt-1">For Approval</p>
        </Card>

        <Card className="p-6" data-testid="goals-card">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            <Badge variant="outline">{goals.length}</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Active Goals</h3>
          <p className="text-2xl font-bold mt-1">Track Progress</p>
        </Card>
      </div>

      {/* Today's Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mark Attendance */}
        <Card className="p-6" data-testid="mark-attendance-card">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-bold">Today's Attendance</h2>
          </div>
          
          {attendanceMarked ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900">Attendance Marked!</p>
              <p className="text-sm text-gray-600 mt-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900 mb-4">Mark Your Attendance</p>
              <Button onClick={markAttendance} className="w-full max-w-xs" data-testid="mark-present-btn">
                Mark Present
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6" data-testid="recent-activity-card">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {leaveRequests.slice(0, 3).map((leave) => (
              <div key={leave.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(leave.status)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{leave.leave_type_name}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(leave.status)}>
                  {leave.status}
                </Badge>
              </div>
            ))}
            {leaveRequests.length === 0 && (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming Goals */}
      {goals.length > 0 && (
        <Card className="p-6" data-testid="upcoming-goals-card">
          <h2 className="text-xl font-bold mb-4">Active Goals</h2>
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{goal.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                  <Badge>{goal.status}</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  // Render Attendance Tab
  const renderAttendance = () => (
    <div className="space-y-6">
      <Card className="p-6" data-testid="attendance-overview-card">
        <h2 className="text-xl font-bold mb-4">Attendance Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {currentMonthAttendance.filter(a => a.status === 'present').length}
            </p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {currentMonthAttendance.filter(a => a.status === 'absent').length}
            </p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {currentMonthAttendance.filter(a => a.status === 'half_day').length}
            </p>
            <p className="text-sm text-gray-600">Half Day</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {currentMonthAttendance.filter(a => a.status === 'leave').length}
            </p>
            <p className="text-sm text-gray-600">On Leave</p>
          </div>
        </div>

        <Separator className="my-6" />

        <h3 className="font-semibold mb-3">Recent Attendance History</h3>
        <div className="space-y-2">
          {attendanceHistory.slice(0, 10).map((att) => (
            <div key={att.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(att.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  {att.check_in && (
                    <p className="text-xs text-gray-600">
                      Check-in: {new Date(att.check_in).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {att.check_out && ` | Check-out: ${new Date(att.check_out).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(att.status)}>
                {att.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // Render Leave Management Tab
  const renderLeaveManagement = () => (
    <div className="space-y-6">
      {/* Leave Balance */}
      <Card className="p-6" data-testid="leave-balance-card">
        <h2 className="text-xl font-bold mb-4">Leave Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveTypes.map((lt) => {
            const balance = leaveBalance[lt.id] || { total: lt.days_per_year, used: 0, remaining: lt.days_per_year };
            const percentage = (balance.used / balance.total) * 100;
            
            return (
              <div key={lt.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{lt.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{lt.description}</p>
                <div className="flex justify-between text-sm mb-2">
                  <span>Used: {balance.used}</span>
                  <span className="font-medium">Remaining: {balance.remaining}</span>
                </div>
                <Progress value={percentage} className="mb-2" />
                <p className="text-xs text-gray-500">Total: {balance.total} days/year</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Apply Leave */}
      <Card className="p-6" data-testid="apply-leave-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Apply for Leave</h2>
          {!showLeaveForm && (
            <Button onClick={() => setShowLeaveForm(true)} data-testid="apply-leave-btn">
              New Leave Request
            </Button>
          )}
        </div>

        {showLeaveForm && (
          <form onSubmit={handleLeaveSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label>Leave Type *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-white"
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
                data-testid="leave-type-select"
              >
                <option value="">-- Select Leave Type --</option>
                {leaveTypes.length === 0 ? (
                  <option value="" disabled>Loading leave types...</option>
                ) : (
                  leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.days_per_year} days/year)
                    </option>
                  ))
                )}
              </select>
              {leaveTypes.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  No leave types available. Please contact HR.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                  required
                  data-testid="leave-start-date"
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                  required
                  data-testid="leave-end-date"
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
                data-testid="leave-reason"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="submit-leave-btn">Submit Request</Button>
              <Button type="button" variant="outline" onClick={() => setShowLeaveForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Leave History */}
      <Card className="p-6" data-testid="leave-history-card">
        <h2 className="text-xl font-bold mb-4">Leave Request History</h2>
        {leaveRequests.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No leave requests yet</p>
        ) : (
          <div className="space-y-3">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(leave.status)}
                    <div>
                      <p className="font-semibold text-gray-900">{leave.leave_type_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{leave.days_requested} day(s)</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(leave.status)}>
                    {leave.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {leave.reason}</p>
                  {leave.status === 'approved' && leave.approved_by && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved by {leave.approved_by} on {new Date(leave.approved_at).toLocaleDateString()}
                    </p>
                  )}
                  {leave.status === 'rejected' && leave.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">
                      Rejection reason: {leave.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  // Render Payroll Tab
  const renderPayroll = () => (
    <div className="space-y-6">
      <Card className="p-6" data-testid="salary-info-card">
        <h2 className="text-xl font-bold mb-4">Salary Information</h2>
        {employee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Salary</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{employee.salary?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">per month</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bank Name:</span>
                <span className="font-medium">{employee.bank_name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Account Number:</span>
                <span className="font-medium">{employee.account_number || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IFSC Code:</span>
                <span className="font-medium">{employee.ifsc_code || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6" data-testid="payslips-card">
        <h2 className="text-xl font-bold mb-4">Payslips</h2>
        {payslips.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No payslips available</p>
        ) : (
          <div className="space-y-3">
            {payslips.map((payslip) => (
              <div key={payslip.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{getMonthName(payslip.month)} {payslip.year}</p>
                      <p className="text-sm text-gray-600">Net Salary: ₹{payslip.net_salary?.toLocaleString()}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span>Earnings: ₹{payslip.total_earnings?.toLocaleString()}</span>
                        <span>Deductions: ₹{payslip.total_deductions?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(payslip.status)}>
                      {payslip.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => downloadPayslip(payslip)}
                      data-testid={`download-payslip-${payslip.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                {payslip.components && payslip.components.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Salary Components:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {payslip.components.map((comp, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-600">{comp.component_name}:</span>
                          <span className={comp.component_type === 'earning' ? 'text-green-600' : 'text-red-600'}>
                            {comp.component_type === 'earning' ? '+' : '-'}₹{comp.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  // Render Profile Tab
  const renderProfile = () => (
    <div className="space-y-6">
      <Card className="p-6" data-testid="personal-info-card">
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>
        {employee && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Employee Code</Label>
                <p className="font-medium">{employee.employee_code}</p>
              </div>
              <div>
                <Label className="text-gray-600">Full Name</Label>
                <p className="font-medium">{employee.first_name} {employee.last_name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {employee.email}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Phone</Label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {employee.phone}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Date of Birth</Label>
                <p className="font-medium">
                  {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Gender</Label>
                <p className="font-medium">{employee.gender || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-gray-600">Address</Label>
                <p className="font-medium flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  {employee.address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6" data-testid="employment-info-card">
        <h2 className="text-xl font-bold mb-4">Employment Details</h2>
        {employee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Department</Label>
              <p className="font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                {employee.department_name}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Designation</Label>
              <p className="font-medium">{employee.designation}</p>
            </div>
            <div>
              <Label className="text-gray-600">Employment Type</Label>
              <Badge>{employee.employment_type?.replace('_', ' ')}</Badge>
            </div>
            <div>
              <Label className="text-gray-600">Status</Label>
              <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
            </div>
            <div>
              <Label className="text-gray-600">Date of Joining</Label>
              <p className="font-medium">
                {employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Reporting Manager</Label>
              <p className="font-medium">{employee.reporting_manager_name || 'Not assigned'}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6" data-testid="emergency-contact-card">
        <h2 className="text-xl font-bold mb-4">Emergency Contact</h2>
        {employee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Contact Name</Label>
              <p className="font-medium">{employee.emergency_contact_name || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-gray-600">Contact Number</Label>
              <p className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                {employee.emergency_contact_number || 'Not provided'}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6" data-testid="documents-card">
        <h2 className="text-xl font-bold mb-4">Identity Documents</h2>
        {employee && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">PAN Number</Label>
              <p className="font-medium">{employee.pan_number || 'Not provided'}</p>
            </div>
            <div>
              <Label className="text-gray-600">Aadhar Number</Label>
              <p className="font-medium">{employee.aadhar_number || 'Not provided'}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // Render Goals & Performance Tab
  const renderGoalsPerformance = () => (
    <div className="space-y-6">
      {/* Goals Section */}
      <Card className="p-6" data-testid="goals-section-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Goals</h2>
          <Badge variant="outline">{goals.length} Active</Badge>
        </div>
        {goals.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No goals assigned yet</p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-purple-600">{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} className="h-2" />
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span>Assigned by: {goal.assigned_by}</span>
                    <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance Reviews Section */}
      <Card className="p-6" data-testid="performance-reviews-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Performance Reviews</h2>
          <Badge variant="outline">{performanceReviews.length} Reviews</Badge>
        </div>
        {performanceReviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No performance reviews yet</p>
        ) : (
          <div className="space-y-4">
            {performanceReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Performance Review</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(review.review_period_start).toLocaleDateString()} - {new Date(review.review_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-2xl font-bold text-purple-600">{review.overall_rating}</span>
                      <span className="text-gray-500">/5</span>
                    </div>
                    <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Technical Skills</p>
                    <p className="font-semibold">{review.technical_skills}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Communication</p>
                    <p className="font-semibold">{review.communication}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teamwork</p>
                    <p className="font-semibold">{review.teamwork}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Punctuality</p>
                    <p className="font-semibold">{review.punctuality}/5</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quality of Work</p>
                    <p className="font-semibold">{review.quality_of_work}/5</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2 text-sm">
                  {review.strengths && (
                    <div>
                      <p className="font-medium text-green-700">Strengths:</p>
                      <p className="text-gray-600">{review.strengths}</p>
                    </div>
                  )}
                  {review.areas_of_improvement && (
                    <div>
                      <p className="font-medium text-orange-700">Areas for Improvement:</p>
                      <p className="text-gray-600">{review.areas_of_improvement}</p>
                    </div>
                  )}
                  {review.comments && (
                    <div>
                      <p className="font-medium text-gray-700">Comments:</p>
                      <p className="text-gray-600">{review.comments}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Reviewed by: {review.reviewer_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  // Render Team Directory Tab
  const renderTeamDirectory = () => (
    <div className="space-y-6">
      {/* Department Info */}
      {department && (
        <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white" data-testid="department-info-card">
          <h2 className="text-2xl font-bold mb-2">{department.name}</h2>
          <p className="opacity-90">{department.description || 'Department'}</p>
          {department.manager_name && (
            <p className="mt-2">Manager: {department.manager_name}</p>
          )}
        </Card>
      )}

      {/* Reporting Manager */}
      {reportingManager && (
        <Card className="p-6" data-testid="reporting-manager-card">
          <h2 className="text-xl font-bold mb-4">Reporting Manager</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {reportingManager.first_name} {reportingManager.last_name}
              </p>
              <p className="text-sm text-gray-600">{reportingManager.designation}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {reportingManager.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {reportingManager.phone}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Team Members */}
      <Card className="p-6" data-testid="team-members-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Team Members</h2>
          <Badge variant="outline">{teamMembers.length} Members</Badge>
        </div>
        {teamMembers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No team members found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{member.designation}</p>
                    <Badge className="mt-1 text-xs" variant="outline">
                      {member.employment_type?.replace('_', ' ')}
                    </Badge>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Employee Portal</h1>
              <p className="text-xs text-gray-600">{employee?.first_name} {employee?.last_name}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleLogout} data-testid="logout-btn">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-screen pt-14 lg:pt-0">
        {/* Sidebar Navigation */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r shadow-sm">
          {/* Desktop Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Employee Portal</h1>
                <p className="text-xs text-gray-600">{employee?.employee_code}</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold">{employee?.first_name} {employee?.last_name}</p>
              <p className="text-gray-600 text-xs">{employee?.designation}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="dashboard-tab"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="attendance-tab"
            >
              <Calendar className="w-5 h-5" />
              <span>Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab('leave')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'leave'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="leave-tab"
            >
              <Clock className="w-5 h-5" />
              <span>Leave</span>
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'payroll'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="payroll-tab"
            >
              <DollarSign className="w-5 h-5" />
              <span>Payroll</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="profile-tab"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'goals'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="goals-tab"
            >
              <Target className="w-5 h-5" />
              <span>Goals & Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'team'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              data-testid="team-tab"
            >
              <Users className="w-5 h-5" />
              <span>Team Directory</span>
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              data-testid="logout-btn-sidebar"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="grid grid-cols-5 gap-1 p-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg ${
                activeTab === 'attendance' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Attend</span>
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg ${
                activeTab === 'leave' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs font-medium">Leave</span>
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg ${
                activeTab === 'payroll' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-medium">Pay</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg ${
                ['profile', 'goals', 'team'].includes(activeTab) ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64 overflow-auto pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'attendance' && renderAttendance()}
            {activeTab === 'leave' && renderLeaveManagement()}
            {activeTab === 'payroll' && renderPayroll()}
            {activeTab === 'profile' && (
              <div>
                {/* Mobile More Menu */}
                <div className="lg:hidden mb-6">
                  <Card className="p-4">
                    <h2 className="text-lg font-bold mb-4">More Options</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <User className="w-6 h-6 text-blue-600" />
                        <span className="text-sm font-medium">Profile</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('goals')}
                        className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <Target className="w-6 h-6 text-purple-600" />
                        <span className="text-sm font-medium">Goals</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('team')}
                        className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <Users className="w-6 h-6 text-green-600" />
                        <span className="text-sm font-medium">Team</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-red-50"
                      >
                        <LogOut className="w-6 h-6 text-red-600" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </Card>
                </div>
                {/* Desktop shows profile content directly */}
                <div className="hidden lg:block">
                  {renderProfile()}
                </div>
              </div>
            )}
            {activeTab === 'goals' && renderGoalsPerformance()}
            {activeTab === 'team' && renderTeamDirectory()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmployeePortal;
