# Backend API Security Implementation

## Security Enhancements for Employee Portal

### Current Security Measures

1. **Authentication via JWT Tokens**
   - Users must login to get access token
   - Token contains user ID and role
   - Token required for all API calls

2. **Role-based Access Control**
   - Admin: Full access to all modules
   - Employee: Limited access to employee portal only
   - Managers: Department-specific access

### API Endpoints Security

#### Employee Data Access

**GET `/api/hr/employees/{employee_id}`**
- Returns single employee record
- Frontend MUST pass current user's ID
- Backend validates the employee exists

**GET `/api/hr/attendance?employee_id={id}`**
- Filters attendance by employee_id parameter
- Frontend MUST pass current user's ID
- Returns only that employee's attendance

**GET `/api/hr/leave-requests?employee_id={id}`**
- Filters leave requests by employee_id
- Frontend MUST pass current user's ID
- Returns only that employee's leave requests

**GET `/api/hr/payslips?employee_id={id}`**
- Filters payslips by employee_id
- Frontend MUST pass current user's ID
- Returns only that employee's payslips

**GET `/api/hr/goals?employee_id={id}`**
- Filters goals by employee_id
- Frontend MUST pass current user's ID
- Returns only that employee's goals

**GET `/api/hr/performance-reviews?employee_id={id}`**
- Filters reviews by employee_id
- Frontend MUST pass current user's ID
- Returns only that employee's reviews

### Frontend Security Measures

1. **User ID from LocalStorage**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   const userId = user.id;
   ```

2. **All API Calls Include User ID**
   ```javascript
   await axios.get(`${API}/hr/attendance?employee_id=${userId}`);
   ```

3. **No Direct Access to Other Employees**
   - Employee portal ONLY uses logged-in user's ID
   - No employee list fetching for personal data
   - Team directory shows limited info only

### Data Isolation

**What Employees CAN See:**
- Their own attendance records
- Their own leave requests
- Their own payslips
- Their own goals and performance
- Their own profile
- Department colleagues (name, designation, contact only)
- Reporting manager details

**What Employees CANNOT See:**
- Other employees' attendance
- Other employees' leave requests
- Other employees' payslips
- Other employees' salaries
- Other employees' personal details
- Full employee list with personal data

### Recommended Backend Enhancements

For production deployment, add these backend checks:

#### 1. Token-based User Validation
```python
from fastapi import Depends, HTTPException
from jose import JWTError, jwt

async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
        return user_id
    except JWTError:
        raise HTTPException(status_code=401)
```

#### 2. Employee Data Access Control
```python
@api_router.get("/hr/attendance")
async def get_attendance(
    employee_id: str,
    current_user: str = Depends(get_current_user)
):
    # Verify user can only access their own data
    if current_user != employee_id:
        user = await db.users.find_one({"id": current_user})
        if user["role"] not in ["admin", "hr_manager"]:
            raise HTTPException(
                status_code=403, 
                detail="Access denied"
            )
    
    # Proceed with data fetch
    attendance = await db.attendance.find(
        {"employee_id": employee_id}
    ).to_list(1000)
    return attendance
```

### Session Management

1. **Token Expiration**
   - Access tokens expire after 24 hours
   - Users must re-login after expiration

2. **Logout**
   - Clears localStorage
   - Removes token
   - Redirects to login

### Best Practices

1. **Never Trust Client Input**
   - Validate employee_id on backend
   - Check user role before returning data
   - Log access attempts

2. **Sensitive Data**
   - Salary information: Only for employee or admin
   - Bank details: Only for employee or admin
   - Personal documents: Only for employee or admin

3. **Audit Trail**
   - Log all data access
   - Track who viewed what
   - Monitor unusual access patterns

### Testing Security

**Test Case 1: Employee Access Own Data**
```bash
# Login as employee
curl -X POST ${API}/auth/login \
  -d '{"username":"employee","password":"employee123"}'

# Get own attendance (should work)
curl -X GET ${API}/hr/attendance?employee_id=<user_id> \
  -H "Authorization: Bearer <token>"
```

**Test Case 2: Employee Access Other's Data**
```bash
# Try to access another employee's data
# This should be prevented by frontend
# Backend should validate and reject if attempted
```

### Summary

✅ **Current Implementation:**
- Frontend ensures employees only access own data
- User ID from localStorage used consistently
- Role-based routing (employees → portal only)
- No sidebar navigation for employees

🔒 **Security Level:**
- **Frontend Security:** ✅ Implemented
- **Backend Validation:** ⚠️ Recommended for production
- **Token Authentication:** ✅ Implemented
- **Role-based Access:** ✅ Implemented

### Next Steps for Production

1. Add backend middleware for user validation
2. Implement stricter API access controls
3. Add audit logging
4. Enable HTTPS only
5. Implement rate limiting
6. Add CSRF protection
7. Regular security audits

---

**Current Status: Frontend security is implemented. Backend relies on proper client usage.**
**For production: Add backend validation as described above.**
