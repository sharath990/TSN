const { renderBaseLayout } = require('./base');
const config = require('../../config');

const accountDeactivated = ({ name }) =>
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
        If you believe this was done in error, please contact our support team.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="mailto:tsnfacilityservices@gmail.com" border-radius="8px" padding="0 0 16px 0">
        Contact Support
      </mj-button>
    `
  );

const accountReactivated = ({ name }) =>
  renderBaseLayout(
    'Account Reactivated',
    'Your account has been reactivated',
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 16px 0">
        Account Reactivated
      </mj-text>
      <mj-text padding="0 0 20px 0">
        Hi ${name},<br /><br />
        Great news! Your account has been reactivated. You can now log in and use all features.
      </mj-text>
      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/login" border-radius="8px" padding="0 0 16px 0">
        Log In
      </mj-button>
    `
  );

module.exports = {
  accountDeactivated,
  accountReactivated,
};
