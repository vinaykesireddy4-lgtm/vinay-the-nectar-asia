import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Filter, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [selectedJob, selectedStatus]);

  const fetchCandidates = async () => {
    try {
      let url = `${API}/hr/candidates?`;
      if (selectedJob) url += `job_posting_id=${selectedJob}&`;
      if (selectedStatus) url += `status=${selectedStatus}`;
      const response = await axios.get(url);
      setCandidates(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/hr/job-postings?status=active`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateStatus = async (candidateId, status) => {
    try {
      await axios.put(`${API}/hr/candidates/${candidateId}`, { status });
      fetchCandidates();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interview_scheduled: 'bg-yellow-100 text-yellow-800',
      interviewed: 'bg-indigo-100 text-indigo-800',
      offered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-teal-100 text-teal-800'
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Candidates</h1>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-2 gap-4">
            <select
              className="px-3 py-2 border rounded-md"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">All Job Postings</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.job_title}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interviewed">Interviewed</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {candidate.first_name} {candidate.last_name}
                </h3>
                <p className="text-sm text-gray-600">{candidate.job_title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {candidate.phone}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">Current CTC:</span>
                    <span className="font-medium ml-1">₹{candidate.current_ctc}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected CTC:</span>
                    <span className="font-medium ml-1">₹{candidate.expected_ctc}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Notice Period:</span>
                    <span className="font-medium ml-1">{candidate.notice_period}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Applied: {new Date(candidate.applied_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(candidate.status)}`}>
                  {candidate.status.replace('_', ' ')}
                </span>
                <select
                  className="text-sm px-2 py-1 border rounded"
                  value={candidate.status}
                  onChange={(e) => updateStatus(candidate.id, e.target.value)}
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
                {candidate.resume_url && (
                  <Button size="sm" variant="outline">View Resume</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Candidates;
