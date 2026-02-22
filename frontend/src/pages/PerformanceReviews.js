import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    review_period_start: '',
    review_period_end: '',
    reviewer_id: 'admin',
    reviewer_name: 'Administrator',
    overall_rating: 0,
    technical_skills: 0,
    communication: 0,
    teamwork: 0,
    punctuality: 0,
    quality_of_work: 0,
    strengths: '',
    areas_of_improvement: '',
    comments: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchEmployees();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/hr/performance-reviews`);
      setReviews(response.data);
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
      const payload = {
        ...formData,
        review_period_start: new Date(formData.review_period_start).toISOString(),
        review_period_end: new Date(formData.review_period_end).toISOString(),
        overall_rating: parseFloat(formData.overall_rating),
        technical_skills: parseFloat(formData.technical_skills),
        communication: parseFloat(formData.communication),
        teamwork: parseFloat(formData.teamwork),
        punctuality: parseFloat(formData.punctuality),
        quality_of_work: parseFloat(formData.quality_of_work)
      };
      await axios.post(`${API}/hr/performance-reviews`, payload);
      toast.success('Performance review created!');
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to create review');
    }
  };

  const RatingStars = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Performance Reviews</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Review'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.employee_id}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.id === e.target.value);
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
                <Label>Overall Rating (1-5) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.overall_rating}
                  onChange={(e) => setFormData({ ...formData, overall_rating: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Review Period Start *</Label>
                <Input
                  type="date"
                  value={formData.review_period_start}
                  onChange={(e) => setFormData({ ...formData, review_period_start: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Review Period End *</Label>
                <Input
                  type="date"
                  value={formData.review_period_end}
                  onChange={(e) => setFormData({ ...formData, review_period_end: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Technical Skills (1-5)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.technical_skills}
                  onChange={(e) => setFormData({ ...formData, technical_skills: e.target.value })}
                />
              </div>
              <div>
                <Label>Communication (1-5)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.communication}
                  onChange={(e) => setFormData({ ...formData, communication: e.target.value })}
                />
              </div>
              <div>
                <Label>Teamwork (1-5)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.teamwork}
                  onChange={(e) => setFormData({ ...formData, teamwork: e.target.value })}
                />
              </div>
              <div>
                <Label>Punctuality (1-5)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.punctuality}
                  onChange={(e) => setFormData({ ...formData, punctuality: e.target.value })}
                />
              </div>
              <div>
                <Label>Quality of Work (1-5)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.quality_of_work}
                  onChange={(e) => setFormData({ ...formData, quality_of_work: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Strengths</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              />
            </div>
            <div>
              <Label>Areas of Improvement</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                value={formData.areas_of_improvement}
                onChange={(e) => setFormData({ ...formData, areas_of_improvement: e.target.value })}
              />
            </div>
            <div>
              <Label>Comments</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>
            <Button type="submit">Submit Review</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{review.employee_name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(review.review_period_start).toLocaleDateString()} - {new Date(review.review_period_end).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Reviewed by: {review.reviewer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Overall Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{review.overall_rating}</span>
                  <RatingStars rating={review.overall_rating} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600">Technical</p>
                <RatingStars rating={review.technical_skills} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Communication</p>
                <RatingStars rating={review.communication} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Teamwork</p>
                <RatingStars rating={review.teamwork} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Punctuality</p>
                <RatingStars rating={review.punctuality} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Quality</p>
                <RatingStars rating={review.quality_of_work} />
              </div>
            </div>
            {review.strengths && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700">Strengths:</p>
                <p className="text-sm text-gray-600">{review.strengths}</p>
              </div>
            )}
            {review.areas_of_improvement && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700">Areas of Improvement:</p>
                <p className="text-sm text-gray-600">{review.areas_of_improvement}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PerformanceReviews;