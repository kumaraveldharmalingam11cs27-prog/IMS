# Provigent Inventory Management System

A complete full-stack inventory management system built with Python Flask, MySQL, and React.

## Project Structure

```
provigent-inventory/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── inventory.py
│   │   ├── orders.py
│   │   ├── suppliers.py
│   │   └── auth.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── decorators.py
│   │   └── helpers.py
│   └── logs/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
├── database/
│   └── schema.sql
└── .env
```

## Prerequisites

- Python 3.8+
- Node.js 14+
- MySQL 5.7+
- pip & npm

## Setup Instructions

### 1. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE provigent_inventory;
USE provigent_inventory;

# Import schema
SOURCE database/schema.sql;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and configure
# DATABASE_URL=mysql+pymysql://root:password@localhost/provigent_inventory
# FLASK_ENV=development
# SECRET_KEY=your_secret_key

# Run migrations
python app.py

# Start server (runs on http://localhost:5000)
python app.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start
```

## Features

### Dashboard
- Real-time inventory overview
- Stock level alerts
- Order tracking
- Supplier management
- Search and filtering

### Inventory Management
- Add/edit/delete items
- SKU tracking
- Min/max stock levels
- Stock history
- Barcode support

### Order Management
- Create purchase orders
- Track order status
- Auto-generate orders for low stock
- Order history

### Supplier Management
- Supplier database
- Contact management
- Lead time tracking
- Payment terms

### Alerts & Notifications
- Low stock alerts
- Order status updates
- Critical inventory warnings

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Inventory
- `GET /api/inventory` - Get all items
- `GET /api/inventory/<id>` - Get item details
- `POST /api/inventory` - Create item
- `PUT /api/inventory/<id>` - Update item
- `DELETE /api/inventory/<id>` - Delete item
- `GET /api/inventory/search` - Search items

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/<id>` - Update order
- `GET /api/orders/<id>` - Get order details

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/<id>` - Update supplier

### Alerts
- `GET /api/alerts` - Get active alerts
- `POST /api/alerts/dismiss` - Dismiss alert

## Database Schema

### Tables
- `users` - User accounts and authentication
- `inventory_items` - Product inventory
- `suppliers` - Supplier information
- `orders` - Purchase orders
- `order_items` - Items in each order
- `stock_history` - Stock level history
- `alerts` - System alerts

## Technologies Used

### Backend
- Flask - Web framework
- SQLAlchemy - ORM
- PyMySQL - MySQL connector
- JWT - Authentication
- Cors - Cross-origin requests

### Frontend
- React - UI library
- Axios - HTTP client
- Chart.js - Charts and analytics
- Tailwind CSS - Styling

### Database
- MySQL 5.7+

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- SQL injection prevention
- CORS protection
- Rate limiting

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Standards

- Python: PEP 8
- JavaScript: ESLint + Prettier
- Database: Normalized schema

## Deployment

### Docker Setup

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set SECRET_KEY to random value
- [ ] Enable HTTPS
- [ ] Configure database backups
- [ ] Set up logging
- [ ] Enable monitoring
- [ ] Configure email alerts

## Troubleshooting

### Common Issues

**MySQL Connection Error**
- Check database credentials in .env
- Verify MySQL service is running
- Check database exists

**CORS Errors**
- Verify frontend URL in backend config
- Check CORS headers

**Port Already in Use**
- Change port in app.py
- Kill process: `lsof -ti:5000` | `xargs kill -9`

## License

MIT

## Support

For issues and questions, contact support@provigent.com
