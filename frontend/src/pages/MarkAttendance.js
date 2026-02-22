import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MarkAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/hr/employees`);
      const activeEmployees = response.data.filter(emp => emp.status === 'active');
      setEmployees(activeEmployees);
      
      // Initialize attendance status
      const initialAttendance = {};
      activeEmployees.forEach(emp => {
        initialAttendance[emp.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleStatusChange = (employeeId, status) => {
    setAttendance(prev => ({ ...prev, [employeeId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = employees.map(emp => {
        const attendanceData = {
          employee_id: emp.id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          date: new Date(selectedDate).toISOString(),
          status: attendance[emp.id] || 'absent',
          work_hours: attendance[emp.id] === 'present' ? 8 : attendance[emp.id] === 'half_day' ? 4 : 0
        };
        return axios.post(`${API}/hr/attendance`, attendanceData);
      });

      await Promise.all(promises);
      toast.success('Attendance marked successfully!');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800 border-green-300',
      absent: 'bg-red-100 text-red-800 border-red-300',
      half_day: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      leave: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {emp.first_name} {emp.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{emp.employee_code} - {emp.designation}</p>
                </div>
                <div className="flex gap-2">
                  {['present', 'absent', 'half_day', 'leave'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(emp.id, status)}
                      className={`px-4 py-2 rounded-md border-2 transition-all capitalize ${
                        attendance[emp.id] === status
                          ? getStatusColor(status)
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default MarkAttendance;
