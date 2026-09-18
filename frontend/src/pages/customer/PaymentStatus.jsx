import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../api';
import { usePaymentStream } from '../../hooks/usePaymentStream';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiClock, FiArrowLeft, FiRefreshCw, FiLoader } from 'react-icons/fi';
import './Customer.css';

export const PaymentStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const { paymentData: streamPayment, bookingData: streamBooking, connected } = usePaymentStream(orderId);

  useEffect(() => {
    if (streamPayment) {
      setPayment(streamPayment);
      setStatus(streamPayment.status);
    }
    if (streamBooking) setBooking(streamBooking);
  }, [streamPayment, streamBooking]);

  const fetchInitialStatus = useCallback(async () => {
    try {
      const res = await paymentAPI.verify(orderId);
      const { payment: payData, booking: bookData } = res.data;
      setPayment(payData);
      setBooking(bookData);
      setStatus(payData.status);
      return payData.status;
    } catch {
      return 'error';
    }
  }, [orderId]);

  useEffect(() => {
    fetchInitialStatus();
  }, []);

  const handleRetry = async () => {
    setStatus('loading');
    try {
      const res = await paymentAPI.getStatus(orderId);
      const { payment: payData } = res.data;
      setPayment(payData);
      setBooking(payData.booking || booking);
      setStatus(payData.status);
      if (payData.status === 'completed') toast.success('Payment confirmed!');
    } catch {
      toast.error('Failed to check status');
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'completed':
        return <div className="payment-status-icon success"><FiCheckCircle size={64} /></div>;
      case 'failed':
      case 'error':
        return <div className="payment-status-icon failed"><FiXCircle size={64} /></div>;
      case 'expired':
        return <div className="payment-status-icon expired"><FiXCircle size={64} /></div>;
      case 'timeout':
        return <div className="payment-status-icon timeout"><FiClock size={64} /></div>;
      default:
        return <div className="payment-status-icon pending"><FiLoader size={64} className="spin" /></div>;
    }
  };

  const renderMessage = () => {
    switch (status) {
      case 'completed':
        return { title: 'Payment Successful!', subtitle: 'Your booking has been confirmed.' };
      case 'failed':
        return { title: 'Payment Failed', subtitle: payment?.failureReason || 'The payment could not be processed. Your booking has been cancelled.' };
      case 'expired':
        return { title: 'Payment Expired', subtitle: 'The payment session has expired. Your booking has been cancelled.' };
      case 'timeout':
        return { title: 'Payment Status Unclear', subtitle: 'We could not confirm the payment. If you were charged, please contact support.' };
      case 'error':
        return { title: 'Unable to Verify', subtitle: 'Could not verify payment status. Please try again or contact support.' };
      default:
        return { title: 'Processing Payment', subtitle: connected ? 'Waiting for payment confirmation...' : 'Connecting to server...' };
    }
  };

  const { title, subtitle } = renderMessage();

  return (
    <div className="page container">
      <div className="payment-status-page">
        {renderIcon()}
        <h1 className="payment-status-title">{title}</h1>
        <p className="payment-status-subtitle">{subtitle}</p>

        {payment && (
          <div className="payment-status-details">
            <div className="payment-status-row">
              <span>Order ID</span>
              <span>{payment.orderId}</span>
            </div>
            <div className="payment-status-row">
              <span>Amount</span>
              <span>₹{Number(payment.amount).toFixed(2)}</span>
            </div>
            <div className="payment-status-row">
              <span>Status</span>
              <span className={`payment-status-badge ${status}`}>{status}</span>
            </div>
          </div>
        )}

        {(status === 'pending' || status === 'processing' || status === 'loading') && (
          <div className="payment-status-polling">
            <FiLoader className="spin" size={16} />
            <span>{connected ? 'Waiting for payment confirmation...' : 'Connecting...'}</span>
          </div>
        )}

        <div className="payment-status-actions">
          {(status === 'completed') && booking && (
            <button className="btn btn-primary" onClick={() => navigate(`/bookings/${booking.id}`)}>
              View Booking
            </button>
          )}
          {(status === 'failed' || status === 'expired' || status === 'error' || status === 'timeout') && (
            <button className="btn btn-primary" onClick={() => navigate('/services')}>
              Book Again
            </button>
          )}
          {(status === 'failed' || status === 'expired' || status === 'error' || status === 'timeout') && (
            <button className="btn btn-outline" onClick={handleRetry}>
              <FiRefreshCw /> Retry Status Check
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            <FiArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
