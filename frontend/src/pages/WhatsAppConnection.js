import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Smartphone, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WhatsAppConnection = () => {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/status`);
      const data = response.data;
      
      if (data.connected) {
        setStatus('connected');
        setUser(data.user);
        setQrCode(null);
      } else if (data.hasQR) {
        fetchQR();
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus('error');
    }
  };

  const fetchQR = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/qr`);
      if (response.data.qr) {
        setQrCode(response.data.qr);
        setStatus('qr_ready');
      }
    } catch (error) {
      console.error('QR fetch failed:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await checkStatus();
      if (status !== 'connected') {
        setTimeout(fetchQR, 2000);
      }
    } catch (error) {
      toast.error('Failed to initiate connection');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(`${API}/whatsapp/disconnect`);
      setStatus('disconnected');
      setQrCode(null);
      setUser(null);
      toast.success('Disconnected from WhatsApp');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const handleTestMessage = async () => {
    const phone = prompt('Enter phone number (with country code, e.g., 919876543210):');
    if (!phone) return;

    try {
      const response = await axios.post(`${API}/whatsapp/send-message`, {
        phone_number: phone,
        message: 'Test message from Nectar ERP! 🎉\n\nYour WhatsApp integration is working perfectly!'
      });

      if (response.data.success) {
        toast.success('Test message sent successfully!');
      } else {
        toast.error('Failed to send test message');
      }
    } catch (error) {
      toast.error('Error sending test message');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              WhatsApp Business Integration
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect WhatsApp to send invoices automatically
            </p>
          </div>
          <div>
            {status === 'connected' && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Connected
              </Badge>
            )}
            {status === 'disconnected' && (
              <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                <XCircle className="w-4 h-4 mr-1" />
                Disconnected
              </Badge>
            )}
            {status === 'qr_ready' && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <RefreshCw className="w-4 h-4 mr-1" />
                Scan QR Code
              </Badge>
            )}
            {status === 'error' && (
              <Badge className="bg-red-100 text-red-800 border-red-300">
                <XCircle className="w-4 h-4 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          {status === 'connected' && user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">✅ WhatsApp Connected</p>
                  <p className="text-sm text-green-700 mt-1">
                    Connected as: {user.name || user.id}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You can now send invoices automatically via WhatsApp!
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {status === 'disconnected' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900">⚠️ WhatsApp Not Connected</p>
              <p className="text-sm text-yellow-700 mt-1">
                Connect your WhatsApp to start sending invoices automatically.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900">❌ Connection Error</p>
              <p className="text-sm text-red-700 mt-1">
                WhatsApp service is not running. Please contact support.
              </p>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        {qrCode && status === 'qr_ready' && (
          <div className="mb-6">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Scan QR Code with WhatsApp</h3>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-lg shadow-lg">
                    <QRCode value={qrCode} size={256} />
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>1. Open WhatsApp on your phone</p>
                  <p>2. Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong></p>
                  <p>3. Tap <strong>Linked Devices</strong></p>
                  <p>4. Tap <strong>Link a Device</strong></p>
                  <p>5. Point your phone at this screen to scan the code</p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  QR code refreshes automatically
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === 'disconnected' && (
            <Button 
              onClick={handleConnect} 
              disabled={loading}
              className="flex-1"
              data-testid="connect-whatsapp-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Connect WhatsApp
                </>
              )}
            </Button>
          )}

          {status === 'connected' && (
            <>
              <Button 
                onClick={handleTestMessage}
                variant="outline"
                className="flex-1"
                data-testid="test-message-btn"
              >
                Send Test Message
              </Button>
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="flex-1"
                data-testid="disconnect-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          )}

          <Button 
            onClick={checkStatus}
            variant="outline"
            data-testid="refresh-status-btn"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Instructions */}
        {status === 'connected' && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">How to Use</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ <strong>Automatic Invoice Sending:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>When you create an invoice, it will be automatically sent to the dealer's WhatsApp</li>
                <li>The invoice PDF will be attached to the message</li>
                <li>Dealer receives instant notification on their phone</li>
              </ul>
              
              <p className="mt-4">✅ <strong>Manual Sending:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use "Send Test Message" to verify the connection</li>
                <li>You can resend invoices from the invoice management page</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WhatsAppConnection;
