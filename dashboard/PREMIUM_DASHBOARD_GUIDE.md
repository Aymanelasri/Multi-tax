# Premium SaaS Admin Dashboard - Setup Guide

## 🎨 Design Overview

A modern, premium SaaS admin dashboard with:
- **Glassmorphism UI** with backdrop blur effects
- **Floating Sidebar** with 1.5rem margin and rounded corners
- **Deep Navy Theme** (#020617) with Indigo/Violet accents
- **Responsive Layout** with smooth transitions
- **Interactive Charts** and expandable user companies list

## 📦 Installation

### 1. Install Dependencies
```bash
cd dashboard
npm install
```

This will install:
- React 19
- Tailwind CSS 3.4
- PostCSS & Autoprefixer
- Recharts for charts

### 2. Start Development Server
```bash
npm start
```

The dashboard will run at `http://localhost:3001`

## 🏗️ Project Structure

```
src/
├── pages/
│   └── AdminDashboardPremium.jsx    # Main dashboard component
├── components/
│   └── AdminSidebarPremium.jsx      # Floating sidebar with navigation
├── context/
│   └── LanguageContext.js           # i18n support (FR/EN)
├── services/
│   └── auth.js                      # Authentication helpers
├── App.js                           # Main app wrapper
├── App.css                          # Global styles
├── index.css                        # Tailwind directives
├── index.js                         # React entry point
└── public/
    └── index.html                   # HTML template

tailwind.config.js                   # Tailwind configuration
postcss.config.js                    # PostCSS configuration
package.json                         # Dependencies
```

## 🎯 Key Features

### Sidebar (AdminSidebarPremium.jsx)
- ✅ Floating design with glassmorphism
- ✅ User profile section with avatar
- ✅ 6 navigation items with icons
- ✅ Language toggle (FR/EN)
- ✅ Logout button
- ✅ Active state indicators

### Dashboard Tabs

#### 1. Overview
- 4 KPI cards with soft glowing borders
- Registration trend area chart
- User distribution donut chart
- Smooth animations and hover effects

#### 2. Sociétés (Companies)
- **Expandable user list** showing:
  - User name, email, company count
  - User status (approved/pending)
- **Expandable companies section** displaying:
  - Company name and IF (Fiscal ID)
  - Join date
  - Status (active/pending/inactive)
  - Clean table layout

#### 3. Users
- User table with sorting
- Status badges
- Join date display
- Responsive design

#### 4. Pending
- Empty state placeholder
- Ready for pending approvals

#### 5. Messages
- Empty state placeholder
- Ready for contact messages

#### 6. Settings
- User profile display
- Account information

## 🎨 Design System

### Color Palette
```
Primary: Indigo-500 (#6366f1) → Violet-600 (#7c3aed)
Success: Emerald-500 (#10b981)
Warning: Amber-500 (#f59e0b)
Error: Red-500 (#ef4444)
Background: Slate-950 (#020617)
Surface: Slate-900 (#0f172a)
Border: Slate-700 (#334155)
```

### Typography
- **Font**: Inter, Plus Jakarta Sans
- **Headings**: Bold (700-900 weight)
- **Body**: Regular (400-500 weight)
- **Labels**: Semibold (600 weight)

### Components
- **Cards**: Glassmorphic with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Badges**: Colored with opacity backgrounds
- **Inputs**: Dark with subtle borders
- **Tables**: Striped rows with hover effects

## 🔐 Authentication

The dashboard checks for:
1. Valid JWT token in localStorage
2. User object with `role === 'admin'`
3. Redirects to login if not authenticated

### Login Flow
```
Frontend Login → Backend Auth → Token + User stored
                                ↓
Dashboard receives token via URL params
                                ↓
Stores in localStorage
                                ↓
Checks on mount → Renders dashboard
```

## 🌐 Internationalization

Supports French (FR) and English (EN):
- Toggle via language button in sidebar
- Stored in localStorage
- All labels translated in LanguageContext

## 📱 Responsive Design

- **Desktop**: Full sidebar + main content
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Sidebar collapses (ready for implementation)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Creates optimized build in `build/` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag build folder to netlify.com
```

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      // Add custom colors here
    }
  }
}
```

### Add New Navigation Items
Edit `AdminSidebarPremium.jsx`:
```js
const navItems = [
  { id: 'new-tab', label: 'New Tab', icon: '🎯', color: 'indigo' },
  // ...
]
```

### Modify Dashboard Content
Edit `AdminDashboardPremium.jsx` and add new tab logic:
```js
{activeTab === 'new-tab' && (
  <div>
    {/* Your content here */}
  </div>
)}
```

## 📊 Mock Data

Currently using mock data for:
- User statistics
- User list with companies
- Company details

To connect to real API:
1. Replace mock data with API calls
2. Use `useEffect` to fetch data
3. Handle loading and error states

## 🐛 Troubleshooting

### Tailwind CSS not working
- Ensure `npm install` completed successfully
- Check `tailwind.config.js` content paths
- Restart dev server: `npm start`

### Sidebar not showing
- Check `AdminSidebarPremium.jsx` import in `AdminDashboardPremium.jsx`
- Verify Tailwind classes are applied
- Check browser console for errors

### Authentication failing
- Verify token is in localStorage
- Check user object has `role === 'admin'`
- Ensure login URL is correct

## 📝 Notes

- All components use Tailwind CSS for styling
- No external CSS files needed (except index.css for Tailwind directives)
- Responsive design ready for mobile implementation
- Glassmorphism effects work best on modern browsers
- Smooth animations enhance user experience

## 🎓 Learning Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [Recharts Docs](https://recharts.org)

---

**Version**: 1.0.0 (Premium SaaS)
**Last Updated**: 2024
**Status**: Production Ready ✅
