import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateJournalEntry = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [entryType, setEntryType] = useState('freight');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceType, setReferenceType] = useState('none');
  const [referenceNumber, setReferenceNumber] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!amount || parseFloat(amount) === 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const entryData = {
        entry_type: entryType,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        description: description.trim(),
        amount: parseFloat(amount),
        reference_type: referenceType === 'none' ? '' : referenceType,
        reference_id: '',
        reference_number: referenceNumber || '',
        status: 'posted',
      };

      await axios.post(`${API}/journal-entries`, entryData);
      toast.success('Journal entry created successfully');
      navigate('/journal-entries');
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast.error('Failed to create journal entry');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Journal Entry</h1>
        <p className="text-gray-500 mt-1">Record freight charges, discounts, or other adjustments</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Entry Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={selectedCustomer?.id || ''}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value);
                  setSelectedCustomer(customer);
                }}
              >
                <SelectTrigger data-testid="customer-select">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entry_type">Entry Type *</Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger data-testid="entry-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opening_balance">Opening Balance</SelectItem>
                  <SelectItem value="freight">Freight (Paid by Customer)</SelectItem>
                  <SelectItem value="discount">Discount (Given to Customer)</SelectItem>
                  <SelectItem value="other_charges">Other Charges (To Customer)</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {entryType === 'opening_balance' ? 'Enter positive amount for what customer owes (Debit), negative if you owe customer (Credit)' :
                 entryType === 'freight' ? 'Enter positive amount - will be credited (reduce balance)' :
                 entryType === 'discount' ? 'Enter positive amount - will be credited (reduce balance)' :
                 'Enter positive amount - will be debited (increase balance)'}
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description of the entry"
                rows={3}
                required
                data-testid="description-input"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={entryType === 'opening_balance' ? 'Enter amount (positive/negative)' : 'Enter amount'}
                required
                data-testid="amount-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                {entryType === 'opening_balance' 
                  ? 'Positive = Customer owes you (Debit), Negative = You owe customer (Credit)'
                  : 'Enter positive amount only. Freight & Discount reduce balance, Other Charges increase balance.'}
              </p>
            </div>

            <div>
              <Label htmlFor="reference_type">Reference Type</Label>
              <Select value={referenceType} onValueChange={setReferenceType}>
                <SelectTrigger data-testid="reference-type-select">
                  <SelectValue placeholder="Select reference type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="sales_order">Sales Order</SelectItem>
                  <SelectItem value="delivery_challan">Delivery Challan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter reference number (optional)"
                data-testid="reference-number-input"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{selectedCustomer?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Entry Type:</span>
              <span className="font-medium capitalize">{entryType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Amount:</span>
              <span className={
                entryType === 'opening_balance' 
                  ? (amount && parseFloat(amount) >= 0 ? 'text-red-600' : 'text-green-600')
                  : (entryType === 'freight' || entryType === 'discount') ? 'text-green-600' : 'text-red-600'
              }>
                {amount ? `₹${parseFloat(amount).toFixed(2)}` : '₹0.00'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {entryType === 'opening_balance'
                ? (amount && parseFloat(amount) >= 0 
                    ? 'Opening balance - customer owes this amount (Debit)' 
                    : 'Opening balance - you owe customer this amount (Credit)')
                : entryType === 'freight' 
                ? 'Freight paid by customer - will reduce their balance (Credit)' 
                : entryType === 'discount'
                ? 'Discount given - will reduce their balance (Credit)'
                : 'Other charges - will increase their balance (Debit)'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/journal-entries')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="create-journal-entry-submit-btn">
            <Save className="h-4 w-4 mr-2" />
            Create Entry
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateJournalEntry;
