import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AttendanceReport = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [selectedEmployee, selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/hr/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = `${API}/hr/attendance?date=${selectedMonth}`;
      if (selectedEmployee) {
        url += `&employee_id=${selectedEmployee}`;
      }
      const response = await axios.get(url);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800',
      holiday: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const halfDay = attendanceRecords.filter(r => r.status === 'half_day').length;
    const leave = attendanceRecords.filter(r => r.status === 'leave').length;
    
    return { present, absent, halfDay, leave, total: attendanceRecords.length };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Attendance Reports</h1>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Employee</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Total Days</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Half Day</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.halfDay}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">On Leave</p>
          <p className="text-2xl font-bold text-blue-600">{stats.leave}</p>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Employee</th>
                <th className="text-left py-3 px-4">Check In</th>
                <th className="text-left py-3 px-4">Check Out</th>
                <th className="text-left py-3 px-4">Work Hours</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{record.employee_name}</td>
                  <td className="py-3 px-4">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}
                  </td>
                  <td className="py-3 px-4">{record.work_hours} hrs</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendanceRecords.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No attendance records found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttendanceReport;