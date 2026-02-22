import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${API}/hr/employees/${id}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!employee) {
    return <div className="text-center py-12">Employee not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/hr/employees')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
        </div>
        <Button onClick={() => navigate(`/hr/employees/edit/${id}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">
                {employee.first_name[0]}{employee.last_name[0]}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-gray-600">{employee.designation}</p>
              <p className="text-sm text-gray-500 mt-1">{employee.employee_code}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(employee.status)}`}>
            {employee.status}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{employee.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{employee.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Employment Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{employee.department_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Date of Joining</p>
                <p className="font-medium">{formatDate(employee.date_of_joining)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Employment Type</p>
                <p className="font-medium capitalize">{employee.employment_type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium capitalize">{employee.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">PAN Number</p>
              <p className="font-medium">{employee.pan_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aadhar Number</p>
              <p className="font-medium">{employee.aadhar_number || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Bank Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">{employee.bank_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-medium">{employee.account_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IFSC Code</p>
              <p className="font-medium">{employee.ifsc_code || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Contact Name</p>
              <p className="font-medium">{employee.emergency_contact_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Number</p>
              <p className="font-medium">{employee.emergency_contact_number || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProfile;