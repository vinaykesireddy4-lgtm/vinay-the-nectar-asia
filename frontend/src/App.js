import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import InvoiceManagement from '@/pages/InvoiceManagement';
import WhatsAppConnection from '@/pages/WhatsAppConnection';
import RecoveryManagement from '@/pages/RecoveryManagement';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Suppliers from '@/pages/Suppliers';
import RawMaterials from '@/pages/RawMaterials';
import PackingMaterials from '@/pages/PackingMaterials';
import BOMList from '@/pages/BOMList';
import CreateBOM from '@/pages/CreateBOM';
import ProductionOrders from '@/pages/ProductionOrders';
import CreateProductionOrder from '@/pages/CreateProductionOrder';
import ProductionOrderView from '@/pages/ProductionOrderView';
import BatchSheet from '@/pages/BatchSheet';
import CreateInvoice from '@/pages/CreateInvoice';
import InvoiceList from '@/pages/InvoiceList';
import InvoiceView from '@/pages/InvoiceView';
import Quotations from '@/pages/Quotations';
import CreateQuotation from '@/pages/CreateQuotation';
import SalesOrders from '@/pages/SalesOrders';
import CreateSalesOrder from '@/pages/CreateSalesOrder';
import DeliveryChallans from '@/pages/DeliveryChallans';
import CreateDeliveryChallan from '@/pages/CreateDeliveryChallan';
import CreditNotes from '@/pages/CreditNotes';
import CreateCreditNote from '@/pages/CreateCreditNote';
import JournalEntries from '@/pages/JournalEntries';
import CreateJournalEntry from '@/pages/CreateJournalEntry';
import PurchaseOrders from '@/pages/PurchaseOrders';
import CreatePurchaseOrder from '@/pages/CreatePurchaseOrder';
import PurchaseInvoices from '@/pages/PurchaseInvoices';
import CreatePurchaseInvoice from '@/pages/CreatePurchaseInvoice';
import PaymentReceived from '@/pages/PaymentReceived';
import CreatePaymentReceived from '@/pages/CreatePaymentReceived';
import FinanceApprovals from '@/pages/FinanceApprovals';
import PaymentMade from '@/pages/PaymentMade';
import CreatePaymentMade from '@/pages/CreatePaymentMade';
import CompanySettings from '@/pages/CompanySettings';
import OutstandingInvoices from '@/pages/OutstandingInvoices';
import SalesReport from '@/pages/SalesReport';
import CustomerLedger from '@/pages/CustomerLedger';
import PaymentSummary from '@/pages/PaymentSummary';
import FinishedStockReport from '@/pages/FinishedStockReport';
import InventoryDashboard from '@/pages/InventoryDashboard';
import DayBook from '@/pages/DayBook';
import PendingApprovals from '@/pages/PendingApprovals';
import RequestPurchase from '@/pages/RequestPurchase';
import PurchaseRequestsList from '@/pages/PurchaseRequestsList';
import QuotePurchaseRequest from '@/pages/QuotePurchaseRequest';
import StockInward from '@/pages/StockInward';
import SupplierComparison from '@/pages/SupplierComparison';
import BalanceSheet from '@/pages/BalanceSheet';
import HRDashboard from '@/pages/HRDashboard';
import Employees from '@/pages/Employees';
import AddEditEmployee from '@/pages/AddEditEmployee';
import EmployeeProfile from '@/pages/EmployeeProfile';
import Departments from '@/pages/Departments';
import MarkAttendance from '@/pages/MarkAttendance';
import LeaveManagement from '@/pages/LeaveManagement';
import AttendanceReport from '@/pages/AttendanceReport';
import Payroll from '@/pages/Payroll';
import PerformanceReviews from '@/pages/PerformanceReviews';
import Goals from '@/pages/Goals';
import JobPostings from '@/pages/JobPostings';
import Candidates from '@/pages/Candidates';
import Interviews from '@/pages/Interviews';
import ManufacturingDashboard from '@/pages/ManufacturingDashboard';
import SalesDashboard from '@/pages/SalesDashboard';
import PurchaseDashboard from '@/pages/PurchaseDashboard';
import FinanceDashboard from '@/pages/FinanceDashboard';
import UserManagement from '@/pages/UserManagement';
import EnhancedUserManagement from '@/pages/EnhancedUserManagement';
import RoleManagement from '@/pages/RoleManagement';
import EmployeePortal from '@/pages/EmployeePortal';
import EnhancedEmployeePortal from '@/pages/EnhancedEmployeePortal';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/employee-portal" element={<EnhancedEmployeePortal />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    );
  }

  // If employee role, show only employee portal (no sidebar navigation)
  const isEmployee = user?.role === 'employee' || 
                     user?.role === 'sales_employee' || 
                     user?.role === 'marketing_employee' ||
                     user?.role === 'production_employee';

  if (isEmployee) {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/employee-portal" element={<EnhancedEmployeePortal />} />
            <Route path="*" element={<Navigate to="/employee-portal" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    );
  }

  // Admin and manager roles - show full system with Layout
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="invoice-manager" element={<InvoiceManagement />} />
            <Route path="recovery" element={<RecoveryManagement />} />
            <Route path="settings/whatsapp" element={<WhatsAppConnection />} />
            <Route path="inventory-overview" element={<InventoryDashboard />} />
            <Route path="stock-inward" element={<StockInward />} />
            <Route path="products" element={<Products />} />
            <Route path="raw-materials" element={<RawMaterials />} />
            <Route path="packing-materials" element={<PackingMaterials />} />
            <Route path="bom" element={<BOMList />} />
            <Route path="create-bom" element={<CreateBOM />} />
            <Route path="edit-bom/:id" element={<CreateBOM />} />
            <Route path="production-orders" element={<ProductionOrders />} />
            <Route path="create-production-order" element={<CreateProductionOrder />} />
            <Route path="edit-production-order/:id" element={<CreateProductionOrder />} />
            <Route path="production-orders/:id" element={<ProductionOrderView />} />
            <Route path="production-orders/:id/batch-sheet" element={<BatchSheet />} />
            <Route path="customers" element={<Customers />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="create-quotation" element={<CreateQuotation />} />
            <Route path="sales-orders" element={<SalesOrders />} />
            <Route path="create-sales-order" element={<CreateSalesOrder />} />
            <Route path="pending-approvals" element={<PendingApprovals />} />
            <Route path="create-invoice" element={<CreateInvoice />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/:id" element={<InvoiceView />} />
            <Route path="delivery-challans" element={<DeliveryChallans />} />
            <Route path="create-delivery-challan" element={<CreateDeliveryChallan />} />
            <Route path="credit-notes" element={<CreditNotes />} />
            <Route path="create-credit-note" element={<CreateCreditNote />} />
            <Route path="journal-entries" element={<JournalEntries />} />
            <Route path="create-journal-entry" element={<CreateJournalEntry />} />
            <Route path="purchase-requests" element={<PurchaseRequestsList />} />
            <Route path="quote-purchase-request/:id" element={<QuotePurchaseRequest />} />
            <Route path="request-purchase" element={<RequestPurchase />} />
            <Route path="supplier-comparison" element={<SupplierComparison />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="create-purchase-order" element={<CreatePurchaseOrder />} />
            <Route path="purchase-invoices" element={<PurchaseInvoices />} />
            <Route path="create-purchase-invoice" element={<CreatePurchaseInvoice />} />
            <Route path="balance-sheet" element={<BalanceSheet />} />
            <Route path="finance-approvals" element={<FinanceApprovals />} />
            <Route path="payment-received" element={<PaymentReceived />} />
            <Route path="create-payment-received" element={<CreatePaymentReceived />} />
            <Route path="payment-made" element={<PaymentMade />} />
            <Route path="create-payment-made" element={<CreatePaymentMade />} />
            <Route path="day-book" element={<DayBook />} />
            <Route path="outstanding-invoices" element={<OutstandingInvoices />} />
            <Route path="finished-stock" element={<FinishedStockReport />} />
            <Route path="sales-report" element={<SalesReport />} />
            <Route path="customer-ledger" element={<CustomerLedger />} />
            <Route path="payment-summary" element={<PaymentSummary />} />
            <Route path="company-settings" element={<CompanySettings />} />
            
            {/* Dashboard Routes */}
            <Route path="inventory-dashboard" element={<InventoryDashboard />} />
            <Route path="manufacturing-dashboard" element={<ManufacturingDashboard />} />
            <Route path="sales-dashboard" element={<SalesDashboard />} />
            <Route path="purchase-dashboard" element={<PurchaseDashboard />} />
            <Route path="finance-dashboard" element={<FinanceDashboard />} />
            
            {/* HR Module Routes */}
            <Route path="hr/dashboard" element={<HRDashboard />} />
            <Route path="hr/employees" element={<Employees />} />
            <Route path="hr/employees/add" element={<AddEditEmployee />} />
            <Route path="hr/employees/edit/:id" element={<AddEditEmployee />} />
            <Route path="hr/employees/:id" element={<EmployeeProfile />} />
            <Route path="hr/departments" element={<Departments />} />
            <Route path="hr/attendance/mark" element={<MarkAttendance />} />
            <Route path="hr/attendance/report" element={<AttendanceReport />} />
            <Route path="hr/leave" element={<LeaveManagement />} />
            <Route path="hr/leave/approvals" element={<LeaveManagement />} />
            <Route path="hr/payroll" element={<Payroll />} />
            <Route path="hr/performance" element={<PerformanceReviews />} />
            <Route path="hr/goals" element={<Goals />} />
            <Route path="hr/jobs" element={<JobPostings />} />
            <Route path="hr/candidates" element={<Candidates />} />
            <Route path="hr/interviews" element={<Interviews />} />
            
            {/* Admin Routes */}
            <Route path="admin/users" element={<EnhancedUserManagement />} />
            <Route path="admin/roles" element={<RoleManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;