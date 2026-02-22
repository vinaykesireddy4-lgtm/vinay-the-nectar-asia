import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    gst_number: '',
    pan_number: '',
    logo_url: '',
    bank_name: '',
    account_number: '',
    account_holder: '',
    ifsc_code: '',
    branch: '',
    terms_and_conditions: '',
    invoice_footer: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/company-settings`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/company-settings`, formData);
      toast.success('Company settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-500 mt-1">Configure your company details for invoices and documents</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Company Name *</Label>
              <Input value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} required />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GST Number</Label>
              <Input value={formData.gst_number} onChange={(e) => setFormData({...formData, gst_number: e.target.value})} />
            </div>
            <div>
              <Label>PAN Number</Label>
              <Input value={formData.pan_number} onChange={(e) => setFormData({...formData, pan_number: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input value={formData.account_holder} onChange={(e) => setFormData({...formData, account_holder: e.target.value})} />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value})} />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <Input value={formData.ifsc_code} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Branch</Label>
              <Input value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Invoice Customization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Customization</h2>
          <div className="space-y-4">
            <div>
              <Label>Terms and Conditions</Label>
              <Textarea rows={4} value={formData.terms_and_conditions}
                onChange={(e) => setFormData({...formData, terms_and_conditions: e.target.value})}
                placeholder="Enter terms and conditions for invoices" />
            </div>
            <div>
              <Label>Invoice Footer</Label>
              <Input value={formData.invoice_footer}
                onChange={(e) => setFormData({...formData, invoice_footer: e.target.value})}
                placeholder="Thank you for your business!" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;