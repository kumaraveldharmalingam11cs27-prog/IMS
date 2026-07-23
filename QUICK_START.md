# Provigent Inventory Management System - Quick Start Guide

## 📦 What You're Getting

A complete, production-ready inventory management system with:

✅ **Backend**: Flask API with MySQL database  
✅ **Frontend**: React dashboard with modern UI  
✅ **Database**: Pre-configured MySQL schema with sample data  
✅ **Authentication**: JWT-based user authentication  
✅ **Docker**: Docker Compose for one-command deployment  
✅ **Documentation**: Complete API docs and setup guides  

---

## ⚡ 5-Minute Setup (Docker)

### 1. Install Docker & Docker Compose
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. Extract and Start
```bash
# Extract the files
tar -xzf provigent-inventory-system.tar.gz
cd provigent-inventory

# Start everything
docker-compose up -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:3306

### 4. Login
```
Username: admin
Password: admin123
```

---

## 🛠️ Manual Setup (30 Minutes)

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 5.7+

### Step 1: Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE provigent_inventory;
USE provigent_inventory;
SOURCE schema.sql;
```

### Step 2: Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env and update DATABASE_URL

# Run backend
python app.py
```

Backend runs on: **http://localhost:5000**

### Step 3: Frontend Setup

```bash
# In a new terminal
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 📊 Features Overview

### Dashboard
- Real-time inventory statistics
- Active alerts and notifications
- Recent orders tracking
- Low stock items at a glance

### Inventory Management
- Add/edit/delete items
- SKU and barcode tracking
- Min/max stock levels
- Automatic status alerts
- Stock history tracking

### Order Management
- Create purchase orders
- Track order status
- Auto-calculate totals
- Order history

### Supplier Management
- Supplier database
- Contact information
- Lead time tracking
- Performance ratings

### User Management
- Role-based access (admin, manager, staff)
- User authentication with JWT
- Audit logging

---

## 📱 UI Components

### Dashboard Stats
```
┌─────────────────────────────────────────┐
│ Total Items  │ Inventory Value  │ Alerts│
│    1,247     │    $45,320       │   7   │
└─────────────────────────────────────────┘
```

### Active Alerts Panel
```
┌──────────────────────────────┐
│ 🔔 Active Alerts             │
├──────────────────────────────┤
│ • Coffee Beans - Critical    │
│   (3 in stock, min: 10)      │
│ • Paper Cups - Out of Stock  │
│   (0 in stock, min: 50)      │
└──────────────────────────────┘
```

### Recent Orders
```
┌──────────────────────────────────┐
│ 📦 Recent Orders                 │
├──────────────────────────────────┤
│ ORD-2401 | Fresh Foods | Pending │
│ ORD-2400 | West Coast | In Transit│
│ ORD-2399 | Regional | Delivered  │
└──────────────────────────────────┘
```

### Inventory Table
```
Item          SKU      Qty  Min/Max  Status
Coffee        SKU-001  3    10/50    ⚠️ Warning
Paper Cups    SKU-002  0    50/200   🔴 Critical
Milk          SKU-003  24   10/50    ✅ Good
```

---

## 🔑 Default Credentials

| Field | Value |
|-------|-------|
| Username | admin |
| Password | admin123 |
| Email | admin@provigent.com |
| Role | Admin |

⚠️ **IMPORTANT**: Change these in production!

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register
```

### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/alerts
GET    /api/dashboard/low-stock
GET    /api/dashboard/recent-orders
```

### Inventory
```
GET    /api/inventory
GET    /api/inventory/<id>
POST   /api/inventory
PUT    /api/inventory/<id>
DELETE /api/inventory/<id>
```

### Orders
```
GET    /api/orders
POST   /api/orders
PUT    /api/orders/<id>
```

### Suppliers
```
GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/<id>
```

### Stock
```
POST   /api/stock/adjust
```

---

## 📁 File Structure

