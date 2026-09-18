const renderBaseLayout = (title, preheader, bodyContent) => `
<mjml>
  <mj-head>
    <mj-title>${title}</mj-title>
    <mj-preview>${preheader}</mj-preview>
    <mj-attributes>
      <mj-all font-family="Arial, Helvetica, sans-serif" />
      <mj-text font-size="14px" color="#333333" line-height="1.6" />
      <mj-button font-size="14px" font-weight="bold" />
    </mj-attributes>
    <mj-style>
      .tracking-number { font-size: 24px; font-weight: bold; color: #004250; }
      .detail-label { font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; }
      .detail-value { font-size: 14px; color: #333333; font-weight: 500; }
      .info-box { background-color: #f8f9fa; border-radius: 8px; padding: 16px; }
      .divider { border-bottom: 1px solid #e9ecef; }
      .badge-success { background-color: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      .badge-danger { background-color: #dc3545; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      .badge-warning { background-color: #ffc107; color: #333; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      .footer-text { font-size: 12px; color: #888888; line-height: 1.5; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f4f4f4">

    <!-- Header -->
    <mj-section background-color="#004250" padding="20px 0">
      <mj-column>
        <mj-text align="center" color="white" font-size="20px" font-weight="bold" padding="0">
          TSN Facility Services
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Body -->
    <mj-section background-color="#ffffff" padding="30px 40px">
      <mj-column>
        ${bodyContent}
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="#ffffff" padding="0 40px 30px">
      <mj-column>
        <mj-divider border-color="#e9ecef" border-width="1px" padding="0 0 20px 0" />
        <mj-text css-class="footer-text" align="center" padding="0">
          TSN Facility Services<br />
          202, Kengel Hanumanthiah Rd, Hanumagiri, Nisarga Layout,<br />
          Chikkalasandra, Bengaluru, Karnataka 560061<br />
          <a href="tel:+919606484586" style="color: #004250;">+91 96064 84586</a> |
          <a href="mailto:tsnfacilityservices@gmail.com" style="color: #004250;">tsnfacilityservices@gmail.com</a>
        </mj-text>
        <mj-text align="center" css-class="footer-text" padding="10px 0 0 0">
          &copy; ${new Date().getFullYear()} TSN Facility Services. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>
`;

module.exports = { renderBaseLayout };
