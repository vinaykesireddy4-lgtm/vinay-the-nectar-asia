# Bulk User Creation Guide for Admins

## Creating Credentials for 50 (or More) Employees

Admin can create user accounts in **TWO WAYS**:

---

## Method 1: Individual User Creation ✅

### Steps:
1. Login as **admin** (admin/admin123)
2. Go to: **Admin → User Management**
3. Click **"Add User"** button
4. Fill in the form:
   - Username (e.g., emp001)
   - Full Name
   - Email
   - Password
   - Role (Employee for regular users)
   - Active (checked)
5. Click **"Create User"**
6. Repeat for each employee

**Best for:** Creating 1-10 users

---

## Method 2: Bulk Import (CSV) 🚀

### Steps:

#### 1. Download Template
1. Login as **admin**
2. Go to **Admin → User Management**
3. Click **"Bulk Import"** button
4. Click **"Download CSV Template"**

#### 2. Fill the Template
Open the downloaded CSV file and fill in employee details:

```csv
username,email,full_name,password,role
emp001,emp001@company.com,John Doe,Welcome@123,employee
emp002,emp002@company.com,Jane Smith,Welcome@123,employee
emp003,emp003@company.com,Bob Johnson,Welcome@123,employee
... (add up to 50 or more employees)
```

**Column Definitions:**
- `username`: Unique username for login (e.g., emp001, emp002)
- `email`: Employee's email address
- `full_name`: Full name of the employee
- `password`: Initial password (employees can change later)
- `role`: User role (use 'employee' for regular employees)

#### 3. Import the Data
1. Copy all the content from your CSV file
2. Paste it in the **CSV Data** text area
3. Click **"Import Users"**
4. Wait for confirmation
5. ✅ All users will be created!

**Best for:** Creating 10+ users at once

---

## CSV Template Format

```csv
username,email,full_name,password,role
emp001,emp001@company.com,Alice Johnson,Pass123!,employee
emp002,emp002@company.com,Bob Smith,Pass123!,employee
emp003,emp003@company.com,Carol Davis,Pass123!,employee
emp004,emp004@company.com,David Wilson,Pass123!,employee
emp005,emp005@company.com,Emma Brown,Pass123!,employee
emp006,emp006@company.com,Frank Miller,Pass123!,employee
emp007,emp007@company.com,Grace Taylor,Pass123!,employee
emp008,emp008@company.com,Henry Moore,Pass123!,employee
emp009,emp009@company.com,Ivy Anderson,Pass123!,employee
emp010,emp010@company.com,Jack Thomas,Pass123!,employee
```

---

## Available Roles

When creating users, you can assign these roles:

1. **employee** - Regular employee (Employee Portal access only)
2. **admin** - Full system access
3. **hr_manager** - HR module access
4. **finance_manager** - Finance module access
5. **inventory_manager** - Inventory module access
6. **sales_manager** - Sales module access
7. **purchase_manager** - Purchase module access

**For regular employees:** Always use `employee` role

---

## Creating 50 Employees - Example

### Option A: Using Excel/Google Sheets

1. Create a spreadsheet with columns:
   - Username | Email | Full Name | Password | Role

2. Fill 50 rows:
   ```
   emp001, emp001@company.com, John Doe, Welcome123, employee
   emp002, emp002@company.com, Jane Smith, Welcome123, employee
   ... (48 more rows)
   ```

3. Copy all rows (excluding header if added)
4. Paste in Bulk Import textarea
5. Click Import

### Option B: Using CSV File

1. Create file: `employees.csv`
2. Add header and 50 employee rows
3. Open file and copy all content
4. Paste in Bulk Import textarea
5. Click Import

---

## Password Guidelines

### Initial Password Suggestions:
- `Welcome@2024` (company standard)
- `FirstName@123` (personalized)
- `Company@123` (simple)
- Random generated (use password generator)

### Security Tips:
✅ Use at least 8 characters
✅ Include letters, numbers, and special characters
✅ Ask employees to change on first login
✅ Don't reuse passwords

---

## After Creating Users

### 1. Notify Employees
Send each employee their credentials:
```
Your login credentials for Employee Portal:

URL: https://mb-manager.preview.emergentagent.com/employee-portal
Username: emp001
Password: Welcome@123

Please change your password after first login.
```

### 2. Create Employee Records
After creating user accounts, also create employee records in:
- **HR → Employees → Add Employee**
- Use the SAME ID as the user ID
- Fill in complete employee information

### 3. Test a Few Accounts
Before notifying all employees:
1. Test 2-3 accounts
2. Verify they can login
3. Check Employee Portal access
4. Confirm data visibility

