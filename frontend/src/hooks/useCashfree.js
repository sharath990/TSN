import { useState, useCallback, useRef } from 'react';

const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

let scriptLoaded = false;
let scriptLoading = false;

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) { resolve(); return; }
    if (scriptLoading) {
      const check = setInterval(() => {
        if (scriptLoaded) { clearInterval(check); resolve(); }
      }, 100);
      return;
    }
    scriptLoading = true;
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => { scriptLoaded = true; scriptLoading = false; resolve(); };
    script.onerror = () => { scriptLoading = false; reject(new Error('Failed to load Cashfree SDK')); };
    document.head.appendChild(script);
  });
};

export const useCashfree = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cashfreeRef = useRef(null);

  const initializeCheckout = useCallback(async ({ paymentSessionId, mode = 'sandbox' }) => {
    setLoading(true);
    setError(null);
    try {
      await loadScript(CASHFREE_SDK_URL);
      if (!cashfreeRef.current) {
        cashfreeRef.current = window.Cashfree({ mode });
      }
      const result = await cashfreeRef.current.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const cleanup = useCallback(() => {
    cashfreeRef.current = null;
  }, []);

  return { initializeCheckout, loading, error, cleanup };
};
