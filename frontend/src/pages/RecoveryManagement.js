import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, DollarSign, Calendar, TrendingUp, Phone, MessageCircle, Mail, Plus, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecoveryManagement = () => {
  const [stats, setStats] = useState(null);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [customerSummary, setCustomerSummary] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  
  const [followUpForm, setFollowUpForm] = useState({
    contacted_person: '',
    contact_method: 'phone',
    notes: '',
    status: 'contacted',
    next_follow_up_date: '',
    follow_up_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, invoicesRes, customersRes] = await Promise.all([
        axios.get(`${API}/recovery/stats`),
        axios.get(`${API}/recovery/overdue-invoices`),
        axios.get(`${API}/recovery/customer-summary`)
      ]);
      
      setStats(statsRes.data);
      setOverdueInvoices(invoicesRes.data);
      setCustomerSummary(customersRes.data);
    } catch (error) {
      toast.error('Failed to fetch recovery data');
      console.error(error);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await axios.post(`${API}/recovery/record-payment`, {
        invoice_id: selectedInvoice.id,
        invoice_number: selectedInvoice.invoice_number,
        payment_date: new Date(paymentForm.payment_date).toISOString(),
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.reference_number,
        notes: paymentForm.notes,
        recorded_by: user.username || user.full_name || 'User'
      });
      
      toast.success('Payment recorded successfully!');
      setShowPaymentForm(false);
      setPaymentForm({
        amount: '',
        payment_method: 'bank_transfer',
        reference_number: '',
        notes: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to record payment');
      console.error(error);
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await axios.post(`${API}/recovery/follow-up`, {
        invoice_id: selectedInvoice.id,
        invoice_number: selectedInvoice.invoice_number,
        follow_up_date: new Date(followUpForm.follow_up_date).toISOString(),
        contacted_person: followUpForm.contacted_person,
        contact_method: followUpForm.contact_method,
        notes: followUpForm.notes,
        status: followUpForm.status,
        next_follow_up_date: followUpForm.next_follow_up_date ? new Date(followUpForm.next_follow_up_date).toISOString() : null,
        recorded_by: user.username || user.full_name || 'User'
      });
      
      toast.success('Follow-up note added successfully!');
      setShowFollowUpForm(false);
      setFollowUpForm({
        contacted_person: '',
        contact_method: 'phone',
        notes: '',
        status: 'contacted',
        next_follow_up_date: '',
        follow_up_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add follow-up note');
      console.error(error);
    }
  };

  const handleSendReminder = async (invoiceId) => {
    try {
      const response = await axios.post(`${API}/recovery/send-reminder/${invoiceId}`);
      if (response.data.success) {
        toast.success('Payment reminder sent via WhatsApp!');
        fetchData();
      } else {
        toast.error('Failed to send reminder');
      }
    } catch (error) {
      toast.error('Error sending reminder');
      console.error(error);
    }
  };

  const getSeverityColor = (days) => {
    if (days > 60) return 'bg-red-100 text-red-800 border-red-300';
    if (days > 30) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (days > 15) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getSeverityLabel = (days) => {
    if (days > 60) return 'Critical';
    if (days > 30) return 'High Priority';
    if (days > 15) return 'Medium';
    return 'Low';
  };

  if (!stats) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Recovery</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage overdue payments</p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600">₹{stats.total_outstanding.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.overdue_count} invoices</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Overdue</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.critical_overdue_amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.critical_overdue} invoices (>30 days)</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Partially Paid</p>
              <p className="text-2xl font-bold text-yellow-600">₹{stats.partially_paid_amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.partially_paid_count} invoices</p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due This Week</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.due_this_week_amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.due_this_week} invoices</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Aging Analysis */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Aging Analysis</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(stats.by_age).map(([range, data]) => (
            <div key={range} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{data.count}</p>
              <p className="text-sm text-gray-600">{range} days</p>
              <p className="text-xs font-semibold text-gray-700 mt-2">₹{data.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Overdue Invoices</TabsTrigger>
          <TabsTrigger value="customers">By Customer</TabsTrigger>
        </TabsList>

        {/* Overdue Invoices Tab */}
        <TabsContent value="invoices">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Overdue Invoices ({overdueInvoices.length})</h2>
            {overdueInvoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No overdue invoices! 🎉</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Invoice</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Days Overdue</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Outstanding</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {overdueInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{invoice.invoice_number}</td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium">{invoice.customer_name}</p>
                            <p className="text-xs text-gray-500">{invoice.customer_phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{invoice.due_date.split('T')[0]}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={getSeverityColor(invoice.days_overdue)}>
                            {invoice.days_overdue} days
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">₹{invoice.outstanding_amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={invoice.payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {invoice.payment_status === 'partially_paid' ? 'Partial' : 'Unpaid'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setPaymentForm({ ...paymentForm, amount: invoice.outstanding_amount.toString() });
                                setShowPaymentForm(true);
                              }}
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowFollowUpForm(true);
                              }}
                              title="Add Follow-up"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(invoice.id)}
                              className="text-green-600"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* By Customer Tab */}
        <TabsContent value="customers">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Outstanding by Customer</h2>
            <div className="space-y-3">
              {customerSummary.map((customer) => (
                <Card key={customer.customer_name} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.customer_phone}
                        </span>
                        {customer.customer_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.customer_email}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="font-medium">Invoices: {customer.invoice_count}</span>
                        <span className="font-medium">Oldest: {customer.oldest_invoice_days} days</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">₹{customer.total_outstanding.toLocaleString()}</p>
                      <Badge className={getSeverityColor(customer.oldest_invoice_days)}>
                        {getSeverityLabel(customer.oldest_invoice_days)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium text-blue-600">View Invoices ({customer.invoices.length})</summary>
                      <div className="mt-2 space-y-2">
                        {customer.invoices.map((inv) => (
                          <div key={inv.invoice_number} className="text-sm flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                            <span>{inv.invoice_number}</span>
                            <span className="text-gray-600">{inv.days_overdue} days overdue</span>
                            <span className="font-semibold">₹{inv.outstanding.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full m-4">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm"><strong>Invoice:</strong> {selectedInvoice.invoice_number}</p>
              <p className="text-sm"><strong>Customer:</strong> {selectedInvoice.customer_name}</p>
              <p className="text-sm"><strong>Outstanding:</strong> ₹{selectedInvoice.outstanding_amount.toLocaleString()}</p>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <Label>Payment Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Payment Method *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Reference Number</Label>
                <Input
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  placeholder="Transaction ID, Cheque No, etc."
                />
              </div>
              <div>
                <Label>Notes</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Record Payment</Button>
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Follow-up Form Modal */}
      {showFollowUpForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full m-4">
            <h2 className="text-xl font-bold mb-4">Add Follow-up Note</h2>
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm"><strong>Invoice:</strong> {selectedInvoice.invoice_number}</p>
              <p className="text-sm"><strong>Customer:</strong> {selectedInvoice.customer_name}</p>
            </div>
            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div>
                <Label>Follow-up Date *</Label>
                <Input
                  type="date"
                  value={followUpForm.follow_up_date}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Contacted Person</Label>
                <Input
                  value={followUpForm.contacted_person}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, contacted_person: e.target.value })}
                  placeholder="Person name"
                />
              </div>
              <div>
                <Label>Contact Method *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={followUpForm.contact_method}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, contact_method: e.target.value })}
                  required
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="visit">In-person Visit</option>
                </select>
              </div>
              <div>
                <Label>Status *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={followUpForm.status}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, status: e.target.value })}
                  required
                >
                  <option value="contacted">Contacted</option>
                  <option value="promised_payment">Promised Payment</option>
                  <option value="disputed">Disputed</option>
                  <option value="no_response">No Response</option>
                </select>
              </div>
              <div>
                <Label>Notes *</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="Follow-up details"
                  required
                />
              </div>
              <div>
                <Label>Next Follow-up Date</Label>
                <Input
                  type="date"
                  value={followUpForm.next_follow_up_date}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, next_follow_up_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Follow-up</Button>
                <Button type="button" variant="outline" onClick={() => setShowFollowUpForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RecoveryManagement;