---

## Managing Users

### View All Users
- Go to **Admin → User Management**
- See complete list with status

### Edit User
- Click **Edit** button (pencil icon)
- Modify details
- Save changes

### Reset Password
- Click **Key** icon next to user
- Enter new password
- User can login with new password

### Deactivate User
- Click **Edit** on user
- Uncheck "Active" checkbox
- Save
- User cannot login anymore

### Delete User
- Click **Delete** button (trash icon)
- Confirm deletion
- User account removed

---

## Export Users

Need a backup or report of all users?

1. Go to **Admin → User Management**
2. Click **"Export Users"** button
3. Download CSV file with all user data
4. Use for:
   - Backup
   - Audit
   - Reporting
   - Sharing with HR

---

## Bulk Import - Step by Step Example

Let's create 5 employees:

**Step 1:** Prepare CSV data
```csv
username,email,full_name,password,role
emp101,emp101@nectar.com,Alice Johnson,Welcome123,employee
emp102,emp102@nectar.com,Bob Smith,Welcome123,employee
emp103,emp103@nectar.com,Carol Davis,Welcome123,employee
emp104,emp104@nectar.com,David Wilson,Welcome123,employee
emp105,emp105@nectar.com,Emma Brown,Welcome123,employee
```

**Step 2:** Login as admin and navigate
- Login: admin / admin123
- Navigate: Admin → User Management

**Step 3:** Open Bulk Import
- Click "Bulk Import" button
- Download template (optional, for reference)

**Step 4:** Paste Data
- Copy the CSV content above
- Paste in the text area

**Step 5:** Import
- Click "Import Users"
- Wait for success message: "Created 5 users. 0 failed."

**Step 6:** Verify
- Check the users list
- You should see all 5 new users

**Step 7:** Notify Employees
- Send login credentials to each employee

---

## Common Issues & Solutions

### Issue: "Username already exists"
**Solution:** Use unique usernames (emp001, emp002, etc.)

### Issue: "Invalid email format"
**Solution:** Use proper email format: name@company.com

### Issue: "Password too short"
**Solution:** Use minimum 8 characters

### Issue: "Bulk import failed"
**Solution:** 
- Check CSV format (comma-separated)
- Ensure no extra spaces
- Include all required fields

### Issue: "User can't login"
**Solution:**
- Verify username and password
- Check if user is Active
- Ensure role is set to 'employee'

---

## Best Practices

### ✅ DO:
- Use consistent username format (emp001, emp002)
- Use company email addresses
- Set strong initial passwords
- Create employee records after user accounts
- Test a few accounts before bulk creation
- Keep backup of user data (export CSV)
- Document passwords securely
- Notify employees about their credentials

### ❌ DON'T:
- Use duplicate usernames
- Use weak passwords
- Share passwords publicly
- Create admin accounts for regular employees
- Skip creating employee records
- Forget to test accounts

---

## Quick Reference

| Action | Steps |
|--------|-------|
| Create 1 user | Admin → User Management → Add User |
| Create 50 users | Admin → User Management → Bulk Import |
| Edit user | Click Edit icon → Modify → Save |
| Reset password | Click Key icon → Enter new password |
| Deactivate user | Edit user → Uncheck Active → Save |
| Export all users | Click Export Users button |
| Download template | Bulk Import → Download CSV Template |

---

## Example: Creating 50 Employees

### Complete CSV for 50 Employees
```csv
username,email,full_name,password,role
emp001,emp001@nectar.com,Employee 001,Welcome@123,employee
emp002,emp002@nectar.com,Employee 002,Welcome@123,employee
emp003,emp003@nectar.com,Employee 003,Welcome@123,employee
emp004,emp004@nectar.com,Employee 004,Welcome@123,employee
emp005,emp005@nectar.com,Employee 005,Welcome@123,employee
... (continue to emp050)
emp050,emp050@nectar.com,Employee 050,Welcome@123,employee
```

---

## Security Reminders

1. **Change Default Passwords:** Ask employees to change passwords on first login
2. **Strong Passwords:** Enforce password complexity rules
3. **Regular Audits:** Review user list periodically
4. **Deactivate Unused:** Disable accounts of former employees
5. **Backup:** Export user data regularly
6. **Monitor:** Check login activity

---

## Support

For assistance with user management:
1. Check this guide
2. Test with a single user first
3. Contact IT support if issues persist

---

**🎉 You can now easily create credentials for 50 or more employees!**

Use the Bulk Import feature to save time and create all accounts at once.
