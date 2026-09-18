const { renderBaseLayout } = require('./base');
const config = require('../../config');

const welcome = ({ name }) =>
  renderBaseLayout(
    'Welcome to TSN Facility Services',
    'Your account has been created successfully',
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Welcome, ${name}!
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Thank you for registering with TSN Facility Services. Your account has been created successfully and you can now book our professional facility services.
      </mj-text>
      <mj-text padding="0 0 8px 0">
        <strong>Here's what you can do:</strong>
      </mj-text>
      <mj-text padding="0 0 4px 0">
        &bull; Browse and book from our range of facility services
      </mj-text>
      <mj-text padding="0 0 4px 0">
        &bull; Track your bookings in real-time
      </mj-text>
      <mj-text padding="0 0 20px 0">
        &bull; Manage your profile and preferences
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/login" border-radius="8px" padding="0 0 16px 0">
        Get Started
      </mj-button>
      <mj-text font-size="12px" color="#888888" padding="0">
        If you have any questions, feel free to reach out to us at
        <a href="mailto:tsnfacilityservices@gmail.com" style="color: #004250;">tsnfacilityservices@gmail.com</a> or call us at
        <a href="tel:+919606484586" style="color: #004250;">+91 96064 84586</a>.
      </mj-text>
    `
  );

const passwordChanged = ({ name }) =>
  renderBaseLayout(
    'Password Changed',
    'Your password has been updated',
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Password Changed Successfully
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your password has been changed successfully. If you did not make this change, please contact our support team immediately.
      </mj-text>
      <mj-text font-size="12px" color="#888888" padding="0">
        For security, we recommend you keep your password confidential and avoid sharing it with anyone.
      </mj-text>
    `
  );

const profileUpdated = ({ name }) =>
  renderBaseLayout(
    'Profile Updated',
    'Your profile has been updated',
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Profile Updated Successfully
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your profile has been updated successfully. If you did not make this change, please contact our support team.
      </mj-text>
    `
  );

const loginAlert = ({ name, ip, browser }) =>
  renderBaseLayout(
    'New Login Detected',
    'A new login was detected on your account',
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        New Login Detected
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        A new login was detected on your account. If this was you, you can safely ignore this email.
      </mj-text>
      <mj-table css-class="info-box" padding="0 0 20px 0" width="100%">
        <tr>
          <td class="detail-label" style="padding: 4px 8px;">IP Address</td>
          <td class="detail-value" style="padding: 4px 8px;">${ip || 'Unknown'}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 4px 8px;">Browser</td>
          <td class="detail-value" style="padding: 4px 8px;">${browser || 'Unknown'}</td>
        </tr>
      </mj-table>
      <mj-text font-size="12px" color="#dc3545" padding="0">
        If this wasn't you, please change your password immediately and contact support.
      </mj-text>
    `
  );

const deactivatedLogin = ({ name }) =>
  renderBaseLayout(
    'Account Deactivated',
    'Your account has been deactivated',
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Account Deactivated
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Your account has been deactivated by the administrator. You will not be able to log in or make new bookings.
      </mj-text>
      <mj-text padding="0 0 20px 0">
        If you believe this was done in error, please contact our support team for assistance.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="mailto:tsnfacilityservices@gmail.com" border-radius="8px" padding="0 0 16px 0">
        Contact Support
      </mj-button>
    `
  );

module.exports = {
  welcome,
  passwordChanged,
  profileUpdated,
  loginAlert,
  deactivatedLogin,
};
