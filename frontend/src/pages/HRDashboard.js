import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, Calendar, UserCheck, TrendingUp, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HRDashboard = () => {
  const [stats, setStats] = useState({
    total_employees: 0,
    total_departments: 0,
    pending_leaves: 0,
    active_job_postings: 0,
    total_candidates: 0,
    present_today: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/hr/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.total_employees,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Departments',
      value: stats.total_departments,
      icon: Briefcase,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Present Today',
      value: stats.present_today,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Leaves',
      value: stats.pending_leaves,
      icon: Calendar,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Active Job Postings',
      value: stats.active_job_postings,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Total Candidates',
      value: stats.total_candidates,
      icon: FileText,
      color: 'bg-pink-500',
      textColor: 'text-pink-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/hr/employees/add'}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Add Employee</h3>
            <p className="text-sm text-gray-600">Create new employee record</p>
          </button>
          <button
            onClick={() => window.location.href = '/hr/attendance/mark'}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
          >
            <UserCheck className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
            <p className="text-sm text-gray-600">Record daily attendance</p>
          </button>
          <button
            onClick={() => window.location.href = '/hr/leave/approvals'}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
          >
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Leave Approvals</h3>
            <p className="text-sm text-gray-600">Review pending requests</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default HRDashboard;