# 18 Bites - Admin Panel

A professional, feature-rich admin panel for the 18 Bites e-commerce platform built with React, Tailwind CSS, and modern best practices.

## 🌟 Features

### ✅ Completed Modules

1. **Authentication & Authorization**
   - Role-based access control (Admin, Super-Admin)
   - Secure login with JWT tokens
   - Session management with local storage

2. **Users Management**
   - View all users with pagination
   - Add new users
   - Edit user details
   - Change user roles (user, admin, super-admin)
   - Toggle user status (active/inactive)
   - Delete users
   - Search and filter functionality

3. **Products Management**
   - View all products with pagination
   - Add new products with image upload
   - Edit product details
   - Bulk CSV upload for products
   - Manual photo uploads
   - Set product status (active/inactive)
   - Category assignment
   - Search functionality

4. **Categories Management**
   - View all categories
   - Add new categories
   - Edit category details
   - Delete categories
   - View product count per category
   - Search and pagination

5. **Home Configuration**
   - Banner management (add, edit, delete)
   - Video iframe configuration
   - Banner image uploads
   - Multiple banners support
   - Banner preview

6. **Orders Management**
   - View all orders
   - Order status tracking (pending, processing, shipped, delivered, cancelled)
   - Update order status
   - View order details and items
   - Customer information
   - Order totals and tax calculation
   - Search and filter by status
   - Date-based sorting

7. **Coupons Management**
   - Create discount coupons
   - Percentage and fixed amount discounts
   - Coupon code validation
   - Set minimum order value
   - Set maximum discount cap
   - Expiry date management
   - Usage limit control
   - Coupon status toggle
   - Copy coupon code to clipboard
   - Search functionality

8. **Reviews Management**
   - View all customer reviews
   - Star rating display
   - Filter by rating
   - View full review details
   - Delete reviews
   - Customer information
   - Product review association
   - Date tracking

9. **Dashboard**
   - Overview statistics
   - Total users, active users
   - Total products, active products
   - Total orders, pending orders
   - Revenue tracking
   - Quick action cards
   - Responsive design

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Button.jsx       # Button component
│   │   ├── Modal.jsx        # Modal dialog component
│   │   ├── DataTable.jsx    # Data table with pagination
│   │   ├── Input.jsx        # Form inputs
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── Header.jsx       # Top header
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Products.jsx
│   │   ├── Categories.jsx
│   │   ├── HomeConfig.jsx
│   │   ├── Orders.jsx
│   │   ├── Coupons.jsx
│   │   └── Reviews.jsx
│   ├── store/               # Zustand stores
│   │   └── authStore.js
│   ├── routes/              # Route protection
│   │   └── ProtectedRoute.jsx
│   ├── lib/                 # Utilities
│   │   └── api.js          # Axios API client
│   ├── utils/               # Helper functions
│   │   └── classNames.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML entry point
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── package.json             # Dependencies
├── .env.example             # Environment template
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_API_TIMEOUT=10000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

## 📦 Dependencies

- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **zustand** - State management
- **react-hook-form** - Form management
- **react-hot-toast** - Toast notifications
- **lucide-react** - Icons
- **tailwindcss** - Styling
- **date-fns** - Date utilities

## 🔐 Authentication

The admin panel uses JWT token-based authentication:

1. Login with admin/super-admin credentials
2. Token is stored in localStorage
3. Automatically attached to all API requests
4. Token expiration triggers re-login

### Role-Based Access

- **User** - Cannot access admin panel
- **Admin** - Full access to all modules
- **Super-Admin** - Full access with all permissions

## 🎨 Design System

### Colors

- **Primary** - Blue (#0ea5e9)
- **Secondary** - Orange/Amber (#f59e0b)
- **Success** - Green (#10b981)
- **Danger** - Red (#ef4444)
- **Warning** - Yellow (#f59e0b)

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Adaptive sidebar and navigation

## 🔄 API Integration

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
- `POST /admin/auth/login` - Login
- `POST /admin/auth/logout` - Logout
- `GET /admin/auth/verify` - Verify token

### Resource Endpoints
- `/admin/users` - Users CRUD
- `/admin/products` - Products CRUD
- `/admin/products/bulk-upload` - Bulk product upload
- `/admin/categories` - Categories CRUD
- `/admin/homeconfig` - Home configuration
- `/admin/homeconfig/banners` - Banners CRUD
- `/admin/homeconfig/video` - Video configuration
- `/admin/orders` - Orders management
- `/admin/coupons` - Coupons CRUD
- `/admin/reviews` - Reviews management
- `/admin/dashboard/stats` - Dashboard statistics

## 📝 Form Validation

Forms use `react-hook-form` for validation:

- Required field validation
- Email format validation
- Number validation
- File type validation
- Date validation
- Custom error messages

## 🎯 Key Features

### Reusable Components

1. **Button** - Variants: primary, secondary, danger, success, outline
2. **Modal** - Configurable dialog with backdrop
3. **DataTable** - Pagination, sorting, search
4. **Input** - Text, email, number, password, file
5. **Select** - Dropdown selection
6. **Textarea** - Multi-line text input

### State Management

- Zustand for auth state
- React hooks for local state
- API response caching via axios

### Error Handling

- Global error interceptor
- Toast notifications for user feedback
- Validation error messages
- Network error handling

## 🔄 API Response Format

All endpoints return:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## 🚀 Performance Optimizations

- Code splitting with React Router
- Lazy loading of pages
- Optimized images and assets
- Pagination for large datasets
- Memoization of components
- API request caching

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐛 Common Issues

### "401 Unauthorized"
- Token expired - Login again
- Invalid credentials - Check email/password

### "403 Forbidden"
- User role doesn't have permission
- Contact super-admin for access

### "Network Error"
- Check API server is running
- Verify VITE_API_BASE_URL in .env
- Check CORS settings

## 📚 Documentation

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add sidebar link in `src/components/Sidebar.jsx`
4. Implement API calls using `api` client

### Creating a Custom Component

```jsx
import { forwardRef } from 'react';

const CustomComponent = forwardRef(({ prop1, prop2, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {/* Component content */}
    </div>
  );
});

CustomComponent.displayName = 'CustomComponent';
export default CustomComponent;
```

### API Request Example

```jsx
import api from '../lib/api';

const fetchData = async () => {
  try {
    const { data } = await api.get('/admin/endpoint', {
      params: { page: 1, limit: 10 }
    });
    console.log(data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For issues and questions, contact the development team.

---

**Last Updated:** February 2024
**Version:** 1.0.0