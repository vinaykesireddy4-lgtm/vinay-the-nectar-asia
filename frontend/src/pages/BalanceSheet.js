import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Package, FileText, Users, Plus, ArrowUpRight, ArrowDownRight, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BalanceSheet = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add Transaction Modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'payment_received',
    category: 'sales',
    amount: '',
    description: '',
    party_name: '',
    payment_method: 'cash',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchBalanceSheet();
    fetchTransactions();
  }, []);

  const fetchBalanceSheet = async () => {
    try {
      const response = await axios.get(`${API}/balance-sheet`);
      setBalanceSheet(response.data);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      toast.error('Failed to load balance sheet');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/financial-transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/financial-transactions`, {
        transaction_type: transactionForm.transaction_type,
        category: transactionForm.category,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        party_name: transactionForm.party_name,
        payment_method: transactionForm.payment_method,
        transaction_date: new Date(transactionForm.transaction_date).toISOString(),
        notes: transactionForm.notes
      });
      
      toast.success('Transaction added successfully');
      setShowTransactionModal(false);
      setTransactionForm({
        transaction_type: 'payment_received',
        category: 'sales',
        amount: '',
        description: '',
        party_name: '',
        payment_method: 'cash',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      fetchBalanceSheet();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error(error.response?.data?.detail || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!balanceSheet) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading balance sheet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          </div>
          <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-transaction-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Financial Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <Label>Transaction Type *</Label>
                  <Select
                    value={transactionForm.transaction_type}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, transaction_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_received">Payment Received</SelectItem>
                      <SelectItem value="payment_made">Payment Made</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select
                    value={transactionForm.category}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="Payment for Invoice #123"
                    required
                  />
                </div>

                <div>
                  <Label>Party Name (Customer/Supplier)</Label>
                  <Input
                    value={transactionForm.party_name}
                    onChange={(e) => setTransactionForm({ ...transactionForm, party_name: e.target.value })}
                    placeholder="Customer or Supplier name"
                  />
                </div>

                <div>
                  <Label>Payment Method *</Label>
                  <Select
                    value={transactionForm.payment_method}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Transaction Date *</Label>
                  <Input
                    type="date"
                    value={transactionForm.transaction_date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    value={transactionForm.notes}
                    onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowTransactionModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Transaction'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600">Comprehensive financial overview and balance sheet</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6" data-testid="cash-balance-card">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="h-8 w-8 text-green-500" />
            <span className="text-xs text-gray-500">Cash</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{balanceSheet.summary.cash_balance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Cash Balance</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6" data-testid="assets-card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <span className="text-xs text-gray-500">Assets</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{balanceSheet.summary.total_assets.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Assets</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6" data-testid="liabilities-card">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <span className="text-xs text-gray-500">Liabilities</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{balanceSheet.summary.total_liabilities.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Liabilities</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6" data-testid="net-worth-card">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <span className="text-xs text-gray-500">Net Worth</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{balanceSheet.summary.net_worth.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Assets - Liabilities</p>
        </div>

        <div className={`bg-white rounded-lg shadow p-6 ${balanceSheet.summary.net_profit >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`} data-testid="profit-card">
          <div className="flex items-center justify-between mb-2">
            {balanceSheet.summary.net_profit >= 0 ? (
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            ) : (
              <ArrowDownRight className="h-8 w-8 text-red-500" />
            )}
            <span className="text-xs text-gray-500">Profit/Loss</span>
          </div>
          <p className={`text-2xl font-bold ${balanceSheet.summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{balanceSheet.summary.net_profit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Net Profit</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Assets */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Assets
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Cash in Hand/Bank</span>
              <span className="font-semibold">₹{balanceSheet.assets.cash.toLocaleString()}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Inventory</span>
                <span className="font-semibold">₹{balanceSheet.assets.inventory.total.toLocaleString()}</span>
              </div>
              <div className="pl-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Raw Materials</span>
                  <span>₹{balanceSheet.assets.inventory.raw_materials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packing Materials</span>
                  <span>₹{balanceSheet.assets.inventory.packing_materials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Finished Goods</span>
                  <span>₹{balanceSheet.assets.inventory.finished_goods.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-gray-700">Accounts Receivable</span>
              <span className="font-semibold">₹{balanceSheet.assets.accounts_receivable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-4 text-lg font-bold">
              <span>Total Assets</span>
              <span className="text-blue-600">₹{balanceSheet.assets.total_assets.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Liabilities & Income Statement */}
        <div className="space-y-6">
          {/* Liabilities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Liabilities
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Accounts Payable</span>
                <span className="font-semibold">₹{balanceSheet.liabilities.accounts_payable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4 text-lg font-bold">
                <span>Total Liabilities</span>
                <span className="text-red-600">₹{balanceSheet.liabilities.total_liabilities.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Income Statement */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Income Statement
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Revenue</span>
                  <span className="font-semibold text-green-600">₹{balanceSheet.income_statement.revenue.sales.toLocaleString()}</span>
                </div>
                <div className="pl-4 text-sm text-gray-600 flex justify-between">
                  <span>Payments Received</span>
                  <span>₹{balanceSheet.income_statement.revenue.payments_received.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Expenses</span>
                  <span className="font-semibold text-red-600">₹{balanceSheet.income_statement.expenses.total_expenses.toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Purchases</span>
                    <span>₹{balanceSheet.income_statement.expenses.purchases.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Payments Made</span>
                    <span>₹{balanceSheet.income_statement.expenses.payments_made.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Other Expenses</span>
                    <span>₹{balanceSheet.income_statement.expenses.other_expenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className={`flex justify-between items-center border-t pt-4 text-lg font-bold ${balanceSheet.income_statement.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Net Profit/Loss</span>
                <span>₹{balanceSheet.income_statement.net_profit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <p className="text-sm text-gray-600">{transactions.length} total transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No transactions recorded yet
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 20).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.transaction_type === 'payment_received' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transaction_type === 'payment_received' ? 'Received' : 'Made'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{transaction.category}</td>
                    <td className="px-6 py-4 text-sm">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm">{transaction.party_name || '-'}</td>
                    <td className="px-6 py-4 text-sm capitalize">{transaction.payment_method}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                      transaction.transaction_type === 'payment_received' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'payment_received' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
