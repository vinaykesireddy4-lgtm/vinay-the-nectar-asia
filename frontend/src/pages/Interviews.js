import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    candidate_id: '',
    candidate_name: '',
    job_title: '',
    interview_date: '',
    interview_type: 'video',
    interviewer_id: 'admin',
    interviewer_name: 'Administrator',
    location: '',
    meeting_link: ''
  });

  useEffect(() => {
    fetchInterviews();
    fetchCandidates();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get(`${API}/hr/interviews`);
      setInterviews(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API}/hr/candidates?status=shortlisted`);
      setCandidates(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/hr/interviews`, {
        ...formData,
        interview_date: new Date(formData.interview_date).toISOString()
      });
      toast.success('Interview scheduled!');
      setShowForm(false);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to schedule');
    }
  };

  const updateStatus = async (interviewId, status, feedback = '', rating = 0, result = '') => {
    try {
      await axios.put(`${API}/hr/interviews/${interviewId}`, {
        status,
        feedback,
        rating,
        result
      });
      fetchInterviews();
      toast.success('Interview updated');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Interview Schedule</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Schedule Interview'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Candidate *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.candidate_id}
                  onChange={(e) => {
                    const cand = candidates.find(c => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      candidate_id: e.target.value,
                      candidate_name: cand ? `${cand.first_name} ${cand.last_name}` : '',
                      job_title: cand ? cand.job_title : ''
                    });
                  }}
                  required
                >
                  <option value="">Select Candidate</option>
                  {candidates.map(cand => (
                    <option key={cand.id} value={cand.id}>
                      {cand.first_name} {cand.last_name} - {cand.job_title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Interview Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Interview Type *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.interview_type}
                  onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                >
                  <option value="phone">Phone</option>
                  <option value="video">Video</option>
                  <option value="in_person">In Person</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR Round</option>
                </select>
              </div>
              <div>
                <Label>Interviewer Name</Label>
                <Input
                  value={formData.interviewer_name}
                  onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                />
              </div>
              {(formData.interview_type === 'video' || formData.interview_type === 'phone') && (
                <div className="col-span-2">
                  <Label>Meeting Link</Label>
                  <Input
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}
              {formData.interview_type === 'in_person' && (
                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              )}
            </div>
            <Button type="submit">Schedule Interview</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{interview.candidate_name}</h3>
                <p className="text-sm text-gray-600">{interview.job_title}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(interview.interview_date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{interview.interview_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Interviewer:</span>
                    <span>{interview.interviewer_name}</span>
                  </div>
                  {interview.meeting_link && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="w-4 h-4 text-gray-400" />
                      <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Join Meeting
                      </a>
                    </div>
                  )}
                  {interview.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{interview.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </span>
                {interview.status === 'scheduled' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => updateStatus(interview.id, 'completed')}>
                      Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(interview.id, 'cancelled')}>
                      Cancel
                    </Button>
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

export default Interviews;
