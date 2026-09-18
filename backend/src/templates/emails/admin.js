const { renderBaseLayout } = require('./base');
const config = require('../../config');

const adminNewBooking = ({ customerName, bookingNumber, serviceName, bookingDate, bookingTime, amount }) =>
  renderBaseLayout(
    'New Booking Alert',
    `New booking ${bookingNumber} from ${customerName}`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        New Booking Received
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A new booking has been received and payment has been confirmed.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Customer</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${customerName}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Service</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${serviceName}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Date & Time</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${bookingDate} at ${bookingTime}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Amount</td>
          <td style="padding: 6px 8px; color: #28a745; font-weight: bold;" align="right">₹${amount}</td>
        </tr>
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/bookings" border-radius="8px" padding="0 0 16px 0">
        View in Dashboard
      </mj-button>
    `
  );

const adminNewCustomer = ({ name, email }) =>
  renderBaseLayout(
    'New Customer Registration',
    `New customer: ${name} (${email})`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        New Customer Registration
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A new customer has registered on the platform.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Name</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${name}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Email</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${email}</td>
        </tr>
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/customers" border-radius="8px" padding="0 0 16px 0">
        View Customer
      </mj-button>
    `
  );

const adminBookingCancelled = ({ customerName, bookingNumber, serviceName, reason }) =>
  renderBaseLayout(
    'Booking Cancelled',
    `Booking ${bookingNumber} cancelled by ${customerName}`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Booking Cancelled
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A booking has been cancelled by the customer.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Customer</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${customerName}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Service</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${serviceName}</td>
        </tr>
        ${reason ? `
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Reason</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${reason}</td>
        </tr>
        ` : ''}
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/bookings" border-radius="8px" padding="0 0 16px 0">
        View in Dashboard
      </mj-button>
    `
  );

const adminRefundRequest = ({ customerName, bookingNumber, amount, reason }) =>
  renderBaseLayout(
    'Refund Request',
    `Refund of ₹${amount} requested for booking ${bookingNumber}`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Refund Request
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A refund has been initiated by the system for a cancelled booking.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Customer</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${customerName}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Refund Amount</td>
          <td style="padding: 6px 8px; color: #dc3545; font-weight: bold;" align="right">₹${amount}</td>
        </tr>
        ${reason ? `
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Reason</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${reason}</td>
        </tr>
        ` : ''}
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/bookings" border-radius="8px" padding="0 0 16px 0">
        Review in Dashboard
      </mj-button>
    `
  );

const adminPaymentFailure = ({ customerName, bookingNumber, reason }) =>
  renderBaseLayout(
    'Payment Failure Alert',
    `Payment failed for booking ${bookingNumber}`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Payment Failure
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A payment has failed for a booking. The booking may need to be cancelled or retried.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Customer</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${customerName}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Reason</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${reason || 'Payment declined'}</td>
        </tr>
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/bookings" border-radius="8px" padding="0 0 16px 0">
        View in Dashboard
      </mj-button>
    `
  );

module.exports = {
  adminNewBooking,
  adminNewCustomer,
  adminBookingCancelled,
  adminRefundRequest,
  adminPaymentFailure,
};
