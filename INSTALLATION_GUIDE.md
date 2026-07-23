# Provigent Inventory Management System - Installation Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 14+** - [Download here](https://nodejs.org/)
- **MySQL 5.7+** - [Download here](https://www.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation

```bash
python3 --version
node --version
npm --version
mysql --version
```

---

## Installation Steps

### 1. Download/Clone the Project

```bash
# Clone from Git (if available)
git clone https://github.com/yourrepo/provigent-inventory.git
cd provigent-inventory

# Or extract the downloaded ZIP file
```

### 2. Database Setup

#### Windows:

```bash
# Open MySQL command line
mysql -u root -p

# In MySQL shell:
CREATE DATABASE provigent_inventory;
USE provigent_inventory;
SOURCE C:\path\to\database\schema.sql;
```

#### macOS/Linux:

```bash
# Connect to MySQL
mysql -u root -p

# In MySQL shell:
CREATE DATABASE provigent_inventory;
USE provigent_inventory;
SOURCE /path/to/database/schema.sql;
```

### 3. Backend Setup

#### Windows:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
```

Then edit `.env` file:
```
FLASK_ENV=development
DATABASE_URL=mysql+pymysql://root:root@localhost/provigent_inventory
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

#### macOS/Linux:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Then edit `.env` file with your MySQL credentials.

### 4. Frontend Setup

#### Windows:

```bash
cd frontend
npm install
```

#### macOS/Linux:

```bash
cd frontend
npm install
```

### 5. Run the Application

#### Option A: Development Mode

**Terminal 1 - Backend:**

```bash
# Windows
venv\Scripts\activate
python app.py

# macOS/Linux
source venv/bin/activate
python app.py
```

Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

#### Option B: Docker Compose (Recommended for Production)

```bash
docker-compose up -d
```

This will start:
- MySQL on port 3306
- Backend on port 5000
- Frontend on port 3000

---

## Quick Start with Setup Script

### Linux/macOS:

```bash
chmod +x setup.sh
./setup.sh
```

### Windows (PowerShell):

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup.ps1
```

---

## Configuration

### Environment Variables (.env)

```bash
# FLASK SETTINGS
FLASK_ENV=development              # development or production
FLASK_APP=app.py
DEBUG=True                          # Set to False in production

# DATABASE
DATABASE_URL=mysql+pymysql://root:root@localhost/provigent_inventory
# Format: mysql+pymysql://username:password@host:port/database

# SECURITY
SECRET_KEY=change-this-in-production
JWT_SECRET_KEY=change-this-in-production

# CORS
CORS_ORIGINS=http://localhost:3000

# API
API_PORT=5000

# FRONTEND
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### 1. MySQL Connection Error

**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
```bash
# Check MySQL is running
# Windows
mysql -u root -p

# macOS
mysql -u root -p

# Linux
sudo mysql -u root -p
```

**Update .env with correct credentials:**
```
DATABASE_URL=mysql+pymysql://username:password@localhost/provigent_inventory
```

### 2. Port Already in Use

**Error:** `Address already in use`

**Solution:**

Windows:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
# Find process using port 5000
lsof -i :5000

# Kill process (replace PID)
kill -9 <PID>
```

### 3. Python Package Installation Issues

**Error:** `ModuleNotFoundError` or `No module named`

**Solution:**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Clear pip cache
pip cache purge

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### 4. Node Package Issues

**Error:** `npm ERR!`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 5. Frontend Can't Connect to Backend

**Error:** CORS error or API not responding

**Solution:**

1. Check backend is running: `http://localhost:5000`
2. Update `.env` in frontend:
```
REACT_APP_API_URL=http://localhost:5000/api
```
3. Restart frontend: `npm start`

### 6. Database Schema Not Imported

**Error:** Tables don't exist

**Solution:**
```bash
# Manually import schema
mysql -u root -p provigent_inventory < database/schema.sql

# Or in MySQL shell:
USE provigent_inventory;
SOURCE database/schema.sql;
```

---

## Default Credentials

After setup, you can login with:

**Username:** `admin`
**Password:** `admin123`

⚠️ **Important:** Change these credentials immediately in production!

---

## File Structure

```
provigent-inventory/
├── app.py                          # Main Flask application
├── models.py                       # Database models
├── config.py                       # Configuration
├── requirements.txt                # Python dependencies
├── database/
│   └── schema.sql                  # Database schema
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main React component
│   │   └── index.jsx              # Entry point
│   ├── public/
│   ├── package.json               # Node dependencies
│   └── Dockerfile
├── .env                           # Environment variables (create from .env.example)
├── .env.example                   # Environment template
├── docker-compose.yml             # Docker configuration
├── Dockerfile.backend             # Backend Docker image
├── setup.sh                       # Setup script
├── README.md                      # Project README
├── INSTALLATION_GUIDE.md          # This file
└── API_DOCUMENTATION.md           # API docs
```

---

## Testing the Installation

### 1. Test Backend API

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# You should get back an access_token
```

### 2. Test Frontend

Open browser: `http://localhost:3000`

You should see the login page. Login with admin/admin123.

### 3. Test Database

```bash
mysql -u root -p
USE provigent_inventory;
SHOW TABLES;
SELECT * FROM users;
```

---

## Performance Tips

1. **Database Indexing**: Schema includes indexes on frequently queried columns
2. **Pagination**: All list endpoints support pagination
3. **Caching**: Consider implementing Redis for session caching
4. **API Rate Limiting**: Add rate limiting middleware for production
5. **Database Connection Pooling**: Configured in SQLAlchemy

---

## Security Best Practices

1. **Change default credentials** immediately
2. **Use strong SECRET_KEY** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Set DEBUG=False** in production
5. **Use environment variables** for sensitive data
6. **Implement CORS** properly for your domain
7. **Add rate limiting** to API endpoints
8. **Keep dependencies updated**: `pip install --upgrade -r requirements.txt`
9. **Use password hashing**: Built in with bcrypt
10. **Validate all inputs**: Implemented in models

---

## Backup and Restore

### Backup Database

```bash
# Windows
mysqldump -u root -p provigent_inventory > backup.sql

# macOS/Linux
mysqldump -u root -p provigent_inventory > backup.sql
```

### Restore Database

```bash
mysql -u root -p provigent_inventory < backup.sql
```

---

## Deployment

### AWS EC2

1. Launch Ubuntu instance
2. Install prerequisites
3. Clone repository
4. Configure .env
5. Use Docker Compose or manual setup
6. Use Nginx as reverse proxy
7. Enable SSL with Let's Encrypt

### Heroku

1. Create Heroku app
2. Add MySQL add-on
3. Set environment variables
4. Deploy with Git push

### DigitalOcean

1. Create Droplet
2. Install Docker
3. Run Docker Compose
4. Configure reverse proxy

---

## Additional Resources

- **Flask Documentation**: https://flask.palletsprojects.com/
- **React Documentation**: https://react.dev/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **MySQL Documentation**: https://dev.mysql.com/doc/

---

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check logs for error messages
4. Create an issue in GitHub

---

## License

MIT License - See LICENSE file for details
