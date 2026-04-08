import { test, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';

dotenv.config();

test.setTimeout(30 * 60 * 1000); // 30 minutes

let reportSteps: any[] = [];

// Run step function and capture screenshot
async function runStep(
  stepName: string,
  page: Page,
  stepFn: () => Promise<string | void>
) {
  const start = Date.now();
  console.log(`===== ${stepName} STARTED =====`);

  let details = '';

  try {
    details = (await stepFn()) || '';   // 👈 capture returned text

    const duration = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`===== ${stepName} COMPLETED (${duration}s) =====`);

    reportSteps.push({
      name: stepName,
      status: 'PASSED',
      time: duration,
      screenshot: await page.screenshot({ fullPage: true }),
      details: details      // 👈 store here
    });

  } catch (error) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`===== ${stepName} FAILED (${duration}s) =====`);

    const screenshot = await page.screenshot({ fullPage: true });

    reportSteps.push({
      name: stepName,
      status: 'FAILED',
      time: duration,
      screenshot,
      details: details,     // 👈 still print partial details
      error: String(error)
    });

    // don't throw
  }
}

// ================= PDF REPORT =================

function generatePDFReport() {

  const now = new Date();

  const timestamp =
    now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0');

  const fileName = `${process.env.RESULT_REPORT_NAME}_${timestamp}.pdf`;

  // create folder if not exists
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports');
  }

  const doc = new PDFDocument({ margin: 30 });

  doc.pipe(fs.createWriteStream(`reports/${fileName}`));

  console.log(`Report generated: reports/${fileName}`);

  // ===== TITLE =====
  doc.font('Times-Bold')
    .fontSize(18)
    .text(process.env.REPORT_HEADER_NAME!, { align: 'center' });

  doc.moveDown(2);

  const startX = 50;
  let y = doc.y;

  // ===== HEADER =====
  doc.rect(startX - 5, y - 3, 500, 20).fill('#D9E1F2');

  doc.fillColor('black')
    .font('Times-Bold')
    .fontSize(12);

  doc.text('S.No', startX, y);
  doc.text('Test Case Name', startX + 50, y);
  doc.text('Time (sec)', startX + 350, y);
  doc.text('Status', startX + 430, y);
  y += 25;
  doc.font('Times-Roman').fontSize(11);

  // ===== TABLE ROWS =====
reportSteps.forEach((step, index) => {

  if (y > 700) {
    doc.addPage();
    y = 50;
  }

  doc.fillColor('black')
    .text(String(index + 1), startX, y);

  doc.text(step.name, startX + 50, y, {
    width: 280,
    align: 'left'
  });

  doc.text(`${step.time}s`, startX + 350, y, {
    width: 60,
    align: 'center'
  });

  doc.fillColor(step.status === 'PASSED' ? 'green' : 'red')
    .text(step.status, startX + 430, y, {
      width: 70,
      align: 'left'
    });

  y += 18;

  // ✅ ADD THIS BLOCK (prints provisioning identities)
  if (step.details) {

    doc.font('Times-Roman')
      .fontSize(9)
      .fillColor('black')
      .text(step.details, startX + 50, y, {
        width: 430,
        align: 'left'
      });

    y = doc.y + 5;
  }

  y += 5;
});

  doc.moveDown(2);
  // ===== SCREENSHOTS HEADER (CENTER + SMALLER SIZE) =====

  doc.font('Times-Bold')
    .fontSize(16)
    .fillColor('black')
    .text('Screenshots', 0, doc.y, {
      width: doc.page.width,   // 👈 THIS is the key fix
      align: 'center'
    });

  doc.moveDown(1.5);

  reportSteps.forEach(step => {

    // 🛑 Ensure enough space for full block
    if (doc.y + 320 > doc.page.height) {
      doc.addPage();
    }

    const lineY = doc.y;

    const statusColor = step.status === 'PASSED' ? 'green' : 'red';

    // Test name
    doc.font('Times-Bold')
      .fontSize(11)
      .fillColor('black')
      .text(`${step.name} - `, 50, lineY, {
        continued: true
      });

    // Status
    doc.fillColor(statusColor)
      .text(step.status);

    doc.y = lineY + 20;

    // ✅ ADD THIS BLOCK (prints provisioning result)
    if (step.details) {

      doc.font('Times-Roman')
        .fontSize(9)
        .fillColor('black')
        .text(step.details, 60, doc.y, {
          width: 480,
          align: 'left'
        });

      doc.moveDown(0.5);
    }

    // 🛑 Check again before image
    if (doc.y + 250 > doc.page.height) {
      doc.addPage();
    }

    // image center
    const imgWidth = 400;
    const pageWidth = doc.page.width;
    const x = (pageWidth - imgWidth) / 2;

    doc.image(step.screenshot, x, doc.y, {
      width: imgWidth
    });

    doc.y += 260;
    doc.moveDown(1);
  });

  doc.end();
}

