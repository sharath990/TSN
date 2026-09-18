const { renderBaseLayout } = require('./base');
const config = require('../../config');

const paymentSuccessful = ({ name, bookingNumber, serviceName, bookingDate, bookingTime, amount }) =>
  renderBaseLayout(
    'Payment Received',
    `Payment of ₹${amount} received for booking ${bookingNumber}`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 8px 0">
        Payment Received!
      </mj-text>
      <mj-text font-size="14px" color="#666666" padding="0 0 20px 0">
        Your payment has been processed successfully. Below are your booking details.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Amount Paid</td>
          <td style="padding: 6px 8px;" align="right"><strong style="color: #28a745; font-size: 18px;">₹${amount}</strong></td>
        </tr>
      </mj-table>

      <mj-text font-size="14px" font-weight="bold" color="#004250" padding="0 0 8px 0">
        Booking Details
      </mj-text>
      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
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

      <mj-text padding="0 0 8px 0">
        We'll notify you once your booking is confirmed by our team.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/bookings" border-radius="8px" padding="0 0 16px 0">
        View Booking
      </mj-button>
    `
  );

const bookingConfirmed = ({ name, bookingNumber, serviceName, bookingDate, bookingTime }) =>
  renderBaseLayout(
    'Booking Confirmed',
    `Your booking ${bookingNumber} has been confirmed`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 8px 0">
        Booking Confirmed!
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Great news! Your booking has been confirmed. Our team will arrive at the scheduled date and time.
      </mj-text>

      <mj-text font-size="14px" font-weight="bold" color="#004250" padding="0 0 8px 0">
        Booking Details
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

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/bookings" border-radius="8px" padding="0 0 16px 0">
        View Booking
      </mj-button>
    `
  );

const bookingRescheduled = ({ name, bookingNumber, serviceName, newDate, newTime, oldDate, oldTime }) =>
  renderBaseLayout(
    'Booking Rescheduled',
    `Your booking ${bookingNumber} has been rescheduled`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Booking Rescheduled
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your booking has been rescheduled. Please note the updated date and time below.
      </mj-text>

      <mj-table width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px; text-decoration: line-through;">Previous Date & Time</td>
          <td style="padding: 6px 8px; text-decoration: line-through; color: #999;" align="right">${oldDate} at ${oldTime}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">New Date & Time</td>
          <td style="padding: 6px 8px; color: #28a745; font-weight: bold;" align="right">${newDate} at ${newTime}</td>
        </tr>
      </mj-table>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Booking Number</td>
          <td class="tracking-number" style="padding: 6px 8px;" align="right">${bookingNumber}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Service</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${serviceName}</td>
        </tr>
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/bookings" border-radius="8px" padding="0 0 16px 0">
        View Booking
      </mj-button>
    `
  );

const bookingCompleted = ({ name, bookingNumber, serviceName, bookingDate }) =>
  renderBaseLayout(
    'Booking Completed',
    `Your booking ${bookingNumber} has been completed`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 16px 0">
        Booking Completed!
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your booking has been marked as completed. We hope you're satisfied with our service!
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
      </mj-table>

      <mj-text padding="0 0 8px 0">
        We'd love to hear your feedback! Your review helps us improve our services.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/bookings" border-radius="8px" padding="0 0 16px 0">
        View Booking
      </mj-button>
    `
  );

const bookingCancelled = ({ name, bookingNumber, serviceName, reason, cancelledBy }) =>
  renderBaseLayout(
    'Booking Cancelled',
    `Your booking ${bookingNumber} has been cancelled`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Booking Cancelled
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your booking has been cancelled ${cancelledBy === 'admin' ? 'by the administrator' : 'by you'}.
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
        ${reason ? `
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Reason</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${reason}</td>
        </tr>
        ` : ''}
      </mj-table>

      <mj-text font-size="12px" color="#888888" padding="0">
        If you have any questions about this cancellation, please contact our support team.
      </mj-text>
    `
  );

module.exports = {
  paymentSuccessful,
  bookingConfirmed,
  bookingRescheduled,
  bookingCompleted,
  bookingCancelled,
};
