'use client';

import { useState } from 'react';

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
          otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully!' });
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

  return (
    <main>
      <div className="container">
        <h1>WhatsApp Auth Demo</h1>

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
      </div>
    </main>
  );
}
