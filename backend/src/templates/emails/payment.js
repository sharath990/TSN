const { renderBaseLayout } = require('./base');
const config = require('../../config');

const bookingCreated = ({ name, bookingNumber, serviceName, bookingDate, bookingTime }) =>
  renderBaseLayout(
    'Booking Created',
    `Booking ${bookingNumber} created. Please complete payment.`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Booking Created
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your booking has been created. Please complete the payment to confirm your booking.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Service</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${serviceName}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Date</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${bookingDate}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Time</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${bookingTime}</td>
        </tr>
      </mj-table>

      <mj-text font-size="12px" color="#888888" padding="0 0 16px 0">
        Your booking will be automatically cancelled if payment is not completed within 30 minutes.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/bookings" border-radius="8px" padding="0 0 16px 0">
        Complete Payment
      </mj-button>
    `
  );

const paymentFailed = ({ name, bookingNumber, reason }) =>
  renderBaseLayout(
    'Payment Failed',
    `Payment for booking ${bookingNumber} has failed`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Payment Failed
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Unfortunately, your payment for booking <strong>${bookingNumber}</strong> could not be processed.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Reason</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${reason || 'Payment declined'}</td>
        </tr>
      </mj-table>

      <mj-text padding="0 0 16px 0">
        Please try again or use a different payment method. Your booking will be held for a limited time.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/bookings" border-radius="8px" padding="0 0 16px 0">
        Retry Payment
      </mj-button>
    `
  );

const paymentExpired = ({ name, bookingNumber }) =>
  renderBaseLayout(
    'Payment Expired',
    `Payment for booking ${bookingNumber} has expired`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Payment Expired
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        The payment window for booking <strong>${bookingNumber}</strong> has expired. Your booking has been cancelled.
      </mj-text>

      <mj-text padding="0 0 16px 0">
        If you still need this service, please create a new booking.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/services" border-radius="8px" padding="0 0 16px 0">
        Book Again
      </mj-button>
    `
  );

const refundInitiated = ({ name, bookingNumber, amount }) =>
  renderBaseLayout(
    'Refund Initiated',
    `Refund of ₹${amount} initiated for booking ${bookingNumber}`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Refund Initiated
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        A refund has been initiated for your booking. The amount will be credited to your original payment method within 5-7 business days.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Refund Amount</td>
          <td style="padding: 6px 8px; color: #004250; font-weight: bold;" align="right">₹${amount}</td>
        </tr>
      </mj-table>

      <mj-text font-size="12px" color="#888888" padding="0">
        If you have any questions about your refund, please contact our support team.
      </mj-text>
    `
  );

module.exports = {
  bookingCreated,
  paymentFailed,
  paymentExpired,
  refundInitiated,
};
