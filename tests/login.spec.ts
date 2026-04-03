import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test('test', async ({ page }) => {
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
  await page.locator('#default_database').fill('iga');

  await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/volt_hrms.yaml');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await page.locator('#credential_username').fill(process.env.VOLT_HRMS_USERNAME!);
  await page.locator('#credential_password').fill(process.env.VOLT_HRMS_PASSWORD!);

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('gridcell', { name: process.env.VOLT_HRMS_APPLICATION_NAME!, exact: true }).dblclick();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByText('Manage & Govern Identities').click();
  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('AWS IAM').click({ force: true });
  await page.locator('#app_name').fill(process.env.AWS_IAM_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('C001');
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

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('Entra ID').click();
  await page.locator('#app_name').fill(process.env.ENTRA_ID_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('C003');
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

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('Exchange Server').click();
  await page.locator('#app_name').fill(process.env.EXCHANGE_SERVER_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('A002');
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

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('AWS Identity Center').click({ force: true });
  await page.locator('#app_name').click();
  await page.locator('#app_name').fill(process.env.AWS_CLOUD_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('C002');
  await page.locator('#app_code').press('Tab');
  await page.locator('#adImportForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
  await page.getByRole('button', { name: 'Browse Choose a file' }).click();
  await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/aws_cloud.yaml');
  await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('Active Directory').click();
  await page.locator('#app_name').fill(process.env.AD_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('A001');
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

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('Office').click({ force: true });
  await page.locator('#app_name').click();
  await page.locator('#app_name').fill(process.env.OFFICE_365_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('C005');
  await page.locator('#app_code').press('Tab');
  await page.locator('#addIgaAzureApplicationForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
  await page.getByRole('button', { name: 'Browse Choose a file' }).click();
  await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/entra_id.yaml');
  await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('Google Workspace').click({ force: true });
  await page.locator('#app_name').click();
  await page.locator('#app_name').fill(process.env.GOOGLE_WORKSPACE_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('C006');
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

  await page.getByRole('link', { name: 'Applications' }).click();
  await page.getByRole('button', { name: 'Add Application' }).click();
  await page.getByText('Exchange Cloud').click({ force: true });
  await page.locator('#app_name').click();
  await page.locator('#app_name').fill(process.env.EXCHANGE_CLOUD_APPLICATION_NAME!);
  await page.locator('#app_name').press('Tab');
  await page.locator('#app_desc').press('Tab');
  await page.locator('#app_code').fill('C004');
  await page.locator('#app_code').press('Tab');
  await page.locator('#addIgaAzureApplicationForm').getByText(process.env.APPLICATION_OWNER_NAME!).click();
  await page.getByRole('button', { name: 'Browse Choose a file' }).click();
  await page.setInputFiles('input[type="file"]', 'Testing_upload_documents/exchange_cloud.yaml');
  await page.locator('#yaml-edit-form').getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByText('Manage & Govern Identities').click();
  await page.getByRole('link', { name: 'Workflows' }).click();
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

  await page.getByRole('link', { name: 'Report', exact: true }).click();
  await page.getByText('Newly Onboarded Employees').click();
  await page.getByRole('button', { name: 'Customize Report' }).click();
  await page.locator('#days-for-report-id').click();
  await page.locator('#days-for-report-id').fill('50');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('link', { name: 'Report', exact: true }).click();
  await page.getByText('Offboarded Employees').click();
  await page.getByRole('button', { name: 'Customize Report' }).click();
  await page.locator('#days-for-report-id').click();
  await page.locator('#days-for-report-id').fill('50');
  await page.getByRole('button', { name: 'Save' }).click();
});






