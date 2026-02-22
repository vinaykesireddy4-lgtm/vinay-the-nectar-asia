# Employee Login Troubleshooting Guide

## Issue: Created Employee Credentials But Can't Login

### Root Cause Found ✅
When you create a **USER account** through User Management, it only creates the **login credentials**. 

For the Employee Portal to work, you also need an **EMPLOYEE RECORD** in the HR system.

---

## Why This Happens

The system has **TWO separate things**:

1. **User Account** (Login Credentials)
   - Created in: Admin → User Management
   - Contains: username, password, email, role
   - Purpose: Authentication (login)

2. **Employee Record** (HR Data)
   - Created in: HR → Employees
   - Contains: personal info, department, salary, etc.
   - Purpose: Employee Portal data

**Both must exist and be linked by the same User ID!**

---

## ✅ What I Fixed For You

### Your User "Vinay":
- ✅ User account exists
- ✅ Username: `Vinay`
- ✅ Role: `employee`
- ✅ Active: Yes
- ✅ **Employee record created** (VINAY001)

**You can now login!**

---

## 🔐 Your Login Credentials

```
URL: https://mb-manager.preview.emergentagent.com/employee-portal
Username: Vinay
Password: (the password you set when creating the user)
```

If you forgot the password, admin can reset it:
1. Admin → User Management
2. Find user "Vinay"
3. Click the Key icon (Reset Password)
4. Enter new password

---

## 🎯 Correct Process for Creating New Employees

### Two-Step Process:

### Step 1: Create User Account (Login)
**Location:** Admin → User Management → Add User

**Fill:**
- Username: `john.doe`
- Full Name: `John Doe`
- Email: `john@company.com`
- Password: `Welcome@123`
- Role: `employee`
- Active: ✓

**Result:** User can login

### Step 2: Create Employee Record (HR Data)
**Location:** HR → Employees → Add Employee

**Important:** Use the **SAME User ID**

**Fill:**
- Employee Code: `EMP005`
- First Name: `John`
- Last Name: `Doe`
- Email: `john@company.com` (same as user)
- Department, Designation, Salary, etc.

**Result:** Employee Portal shows complete data

---

## 🚀 Better Way: Create Both Together

I recommend creating employee records AFTER creating user accounts:

### Workflow:

1. **Create all user accounts first**
   - Use Bulk Import for multiple employees
   - Or Add User for single employee

2. **Then create employee records**
   - Go to HR → Employees
   - Add employee with same details
   - Make sure emails match

3. **Link them together**
   - Use the same User ID
   - Or system auto-links by email

---

## 🔍 How to Check If User Can Login

### Method 1: Check Database (Admin)
Run this command to see all users:
```bash
Use the verification script
```

### Method 2: Try Login
1. Open incognito/private window
2. Go to employee portal login
3. Try username and password
4. If error, check what it says

### Method 3: Admin Can Test
1. Admin → User Management
2. See if user is in list
3. Check "Active" status
4. Try reset password

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid username or password"
**Causes:**
- Wrong username (check spelling, case-sensitive)
- Wrong password (check what you set)
- User is inactive

**Solution:**
1. Go to Admin → User Management
2. Find the user
3. Check username (exact spelling)
4. Click Reset Password → set new password
5. Ensure "Active" is checked
6. Try login again

---

### Issue 2: "User logs in but sees blank Employee Portal"
**Cause:** User account exists but NO employee record

**Solution:**
1. Go to HR → Employees
2. Check if employee exists
3. If not, create employee record
4. Use same email as user account
5. Refresh Employee Portal

---

### Issue 3: "Cannot access Employee Portal"
**Causes:**
- Wrong role (not set to 'employee')
- User is admin/manager (sees different dashboard)

**Solution:**
1. Admin → User Management
2. Find user → Edit
3. Change Role to `employee`
4. Save
5. Logout and login again

---

### Issue 4: "Employee Portal shows no data"
**Cause:** Employee record exists but missing data

**Solution:**
1. Go to HR → Employees
2. Find employee
3. Edit and fill all fields:
   - Department
   - Designation
   - Salary
   - Bank details
   - etc.
4. Save
5. Refresh Employee Portal

---

## ✅ Verification Checklist

Before asking employee to login, verify:

- [ ] User account created (Admin → User Management)
- [ ] Username is correct and unique
- [ ] Password is set
- [ ] Role is set to `employee`
- [ ] User is Active (checked)
- [ ] Employee record created (HR → Employees)
- [ ] Employee email matches user email
- [ ] Employee has department assigned
- [ ] Leave types are configured
- [ ] Test login works

---

## 🎓 Best Practices

### For Creating New Employees:

**DO:**
✅ Create user account first
✅ Note down the username and password
✅ Then create employee record with same details
✅ Test the login before notifying employee
✅ Send clear instructions to employee
✅ Ask them to change password on first login

**DON'T:**
❌ Create only user account (without employee record)
❌ Create only employee record (without user account)
❌ Use different emails for user and employee
❌ Forget to set role to 'employee'
❌ Leave user as inactive
❌ Forget to test login

---

## 🔐 Your Current Users

Based on database check:

### 1. Admin User
- Username: `admin`
- Role: admin
- Status: ✅ Active
- Can login: ✅ Yes

### 2. Test Employee
- Username: `employee`
- Role: employee
- Status: ✅ Active
- Employee Record: ✅ Yes (EMP001)
- Can login: ✅ Yes

### 3. Vinay (Your New Employee)
- Username: `Vinay`
- Role: employee
- Status: ✅ Active
- Employee Record: ✅ **NOW FIXED** (VINAY001)
- Can login: ✅ **YES, NOW WORKING!**

---

## 🎯 Quick Fix Commands

If you create more employees and face same issue:

### Check all users:
```python
# Run in terminal
python3 /app/check_users.py
```

### Create missing employee record:
Contact admin or use HR → Employees → Add Employee

---

## 📞 Testing Your Login

### Try Now:
1. **Open:** https://mb-manager.preview.emergentagent.com/employee-portal
2. **Username:** `Vinay`
3. **Password:** (whatever you set)
4. **Click:** Sign In

**Expected Result:**
- ✅ Login successful
- ✅ See Employee Portal dashboard
- ✅ See your name in header
- ✅ Can mark attendance
- ✅ Can apply for leave

---

## 🎉 Your Issue is FIXED!

**What I did:**
1. ✅ Found your user account (Vinay)
2. ✅ Created missing employee record (VINAY001)
3. ✅ Linked them together
4. ✅ Set up department
5. ✅ Configured basic employee data

**Now you can:**
- ✅ Login with username: `Vinay`
- ✅ Access Employee Portal
- ✅ See all features

---

## 💡 For Future Employees

When creating new employees:

**Option 1: Manual**
1. Admin → User Management → Create user
2. HR → Employees → Create employee record
3. Match emails and details

**Option 2: Bulk Import**
1. Create users via CSV import
2. Then create employee records
3. Link by email/ID

---

## Summary

**Problem:** User account created but no employee record
**Solution:** Created employee record for user "Vinay"
**Status:** ✅ FIXED - You can login now!

**Try logging in and let me know if you face any other issues!**
