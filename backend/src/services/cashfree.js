const { Cashfree, CFEnvironment } = require('cashfree-pg');
const config = require('../config');

class CashfreeService {
  constructor() {
    const environment = config.cashfree.environment === 'production'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;

    this.cashfree = new Cashfree(environment, config.cashfree.appId, config.cashfree.secretKey);
  }

  async createOrder({ orderId, orderAmount, orderCurrency, customerDetails, orderMeta }) {
    const request = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency || 'INR',
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
      },
      order_meta: {
        return_url: orderMeta.returnUrl,
        notify_url: orderMeta.notifyUrl,
      },
    };

    try {
      const response = await this.cashfree.PGCreateOrder(request);
      return {
        success: true,
        data: {
          cfOrderId: response.data.cf_order_id,
          orderId: response.data.order_id,
          paymentSessionId: response.data.payment_session_id,
          orderStatus: response.data.order_status,
          orderAmount: response.data.order_amount,
          orderExpiryTime: response.data.order_expiry_time,
        },
      };
    } catch (error) {
      const raw = error.response?.data;
      if (raw?.code === 'already_exists' || raw?.message?.includes('already exists')) {
        const existing = await this.fetchOrder(orderId);
        if (existing.success) {
          return {
            success: true,
            data: {
              cfOrderId: existing.data.cfOrderId,
              orderId: existing.data.orderId,
              paymentSessionId: null,
              orderStatus: existing.data.orderStatus,
              orderAmount: existing.data.orderAmount,
              alreadyExists: true,
            },
          };
        }
      }
      return {
        success: false,
        message: raw?.message || error.message || 'Failed to create Cashfree order',
        raw,
      };
    }
  }

  async fetchOrder(orderId) {
    try {
      const response = await this.cashfree.PGFetchOrder(orderId);
      return {
        success: true,
        data: {
          cfOrderId: response.data.cf_order_id,
          orderId: response.data.order_id,
          orderStatus: response.data.order_status,
          orderAmount: response.data.order_amount,
          payments: response.data.payments,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch order',
        raw: error.response?.data,
      };
    }
  }

  async getPaymentsForOrder(orderId) {
    try {
      const response = await this.cashfree.PGOrderFetchPayments(orderId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch payments',
        raw: error.response?.data,
      };
    }
  }

  async initiateRefund({ orderId, refundAmount, refundId, refundNote }) {
    try {
      const request = {
        refund_amount: refundAmount,
        refund_id: refundId,
        refund_note: refundNote || 'Refund initiated by admin',
      };
      const response = await this.cashfree.PGOrderCreateRefund(orderId, request);
      return {
        success: true,
        data: {
          cfRefundId: response.data.cf_refund_id,
          refundId: response.data.refund_id,
          refundStatus: response.data.refund_status,
          refundAmount: response.data.refund_amount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to initiate refund',
        raw: error.response?.data,
      };
    }
  }

  verifyWebhookSignature(signature, rawBody, timestamp) {
    try {
      this.cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Webhook signature verification failed' };
    }
  }
}

module.exports = new CashfreeService();
