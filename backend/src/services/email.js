const nodemailer = require('nodemailer');
const mjml = require('mjml');
const config = require('../config');
const templates = require('../templates/emails');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    this.from = config.email.from;
    this.adminEmail = config.adminEmail;
  }

  async _renderMjml(mjmlString) {
    const { html, errors } = await mjml(mjmlString);
    if (errors.length > 0) {
      console.error('MJML compilation errors:', errors);
    }
    return html;
  }

  async sendMail({ to, subject, template, data = {} }) {
    if (!config.email.user || config.email.user === '') {
      console.warn('[EmailService] Email not configured, skipping send');
      return { success: false, message: 'Email not configured' };
    }

    try {
      const templateFn = templates[template];
      if (!templateFn) {
        throw new Error(`Template "${template}" not found`);
      }

      const mjmlString = templateFn(data);
      const html = await this._renderMjml(mjmlString);

      const result = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });

      console.log(`[EmailService] Email sent: ${subject} -> ${to} (${result.messageId})`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`[EmailService] Failed to send email: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async sendToAdmin({ subject, template, data = {} }) {
    return this.sendMail({ to: this.adminEmail, subject, template, data });
  }

  async sendWelcome(user) {
    return this.sendMail({
      to: user.email,
      subject: 'Welcome to TSN Facility Services',
      template: 'welcome',
      data: { name: user.name },
    });
  }

  async sendPasswordChanged(user) {
    return this.sendMail({
      to: user.email,
      subject: 'Password Changed Successfully',
      template: 'passwordChanged',
      data: { name: user.name },
    });
  }

  async sendProfileUpdated(user) {
    return this.sendMail({
      to: user.email,
      subject: 'Profile Updated Successfully',
      template: 'profileUpdated',
      data: { name: user.name },
    });
  }

  async sendLoginAlert(user, { ip, browser }) {
    return this.sendMail({
      to: user.email,
      subject: 'New Login Detected on Your Account',
      template: 'loginAlert',
      data: { name: user.name, ip, browser },
    });
  }

  async sendBookingCreated(booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Booking Created - ${booking.booking_number}`,
      template: 'bookingCreated',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
      },
    });
  }

  async sendPaymentSuccessful(payment, booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Payment Received - ${booking.booking_number}`,
      template: 'paymentSuccessful',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        amount: payment.amount,
      },
    });
  }

  async sendBookingConfirmed(booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Booking Confirmed - ${booking.booking_number}`,
      template: 'bookingConfirmed',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
      },
    });
  }

  async sendBookingRescheduled(booking, customer, oldDate, oldTime) {
    return this.sendMail({
      to: customer.email,
      subject: `Booking Rescheduled - ${booking.booking_number}`,
      template: 'bookingRescheduled',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        newDate: booking.booking_date,
        newTime: booking.booking_time,
        oldDate,
        oldTime,
      },
    });
  }

  async sendBookingCompleted(booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Booking Completed - ${booking.booking_number}`,
      template: 'bookingCompleted',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        bookingDate: booking.booking_date,
      },
    });
  }

  async sendBookingCancelled(booking, customer, reason, cancelledBy) {
    return this.sendMail({
      to: customer.email,
      subject: `Booking Cancelled - ${booking.booking_number}`,
      template: 'bookingCancelled',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        reason,
        cancelledBy,
      },
    });
  }

  async sendPaymentFailed(payment, booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Payment Failed - ${booking.booking_number}`,
      template: 'paymentFailed',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        reason: payment.failure_reason || 'Payment declined',
      },
    });
  }

  async sendPaymentExpired(payment, booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Payment Expired - ${booking.booking_number}`,
      template: 'paymentExpired',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
      },
    });
  }

  async sendRefundInitiated(payment, booking, customer) {
    return this.sendMail({
      to: customer.email,
      subject: `Refund Initiated - ${booking.booking_number}`,
      template: 'refundInitiated',
      data: {
        name: customer.name,
        bookingNumber: booking.booking_number,
        amount: payment.refund_amount || payment.amount,
      },
    });
  }

  async sendAccountDeactivated(user) {
    return this.sendMail({
      to: user.email,
      subject: 'Account Deactivated',
      template: 'accountDeactivated',
      data: { name: user.name },
    });
  }

  async sendAccountReactivated(user) {
    return this.sendMail({
      to: user.email,
      subject: 'Account Reactivated',
      template: 'accountReactivated',
      data: { name: user.name },
    });
  }

  async sendAdminNewBooking(booking, customer) {
    return this.sendToAdmin({
      subject: `New Booking - ${booking.booking_number}`,
      template: 'adminNewBooking',
      data: {
        customerName: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        amount: booking.total_price,
      },
    });
  }

  async sendAdminNewCustomer(user) {
    return this.sendToAdmin({
      subject: `New Customer Registered - ${user.name}`,
      template: 'adminNewCustomer',
      data: { name: user.name, email: user.email },
    });
  }

  async sendAdminBookingCancelled(booking, customer, reason) {
    return this.sendToAdmin({
      subject: `Booking Cancelled - ${booking.booking_number}`,
      template: 'adminBookingCancelled',
      data: {
        customerName: customer.name,
        bookingNumber: booking.booking_number,
        serviceName: booking.service?.name || 'N/A',
        reason,
      },
    });
  }

  async sendAdminRefundRequest(payment, booking, customer, reason) {
    return this.sendToAdmin({
      subject: `Refund Request - ${booking.booking_number}`,
      template: 'adminRefundRequest',
      data: {
        customerName: customer.name,
        bookingNumber: booking.booking_number,
        amount: payment.refund_amount || payment.amount,
        reason,
      },
    });
  }

  async sendAdminPaymentFailure(payment, booking, customer) {
    return this.sendToAdmin({
      subject: `Payment Failure - ${booking.booking_number}`,
      template: 'adminPaymentFailure',
      data: {
        customerName: customer.name,
        bookingNumber: booking.booking_number,
        reason: payment.failure_reason || 'Payment declined',
      },
    });
  }

  async sendServiceCreated(service) {
    return this.sendToAdmin({
      subject: `Service Created - ${service.name}`,
      template: 'serviceCreated',
      data: { name: service.name, categoryName: service.category?.name },
    });
  }

  async sendServiceUpdated(service) {
    return this.sendToAdmin({
      subject: `Service Updated - ${service.name}`,
      template: 'serviceUpdated',
      data: { name: service.name },
    });
  }

  async sendServiceDeleted(serviceName) {
    return this.sendToAdmin({
      subject: `Service Deleted - ${serviceName}`,
      template: 'serviceDeleted',
      data: { name: serviceName },
    });
  }

  async sendCategoryCreated(category) {
    return this.sendToAdmin({
      subject: `Category Created - ${category.name}`,
      template: 'categoryCreated',
      data: { name: category.name },
    });
  }

  async sendSubcategoryCreated(subcategory, categoryName) {
    return this.sendToAdmin({
      subject: `Sub-Category Created - ${subcategory.name}`,
      template: 'subcategoryCreated',
      data: { name: subcategory.name, categoryName },
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified');
      return { success: true };
    } catch (error) {
      console.error(`[EmailService] SMTP connection failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