test('test', async ({ page }) => {
  await runStep('Volt HRMS Onboarding', page, async () => {
    await page.goto(process.env.BUILD_URL!);
    await page.getByRole('textbox', { name: 'Username' }).fill(process.env.LOGIN_USERNAME!);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.LOGIN_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByText('Manage & Govern Identities').click();
    await page.getByRole('button', { name: 'Add Source' }).click();
    await page.getByText('Volt HRMS').click({ force: true });
    await page.locator('#identity_name').fill(process.env.VOLT_HRMS_APPLICATION_NAME!);
    await page.locator('#start_range').fill(process.env.VOLT_HRMS_IP_ADDRESS!);
    await page.locator('#default_database').fill(process.env.VOLT_HRMS_DB_NAME!);
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/volt_hrms.yaml');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('#credential_username').fill(process.env.VOLT_HRMS_USERNAME!);
    await page.locator('#credential_password').fill(process.env.VOLT_HRMS_PASSWORD!);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    // success validation
    await expect(page.getByText('Identity Source Added')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.VOLT_HRMS_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('AWS IAM Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByText('Manage & Govern Identities').click();
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('AWS IAM').click({ force: true });
    await page.locator('#app_name').fill(process.env.AWS_IAM_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.AWS_IAM_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#adImportForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.locator('#client_id').click();
    await page.locator('#client_id').fill(process.env.AWS_CLIENT_ID!);
    await page.locator('#client_secret').click();
    await page.locator('#client_secret').fill(process.env.AWS_CLIENT_SECRET!);
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/aws_iam.yaml');
    await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.AWS_IAM_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Entra ID Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('Entra ID').click();
    await page.locator('#app_name').fill(process.env.ENTRA_ID_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.ENTRA_ID_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#addIgaAzureApplicationForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.locator('#tenant_id').click();
    await page.locator('#tenant_id').fill(process.env.AZURE_TENANT_ID!);
    await page.locator('#client_id').click();
    await page.locator('#client_id').fill(process.env.AZURE_CLIENT_ID!);
    await page.locator('#client_secret').click();
    await page.locator('#client_secret').fill(process.env.AZURE_CLIENT_SECRET!);
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/entra_id.yaml');
    await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.ENTRA_ID_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Exchange Server Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('Exchange Server').click();
    await page.locator('#app_name').fill(process.env.EXCHANGE_SERVER_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.EXCHANGE_SERVER_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#start_range').fill(process.env.EXCHANGE_SERVER_IP_ADDRESS!);
    await page.locator('.cyb-dropdown-label').first().click();
    await page.locator('#primary-accounts-discovery-form').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.getByText('Select Autehntication Type *').click();
    await page.getByText('Basic', { exact: true }).click();
    await page.locator('#ssl-checkbox-status').click();
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/exchange_onprem.yaml');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.locator('#credential_username').click();
    await page.locator('#credential_username').fill(process.env.EXCHANGE_ONPREM_USERNAME!);
    await page.locator('#credential_username').press('Tab');
    await page.locator('#credential_password').fill(process.env.EXCHANGE_ONPREM_PASSWORD!);
    await page.getByRole('button', { name: 'Next' }).click();
    const baseDnField = page.getByText('Base DN').locator('..').locator('input');
    await expect(baseDnField).toBeVisible();
    await baseDnField.fill('OU=IGA,DC=example,DC=com');
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.EXCHANGE_SERVER_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('AWS Identity Center Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('AWS Identity Center').click({ force: true });
    await page.locator('#app_name').click();
    await page.locator('#app_name').fill(process.env.AWS_CLOUD_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.AWS_CLOUD_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#adImportForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/aws_cloud.yaml');
    await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.AWS_CLOUD_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Active Directory Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('Active Directory').click();
    await page.locator('#app_name').fill(process.env.AD_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.AD_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#start_range').fill(process.env.AD_IP_ADDRESS!);
    await page.getByText('Select Application Owner * Securden Administrator').click();
    await page.locator('#primary-accounts-discovery-form').getByText('Securden Administrator').click();
    // await page.locator('.cyb-dd.add-account-type > .cyb-dropdown-label').click();
    // await page.locator('#primary-accounts-discovery-form').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/active_directory.yaml');
    await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
    await page.locator('#credential_username').click();
    await page.locator('#credential_username').fill(process.env.AD_USERNAME!);
    await page.locator('#credential_username').press('Tab');
    await page.locator('#credential_password').fill(process.env.AD_PASSWORD!);
    await page.getByRole('button', { name: 'Next' }).click();
    const usersOuDropdown = page.getByText('Users OU').locator('..').locator('.cyb-dropdown-label');
    await expect(usersOuDropdown).toBeVisible();
    await usersOuDropdown.click();
    await page.getByText('OU=IGA', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.AD_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Office 365 Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('Office').click({ force: true });
    await page.locator('#app_name').click();
    await page.locator('#app_name').fill(process.env.OFFICE_365_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.OFFICE_365_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#addIgaAzureApplicationForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/entra_id.yaml');
    await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.OFFICE_365_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Google Workspace Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('Google Workspace').click({ force: true });
    await page.locator('#app_name').click();
    await page.locator('#app_name').fill(process.env.GOOGLE_WORKSPACE_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.GOOGLE_WORKSPACE_APP_CODE!);
    await page.getByText('Select Application Owner Securden Administrator').click();
    await page.locator('#addGoogleWorkspaceApplicationForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.locator('#admin_mail').click();
    await page.locator('#admin_mail').fill(process.env.GOOGLE_ADMIN_MAIL!);
    await page.locator('#google_domain').click();
    await page.locator('#google_domain').fill(process.env.GOOGLE_WORKSPACE_DOMAIN!);
    await page.locator('#customer_id').click();
    await page.locator('#customer_id').fill(process.env.GOOGLE_CUSTOMER_ID!);
    await page.getByText('Service Account Credentials').click();

    const fileInputs = page.locator('input[type="file"]');

    await fileInputs.nth(0).setInputFiles('Testing_upload_documents/google.json');
    await fileInputs.nth(1).setInputFiles('Testing_upload_documents/gsuit.yaml');

    const saveBtn = page.getByRole('button', { name: 'Save' });

    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('.cyb-form-field:has-text("BASE OU") .cyb-dropdown-label').click();
    await page.getByText('/QA', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.GOOGLE_WORKSPACE_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Exchange Cloud Onboarding', page, async () => {
    await page.getByRole('link', { name: 'Applications' }).click();
    await page.getByRole('button', { name: 'Add Application' }).click();
    await page.getByText('Exchange Cloud').click({ force: true });
    await page.locator('#app_name').click();
    await page.locator('#app_name').fill(process.env.EXCHANGE_CLOUD_APPLICATION_NAME!);
    await page.locator('#app_name').press('Tab');
    await page.locator('#app_desc').press('Tab');
    await page.locator('#app_code').fill(process.env.EXCHANGE_CLOUD_APP_CODE!);
    await page.locator('#app_code').press('Tab');
    await page.locator('#addIgaAzureApplicationForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
    await page.getByRole('button', { name: 'Browse Choose a file' }).click();
    await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/exchange_cloud.yaml');
    await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // success validation
    await expect(page.getByText('Application Added Successfully')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.EXCHANGE_CLOUD_APPLICATION_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });


  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByText('Manage & Govern Identities').click();
  await page.getByRole('link', { name: 'Workflows' }).click();
  await runStep('Approval Workflow', page, async () => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.locator('#name').fill('Approval workflow');
    await page.locator('#name').press('Tab');
    await page.locator('#description').press('Tab');
    await page.getByText('Access Request').click();
    await page.getByText('Select Approval Method Sequential').click();
    await page.locator('#iga-workflow-form').getByText('Sequential').click();
    await page.getByText('User User Group').click();
    await page.locator('#iga-workflow-form').getByRole('listitem').filter({ hasText: 'User' }).click();
    await page.getByText('Search ApproverSearch Approver').click();
    await page.getByText(process.env.APPROVER_USERNAME!).click();
    await page.getByRole('button', { name: 'Save' }).click();
    // validation
    await expect(page.getByText('Workflow created successfully.')).toBeVisible();
    // audit validation
    await page.locator('#iga-audit-route-link').click();
    const row = page
      .locator('#table_container tbody tr')
      .filter({ hasText: process.env.APPROVAL_WORKFLOW_NAME! });
    await expect(row.first()).toBeVisible({ timeout: 20000 });
  });

  await runStep('Leaver Workflow', page, async () => {
    await page.getByRole('link', { name: 'Workflows' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await page.locator('#name').click();
    await page.locator('#name').fill('Leaver Workflow');
    await page.locator('#name').press('Tab');
    await page.getByText('Select Workflow Type Access').click();
    await page.locator('#iga-workflow-form').getByText('Lifecycle Event Workflow').click();
    await page.getByText('Search ApplicationSearch').click();
    await page.getByRole('treeitem', { name: process.env.AD_IDENTIFIER! }).click();
    await page.getByText('Select Action Move Action').click();
    await page.locator('#iga-workflow-form').getByText('Move Action').click();
    await page.getByText('False False True').click();
    await page.locator('#iga-workflow-form').getByText('True').click();
    await page.getByText('Select Attribute Type Organizational Units').click();
    await page.locator('#iga-workflow-form').getByText('Organizational Units').click();
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('textbox').nth(3).fill(process.env.LEAVER_OU_NAME!);
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await runStep('Reports Customization', page, async () => {
    await page.getByRole('link', { name: 'Report', exact: true }).click();
    await page.getByText('Newly Onboarded Employees').click();
    await page.getByRole('button', { name: 'Customize Report' }).click();
    await page.locator('#days-for-report-id').click();
    await page.locator('#days-for-report-id').fill(process.env.NEWLY_ONBOARDED_CUSTOMIZE_DAYS!);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('link', { name: 'Report', exact: true }).click();
    await page.getByText('Offboarded Employees').click();
    await page.getByRole('button', { name: 'Customize Report' }).click();
    await page.locator('#days-for-report-id').click();
    await page.locator('#days-for-report-id').fill(process.env.OFFBOARDED_CUSTOMIZE_DAYS!);
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await page.waitForTimeout(5 * 60 * 1000); // 5mins timeout for entitlement sync

  await runStep('Business Role', page, async () => {
    await page.getByRole('link', { name: 'Business Role' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await page.locator('#role_name').fill('Developers');
    await page.locator('#role_name').press('Tab');
    await page.locator('#rcode').fill('BR001');
    await page.locator('#rcode').press('Tab');
    await page.locator('#role_desc').fill('Groups');
    await page.getByText('Functional Business Composite').click();
    await page.getByRole('listitem').filter({ hasText: 'Functional' }).click();
    await page.getByText('Cost Center Cost Center').click();
    await page.getByText('Department').click();
    await page.getByText('Contains Contains Equals').click();
    await page.getByText('Is Not Null').click();
    await page.getByText('Select Application Securden').click();
    await page.getByText('Securden AD Domain').click();
    await page.getByText('Group').first().click();
    await page.getByRole('listitem').filter({ hasText: 'Group' }).click();
    await page.getByText('Search Entries').click();
    await page.locator('input[type="search"]').click();
    await page.locator('input[type="search"]').fill('dev');
    await page.getByText('Dev').click();
    await page.getByText('Disabled').first().click();
    await page.locator('#add-business-role-form').getByText('Enabled').click();
    await page.locator('.cyb-criteria-area.add-field-list-wrap.acc-type-field-wrap.iga-add-roles.mtop30 > .cyb-search-area > .cyb-criteria-area > .cyb-criteria-group > .cyb-each-criteria > .additional-field-icons > .icon-add').click();
    await page.getByText('Select Application Securden').click();
    await page.getByRole('listitem').filter({ hasText: 'SECURDEN AWS CLOUD' }).click();
    await page.getByText('Group').nth(2).click();
    await page.getByRole('listitem').filter({ hasText: 'Group' }).click();
    await page.getByText('Search Entries').click();
    await page.getByRole('treeitem', { name: 'Developers' }).click();
    await page.getByText('Disabled').nth(1).click();
    await page.getByRole('listitem').filter({ hasText: 'Enabled' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await runStep('Sync Source', page, async () => {
    await page.getByRole('link', { name: 'Data Sources' }).click();
    await page.locator('.icon-sync').click();
  });

  await page.waitForTimeout(2 * 60 * 1000); // 2mins timeout for provisioning

  // Go to Provisioning tab
  await runStep('Provisioning', page, async () => {

    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByText('Manage & Govern Identities').click();
    await page.getByRole('link', { name: 'Provisioning' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByText('Successfully Provisioned').first().waitFor();
    const rows = page.locator('tbody tr:visible');
    const count = await rows.count();
    console.log(`Provisioning entries found: ${count}`);
    let provisioned = 0;
    let others = 0;
    let details = '\nProvisioning Details:\n\n';
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const identity = (await row.locator('td').nth(0).textContent())?.trim();
      const entitlement = (await row.locator('td').nth(3).textContent())?.trim();
      const status = (await row.locator('td').nth(4).textContent())?.trim();
      const line = `${i + 1}. ${identity} - ${status} (${entitlement})`;
      console.log(line);
      details += line + '\n';
      if (status?.includes('Successfully')) provisioned++;
      else others++;
    }

    details += `\n-----------------------------\n`;
    details += `Provisioned : ${provisioned}\n`;
    details += `Others      : ${others}\n`;
    details += `Total       : ${count}\n`;

    console.log(details);
    return details;   // IMPORTANT: only here
  });
});

// generate PDF after all cases
test.afterAll(async () => {
  generatePDFReport();
});