```
├── app.py                    # Main Flask application
├── models.py                # Database models (SQLAlchemy)
├── config.py                # Flask configuration
├── schema.sql               # MySQL database schema
├── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── App.jsx             # Main React component
│   ├── package.json        # Node.js dependencies
│   └── public/
│
├── docker-compose.yml      # Docker orchestration
├── Dockerfile.backend      # Backend Docker image
├── Dockerfile.frontend     # Frontend Docker image
│
├── README.md               # Project overview
├── INSTALLATION_GUIDE.md   # Detailed setup
├── API_DOCUMENTATION.md    # API reference
└── .env.example            # Environment template
```

---

## 🔧 Configuration

### .env File
```
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=mysql+pymysql://root:root@localhost/provigent_inventory

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📊 Database Schema

### Main Tables
1. **users** - User accounts and roles
2. **suppliers** - Supplier information
3. **categories** - Product categories
4. **inventory_items** - Product inventory
5. **orders** - Purchase orders
6. **order_items** - Items in orders
7. **stock_history** - Stock transaction history
8. **alerts** - System alerts
9. **audit_logs** - Activity logging

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend server running (http://localhost:5000)
- [ ] Frontend app running (http://localhost:3000)
- [ ] Database connected and populated
- [ ] Can login with admin/admin123
- [ ] Dashboard loads with data
- [ ] Can view inventory items
- [ ] Can search for items
- [ ] Can see recent orders
- [ ] Alerts display correctly

---

## 🚀 Common Tasks

### Add New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"newuser",
    "email":"user@example.com",
    "password":"secure123",
    "full_name":"John Doe",
    "role":"staff"
  }'
```

### Search Inventory
Navigate to Inventory tab and use the search bar. Search by:
- Item name
- SKU
- Barcode

### Create Purchase Order
1. Go to Orders tab
2. Click "New Order"
3. Select supplier
4. Add items and quantities
5. Save

### Adjust Stock
Use the API endpoint:
```bash
curl -X POST http://localhost:5000/api/stock/adjust \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": 5,
    "quantity": 10,
    "reason": "Received shipment",
    "notes": "Order ORD-2401"
  }'
```

---

## ⚠️ Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check .env file
cat .env
```

### Frontend won't start
```bash
# Clear cache and node_modules
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
```

### Database connection error
```bash
# Verify MySQL is running
mysql -u root -p

# Check .env DATABASE_URL
# Format: mysql+pymysql://username:password@host/database

# Create database if missing
mysql -u root -p -e "CREATE DATABASE provigent_inventory;"
```

### Port conflicts
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

---

## 📖 Documentation Files

1. **README.md** - Project overview and features
2. **INSTALLATION_GUIDE.md** - Detailed setup instructions
3. **API_DOCUMENTATION.md** - Complete API reference
4. **QUICK_START.md** - This file

---

## 🎯 Next Steps

1. ✅ Complete the 5-minute or 30-minute setup
2. ✅ Login and explore the dashboard
3. ✅ Add some sample inventory items
4. ✅ Create a test order
5. ✅ Customize the UI if needed
6. ✅ Deploy to production when ready

---

## 🔒 Security Recommendations

**Before Production:**
1. Change default password
2. Update SECRET_KEY to random string
3. Set FLASK_ENV=production
4. Enable HTTPS
5. Configure CORS for your domain
6. Add rate limiting
7. Enable database backups
8. Setup monitoring and logging
9. Use strong password policy
10. Keep dependencies updated

---

## 📞 Support

### Getting Help
1. Read the documentation files
2. Check the troubleshooting section
3. Review API documentation
4. Check logs for errors

### Logs Location
```bash
# Backend logs
tail -f app.log

# Frontend console
# Open browser DevTools (F12)
```

---

## 📄 License

MIT License - Free to use and modify

---

## 🎉 Congratulations!

You now have a complete inventory management system ready to use!

**Start using it now:**
1. http://localhost:3000 (Frontend)
2. http://localhost:5000/api (Backend)
3. Credentials: admin / admin123

---

**Questions? Check out the detailed documentation files included in this package!**
