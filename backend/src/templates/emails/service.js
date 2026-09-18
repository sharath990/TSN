const { renderBaseLayout } = require('./base');
const config = require('../../config');

const serviceCreated = ({ name, categoryName }) =>
  renderBaseLayout(
    'Service Created',
    `Service "${name}" has been created`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 16px 0">
        Service Created
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A new service has been added to the platform.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Service Name</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${name}</td>
        </tr>
        ${categoryName ? `
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Category</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${categoryName}</td>
        </tr>
        ` : ''}
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/services" border-radius="8px" padding="0 0 16px 0">
        View Services
      </mj-button>
    `
  );

const serviceUpdated = ({ name }) =>
  renderBaseLayout(
    'Service Updated',
    `Service "${name}" has been updated`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#004250" padding="0 0 16px 0">
        Service Updated
      </mj-text>
      <mj-text padding="0 0 20px 0">
        The service <strong>${name}</strong> has been updated.
      </mj-text>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/services" border-radius="8px" padding="0 0 16px 0">
        View Services
      </mj-button>
    `
  );

const serviceDeleted = ({ name }) =>
  renderBaseLayout(
    'Service Deleted',
    `Service "${name}" has been deleted`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#dc3545" padding="0 0 16px 0">
        Service Deleted
      </mj-text>
      <mj-text padding="0 0 20px 0">
        The service <strong>${name}</strong> has been permanently deleted from the platform.
      </mj-text>
    `
  );

const categoryCreated = ({ name }) =>
  renderBaseLayout(
    'Category Created',
    `Category "${name}" has been created`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 16px 0">
        Category Created
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A new category has been added to the platform.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Category Name</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${name}</td>
        </tr>
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/categories" border-radius="8px" padding="0 0 16px 0">
        View Categories
      </mj-button>
    `
  );

const subcategoryCreated = ({ name, categoryName }) =>
  renderBaseLayout(
    'Sub-Category Created',
    `Sub-Category "${name}" has been created in "${categoryName}"`,
    `
      <mj-text font-size="18px" font-weight="bold" color="#28a745" padding="0 0 16px 0">
        Sub-Category Created
      </mj-text>
      <mj-text padding="0 0 20px 0">
        A new sub-category has been added.
      </mj-text>

      <mj-table css-class="info-box" width="100%" padding="0 0 20px 0">
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Sub-Category</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${name}</td>
        </tr>
        <tr>
          <td class="detail-label" style="padding: 6px 8px;">Category</td>
          <td class="detail-value" style="padding: 6px 8px;" align="right">${categoryName}</td>
        </tr>
      </mj-table>

      <mj-button background-color="#004250" color="white" href="${config.frontendUrl}/admin/services" border-radius="8px" padding="0 0 16px 0">
        View Services
      </mj-button>
    `
  );

module.exports = {
  serviceCreated,
  serviceUpdated,
  serviceDeleted,
  categoryCreated,
  subcategoryCreated,
};
