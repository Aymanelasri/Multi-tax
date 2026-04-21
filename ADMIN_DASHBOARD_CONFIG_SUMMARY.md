# Admin Dashboard (Adminsim) - Configuration Summary

## ✅ Changes Made

### 1. API Service (`dashboard/src/services/api.js`)

**Key Updates:**
- ✅ Uses `process.env.REACT_APP_API_URL` for environment-based configuration
- ✅ Added `credentials: 'include'` for Sanctum authentication
- ✅ Smart 401 redirect logic:
  - Local: `http://localhost:3000/login`
  - Production: `https://simptva.netlify.app/login`
- ✅ Proper error handling for production API responses
- ✅ Logs API URL for debugging

### 2. Environment Files

**Local Development (.env.local)**
```env
PORT=3001
REACT_APP_API_URL=http://127.0.0.1:8000/api
BROWSER=none
```

**Production (.env.production)**
```env
REACT_APP_API_URL=https://app-f6d5947a-9bb0-4180-a020-3fb8fdca859c.cleverapps.io/api
```

### 3. App.js (`dashboard/src/App.js`)

**Key Updates:**
- ✅ Properly parses token/user from URL query parameters
- ✅ Handles JSON parsing of user data
- ✅ Stores credentials in localStorage
- ✅ Cleans up URL after storing
- ✅ Logs API URL for debugging

### 4. _redirects File (`dashboard/public/_redirects`)

**Status:** ✅ Already configured correctly
```
/* /index.html 200
```

---

## 🚀 Deployment Checklist

### Before Deploying to Netlify

- [ ] Verify all files are updated (see above)
- [ ] Test locally: `npm start` on port 3001
- [ ] Test login flow from frontend
- [ ] Check browser console for errors
- [ ] Verify API calls in Network tab

### Netlify Configuration

1. **Environment Variables**
   - [ ] Set `REACT_APP_API_URL=https://app-f6d5947a-9bb0-4180-a020-3fb8fdca859c.cleverapps.io/api`

2. **Build Settings**
   - [ ] Build command: `npm run build`
   - [ ] Publish directory: `build`
   - [ ] Node version: 18+

3. **Deployment**
   - [ ] Connect GitHub repository
   - [ ] Select `dashboard` folder (if monorepo)
   - [ ] Deploy

### After Deployment

- [ ] Test login flow: simptva.netlify.app → adminsim.netlify.app
- [ ] Verify API calls work
- [ ] Check for CORS errors
- [ ] Test token expiration (401 redirect)
- [ ] Monitor Netlify logs

---

## 📡 API Configuration

### Base URL Resolution

```javascript
// Uses this priority:
1. REACT_APP_API_URL environment variable
2. Fallback: http://127.0.0.1:8000/api

// Local: http://127.0.0.1:8000/api
// Production: https://app-f6d5947a-9bb0-4180-a020-3fb8fdca859c.cleverapps.io/api
```

### Request Headers

All API requests include:
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {token}',  // If authenticated
  'credentials': 'include'             // For Sanctum cookies
}
```

---

## 🔐 Authentication Flow

```
Frontend Login (simptva.netlify.app)
    ↓
User submits credentials
    ↓
Backend validates & returns token
    ↓
Frontend redirects to:
https://adminsim.netlify.app?token=XXX&user=YYY
    ↓
App.js captures parameters
    ↓
Stores in localStorage
    ↓
Dashboard displays admin panel
    ↓
All API calls include Bearer token
    ↓
If 401: Clear credentials & redirect to frontend login
```

---

## 🧪 Local Testing

### Terminal 1: Backend
```bash
cd backend
php artisan serve
# http://localhost:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm start
# http://localhost:3000
```

### Terminal 3: Admin Dashboard
```bash
cd dashboard
npm start
# http://localhost:3001
```

### Test Flow
1. Go to http://localhost:3000
2. Login with test credentials
3. Should redirect to http://localhost:3001?token=...&user=...
4. Dashboard should display admin panel
5. Check Network tab for API calls to http://127.0.0.1:8000/api

---

## 🐛 Debugging Tips

### Check API URL
```javascript
// In browser console:
console.log(process.env.REACT_APP_API_URL)
```

### Check Stored Token
```javascript
// In browser console:
localStorage.getItem('token')
localStorage.getItem('user')
```

### Check API Requests
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `/api/...`
4. Check request headers for Authorization
5. Check response status and data

### Check CORS Issues
1. Look for "Access to XMLHttpRequest blocked by CORS" errors
2. Verify backend CORS config includes `https://adminsim.netlify.app`
3. Verify `supports_credentials: true` in backend CORS

---

## 📋 Files Modified

```
dashboard/
├── src/
│   ├── services/
│   │   └── api.js                    ✅ Updated
│   └── App.js                        ✅ Updated
├── public/
│   └── _redirects                    ✅ Verified
├── .env.local                        ✅ Updated
└── .env.production                   ✅ Created
```

---

## 🔗 Related Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Main deployment guide
- [ADMIN_DASHBOARD_DEPLOYMENT.md](./ADMIN_DASHBOARD_DEPLOYMENT.md) - Detailed admin dashboard guide

---

## ✨ Ready for Deployment

All configuration is complete. The Admin Dashboard is ready to:
- ✅ Connect to Clever Cloud backend
- ✅ Handle authentication from frontend
- ✅ Work on Netlify with proper routing
- ✅ Handle token expiration and re-authentication

**Next Step**: Push to GitHub and deploy to Netlify!

```bash
git add .
git commit -m "Configure Admin Dashboard for Netlify deployment"
git push origin main
```
