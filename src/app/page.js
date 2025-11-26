'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isTestMode, setIsTestMode] = useState(false); // Default to OTP mode
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  // Message History State
  const [messageHistory, setMessageHistory] = useState([]);

  useEffect(() => {
    // Load history from local storage on mount
    const savedHistory = localStorage.getItem('messageHistory');
    if (savedHistory) {
      setMessageHistory(JSON.parse(savedHistory));
    }
    // Load access token
    const savedToken = localStorage.getItem('metaAccessToken');
    if (savedToken) {
      setAccessToken(savedToken);
    }
  }, []);

  useEffect(() => {
    // Save history to local storage whenever it changes
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
  }, [messageHistory]);

  const saveSettings = () => {
    localStorage.setItem('metaAccessToken', accessToken);
    setShowSettings(false);
    setStatus({ type: 'success', message: 'Settings saved successfully!' });
    setTimeout(() => setStatus(null), 3000);
  };

  // Poll for status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const pendingMessages = messageHistory.filter(msg => msg.status !== 'read' && msg.status !== 'failed');

      if (pendingMessages.length === 0) return;

      const ids = pendingMessages.map(msg => msg.id);

      try {
        const response = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        });

        if (response.ok) {
          const data = await response.json();
          const statuses = data.statuses;

          setMessageHistory(prev => prev.map(msg => {
            if (statuses[msg.id] && statuses[msg.id] !== 'unknown' && statuses[msg.id] !== msg.status) {
              return { ...msg, status: statuses[msg.id] };
            }
            return msg;
          }));
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [messageHistory]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSend = async () => {
    setLoading(true);
    setStatus(null);
    setOtpSent(false);
    setVerificationStatus(null);
    setEnteredOtp('');

    try {
      let otp = null;
      if (!isTestMode) {
        otp = generateOtp();
        setGeneratedOtp(otp);
      }

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          isTestMode,
          otp,
          accessToken // Send the token from state
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully!' });

        // Add to history
        const newMessage = {
          id: data.data.messages[0].id,
          phone: phoneNumber,
          timestamp: new Date().toISOString(),
          status: 'sent', // Initial status
          type: isTestMode ? 'Test' : 'OTP'
        };
        setMessageHistory(prev => [newMessage, ...prev]);

        if (!isTestMode) {
          setOtpSent(true);
        }
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (enteredOtp === generatedOtp) {
      setVerificationStatus({ type: 'success', message: 'OTP Verified Successfully!' });
    } else {
      setVerificationStatus({ type: 'error', message: 'Invalid OTP. Please try again.' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-blue-400';
      case 'delivered': return 'text-yellow-400';
      case 'read': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <main>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>WhatsApp Auth</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ width: 'auto', padding: '0.5rem', background: 'transparent', color: '#94a3b8', border: '1px solid #475569' }}
          >
            ⚙️
          </button>
        </div>

        {showSettings ? (
          <div className="settings-panel" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Settings</h3>
            <div className="form-group">
              <label htmlFor="token">Meta Access Token</label>
              <input
                id="token"
                type="password"
                placeholder="EAAT..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
            <button onClick={saveSettings}>Save Settings</button>
          </div>
        ) : (
          <>
            <div className="toggle-container">
              <p className="toggle-label">Test Mode (Hello World)</p>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (with country code)</label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g. 971589935206"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <button onClick={handleSend} disabled={loading || !phoneNumber}>
              {loading ? 'Sending...' : (isTestMode ? 'Send Test Message' : 'Send OTP')}
            </button>

            {status && (
              <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
                {status.message}
              </div>
            )}

            {!isTestMode && otpSent && (
              <div className="otp-section">
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                  />
                </div>
                <button onClick={handleVerify} disabled={!enteredOtp}>
                  Verify OTP
                </button>

                {verificationStatus && (
                  <div className={`status-message ${verificationStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                    {verificationStatus.message}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Message History Section */}
        {messageHistory.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#e2e8f0' }}>Message History</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {messageHistory.map((msg) => (
                <div key={msg.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#94a3b8' }}>{msg.type} to {msg.phone}</span>
                    <span style={{
                      fontWeight: 'bold',
                      color: msg.status === 'read' ? '#4ade80' :
                        msg.status === 'delivered' ? '#facc15' :
                          msg.status === 'sent' ? '#60a5fa' : '#ef4444'
                    }}>
                      {msg.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
