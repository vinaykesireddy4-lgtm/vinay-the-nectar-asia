import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Plus, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    department_id: '',
    department_name: '',
    job_description: '',
    requirements: '',
    experience_required: '',
    salary_range: '',
    employment_type: 'full_time',
    location: '',
    closing_date: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/hr/job-postings`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API}/hr/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        closing_date: formData.closing_date ? new Date(formData.closing_date).toISOString() : null
      };
      await axios.post(`${API}/hr/job-postings`, payload);
      toast.success('Job posted successfully!');
      setShowForm(false);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const updateStatus = async (jobId, status) => {
    try {
      await axios.put(`${API}/hr/job-postings/${jobId}`, { status });
      fetchJobs();
      toast.success(`Job ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Job Postings</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Post New Job'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title *</Label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Department *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.department_id}
                  onChange={(e) => {
                    const dept = departments.find(d => d.id === e.target.value);
                    setFormData({
                      ...formData,
                      department_id: e.target.value,
                      department_name: dept ? dept.name : ''
                    });
                  }}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Experience Required *</Label>
                <Input
                  value={formData.experience_required}
                  onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                  placeholder="e.g., 3-5 years"
                  required
                />
              </div>
              <div>
                <Label>Salary Range</Label>
                <Input
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  placeholder="e.g., 5-8 LPA"
                />
              </div>
              <div>
                <Label>Employment Type</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Closing Date</Label>
                <Input
                  type="date"
                  value={formData.closing_date}
                  onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Job Description *</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="4"
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Requirements *</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="4"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Post Job</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl">{job.job_title}</h3>
                <p className="text-sm text-gray-600">{job.department_name} • {job.location}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Experience: {job.experience_required} | {job.salary_range}
                </p>
                <p className="mt-3 text-gray-700">{job.job_description}</p>
                <div className="mt-3">
                  <p className="font-semibold text-sm">Requirements:</p>
                  <p className="text-sm text-gray-600">{job.requirements}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Posted: {new Date(job.posted_date).toLocaleDateString()}
                  {job.closing_date && ` | Closes: ${new Date(job.closing_date).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
                {job.status === 'active' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, 'closed')}>
                    Close
                  </Button>
                )}
                {job.status === 'closed' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, 'active')}>
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobPostings;
