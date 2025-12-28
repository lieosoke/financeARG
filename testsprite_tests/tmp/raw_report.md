
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** finance-arg
- **Date:** 2025-12-28
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** Successful login with valid credentials
- **Test Code:** [TC001_Successful_login_with_valid_credentials.py](./TC001_Successful_login_with_valid_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/d19884f7-3c49-46de-aae2-18ba7ac1a979
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Login failure with incorrect credentials
- **Test Code:** [TC002_Login_failure_with_incorrect_credentials.py](./TC002_Login_failure_with_incorrect_credentials.py)
- **Test Error:** Login validation failed: invalid credentials were accepted and redirected to dashboard without error message. Cannot verify login failure and error message display as required. Reporting issue and stopping further testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/75188374-b0fc-443a-a2e3-3e71fc1f9adb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Role-based access control enforcement
- **Test Code:** [TC003_Role_based_access_control_enforcement.py](./TC003_Role_based_access_control_enforcement.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/54f5290c-fde4-45b6-90ff-530de0a08afe
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Jamaah registration with valid data
- **Test Code:** [TC004_Jamaah_registration_with_valid_data.py](./TC004_Jamaah_registration_with_valid_data.py)
- **Test Error:** The Jamaah registration form failed to load after multiple attempts, showing only a loading spinner. This prevents completing the registration flow test including form validation, package assignment, and payment status initialization. Reporting this issue and stopping further testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/871f8cf1-5691-405e-9808-1e373334fe7f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Jamaah registration form validation error handling
- **Test Code:** [TC005_Jamaah_registration_form_validation_error_handling.py](./TC005_Jamaah_registration_form_validation_error_handling.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/141b0096-9792-4f87-937d-eb1bdbce196f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Package management CRUD operations
- **Test Code:** [TC006_Package_management_CRUD_operations.py](./TC006_Package_management_CRUD_operations.py)
- **Test Error:** Testing stopped due to the package creation form not loading on the 'Buat Paket Baru' page, blocking further CRUD operations testing for travel packages.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[WARNING] The specified value "12/10/2025" does not conform to the required format, "yyyy-MM-dd". (at :6328:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/8bb9c33b-6bee-449e-b88c-0b6a6dfe8029
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Income transaction recording and status update
- **Test Code:** [TC007_Income_transaction_recording_and_status_update.py](./TC007_Income_transaction_recording_and_status_update.py)
- **Test Error:** The test to verify that finance role users can record income transactions and that payment status updates correctly and dashboard metrics refresh cannot be completed. The Income Management page is stuck on a loading spinner with no interactive elements visible, preventing form input and transaction recording. Please investigate the loading issue to enable further testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/874643ed-61d9-4ff8-8b29-f699809fce6e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Expense transaction recording with category validation
- **Test Code:** [TC008_Expense_transaction_recording_with_category_validation.py](./TC008_Expense_transaction_recording_with_category_validation.py)
- **Test Error:** Testing stopped due to navigation issue preventing access to Expense Management page. Unable to verify adding and validating expense records as finance role user. Please investigate the navigation or permission issue.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/3b92d10d-0bb8-47e0-a1d4-224a22cec8d5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Vendor debt creation and payment recording
- **Test Code:** [TC009_Vendor_debt_creation_and_payment_recording.py](./TC009_Vendor_debt_creation_and_payment_recording.py)
- **Test Error:** Testing stopped due to navigation issue preventing access to Vendor Debt Management page. Cannot verify vendor debt creation, payment recording, or payment history updates.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/41dfc7f9-a51b-4e84-8eb4-92b64b9e5d5f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Comprehensive financial report generation and export
- **Test Code:** [TC010_Comprehensive_financial_report_generation_and_export.py](./TC010_Comprehensive_financial_report_generation_and_export.py)
- **Test Error:** The user successfully logged in and navigated to the reports section. They generated the 'Laba/Rugi per Paket' (Profit & Loss) report and applied a package filter 'ARF9D - Paket Arafah 9 Day'. The report data including total revenue, expenses, net profit, and margin were visible and consistent with the filter. Then, the user navigated to the 'Budget vs Actual' report, applied the same package filter, and verified the budget, actual, variance, and status data were displayed correctly. However, no export functionality was found on the report pages to test exporting reports to PDF or Excel. Therefore, the task to verify report generation with filters was completed successfully, but the export functionality could not be verified. Task success is set to false due to incomplete export verification.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:5173/node_modules/.vite/deps/recharts.js?v=cbf8932f:9015:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:5173/node_modules/.vite/deps/recharts.js?v=cbf8932f:9015:16)
[WARNING] The width(-1) and height(-1) of chart should be greater than 0,
       please check the style of container, or the props width(100%) and height(100%),
       or add a minWidth(0) or minHeight(undefined) or use aspect(undefined) to control the
       height and width. (at http://localhost:5173/node_modules/.vite/deps/recharts.js?v=cbf8932f:9015:16)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/f1b46e17-35f4-4545-a936-434476df455e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** User profile viewing and editing
- **Test Code:** [TC011_User_profile_viewing_and_editing.py](./TC011_User_profile_viewing_and_editing.py)
- **Test Error:** Profile viewing and editing with valid data succeeded. However, validation for invalid email input did not trigger, allowing invalid data to be saved without error. This is a critical issue that must be addressed. Reporting the issue and stopping further testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/1c0b9d50-0276-4584-8db0-eb15dc81ca2f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Company settings configuration and validation
- **Test Code:** [TC012_Company_settings_configuration_and_validation.py](./TC012_Company_settings_configuration_and_validation.py)
- **Test Error:** The task to verify authorized users can update company information and configurations with validation and settings persistence could not be fully completed. Although login and navigation to the Company Settings page were successful, the page intermittently failed to load or render properly, showing only a loading spinner and no editable fields. This prevented updating company information, submitting changes, and verifying validation or persistence. Further investigation and fixing of the page loading issue is required before this task can be completed successfully.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element. isLoading isloading (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=cbf8932f:2402:25)
[ERROR] React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element. isLoading isloading (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=cbf8932f:2402:25)
[ERROR] React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element. isLoading isloading (at http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=cbf8932f:2402:25)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/f75874b9-b1e6-420a-9da9-0720ed511d58
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Dashboard displays real-time financial and operational metrics
- **Test Code:** [TC013_Dashboard_displays_real_time_financial_and_operational_metrics.py](./TC013_Dashboard_displays_real_time_financial_and_operational_metrics.py)
- **Test Error:** Dashboard page loaded with summary financial metrics and recent transactions visible. However, charts remain placeholders without data and attempts to simulate new transactions failed as no input forms or updates appeared. Dashboard does not update in real-time as expected. Reporting this issue and stopping further testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/39966a26-d8f8-41c5-9316-b02b29005182
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Notifications delivery and display
- **Test Code:** [TC014_Notifications_delivery_and_display.py](./TC014_Notifications_delivery_and_display.py)
- **Test Error:** Testing stopped due to the page being stuck on loading spinner after login and navigation attempts. Unable to proceed with verifying payment reminder notifications and system alerts.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/2d760ded-3bb0-4ce8-b434-6cf55c430373
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Global search functionality accuracy
- **Test Code:** [TC015_Global_search_functionality_accuracy.py](./TC015_Global_search_functionality_accuracy.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/da34cab3-061d-4e6a-831f-5b1724722481
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** Security test: session management and token encryption
- **Test Code:** [TC016_Security_test_session_management_and_token_encryption.py](./TC016_Security_test_session_management_and_token_encryption.py)
- **Test Error:** The application under test shows critical issues preventing verification of session and authentication token management. No authentication tokens were found in localStorage, sessionStorage, or cookies after login. Attempts to access protected API endpoints resulted in 404 Not Found errors. Navigation back to the dashboard or session management UI also results in unexpected 404 errors. These issues prevent further testing of token encryption, secure storage, expiration, and session timeout handling. Please address these application errors and provide accessible endpoints and token management mechanisms for proper security testing.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[WARNING] No routes matched location "/api/protected"  (at http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=cbf8932f:635:48)
[WARNING] No routes matched location "/api/protected"  (at http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=cbf8932f:635:48)
[ERROR] Error handled by React Router default ErrorBoundary: ErrorResponseImpl (at http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=cbf8932f:6162:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/29a0808b-c753-442c-a48c-705987b86e8d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017
- **Test Name:** Data validation compliance with Indonesian financial standards
- **Test Code:** [TC017_Data_validation_compliance_with_Indonesian_financial_standards.py](./TC017_Data_validation_compliance_with_Indonesian_financial_standards.py)
- **Test Error:** Tested currency input validation for Indonesian Rupiah in the 'Jumlah' field. The system failed to reject invalid decimal currency input and did not show validation errors. This is a critical issue violating local currency formatting standards. Stopping further tests. NPWP tax ID validation was not tested due to this failure.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/68466ec2-3f83-4ddb-ae7c-e221f02b1a71
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** API endpoint security and role-based access enforcement
- **Test Code:** [TC018_API_endpoint_security_and_role_based_access_enforcement.py](./TC018_API_endpoint_security_and_role_based_access_enforcement.py)
- **Test Error:** Testing stopped due to inability to interact with UI elements and identify protected API endpoints for authentication and authorization enforcement. Please check the application UI and API endpoint availability.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://127.0.0.1:7242/ingest/8f679fdf-6103-4115-a0b5-7a85457c4057:0:0)
[WARNING] No routes matched location "/api/protected-endpoint"  (at http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=cbf8932f:635:48)
[WARNING] No routes matched location "/api/protected-endpoint"  (at http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=cbf8932f:635:48)
[ERROR] Error handled by React Router default ErrorBoundary: ErrorResponseImpl (at http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=cbf8932f:6162:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b4e6dd2e-9490-44f0-8cf8-32c1f78715d5/db5c79b8-a80c-40ad-9313-d308825c5ebf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **22.22** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---