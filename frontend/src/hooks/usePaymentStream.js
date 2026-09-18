import { useEffect, useRef, useCallback, useState } from 'react';

export const usePaymentStream = (orderId) => {
  const [paymentData, setPaymentData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem('token'));

  const connect = useCallback(() => {
    if (!orderId || !tokenRef.current) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/payments/stream/${orderId}?token=${tokenRef.current}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.payment) setPaymentData(data.payment);
        if (data.booking) setBookingData(data.booking);
        if (data.type === 'PAYMENT_SUCCESS' || data.type === 'PAYMENT_FAILED' || data.type === 'PAYMENT_EXPIRED') {
          es.close();
          eventSourceRef.current = null;
        }
      } catch {
        // Ignore parse errors (keepalive messages)
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      eventSourceRef.current = null;
    };
  }, [orderId]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return { paymentData, bookingData, connected, error };
};
