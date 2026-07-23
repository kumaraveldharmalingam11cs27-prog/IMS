#!/bin/bash

echo "======================================"
echo "Provigent Inventory Setup Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 14 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL client not found. Make sure MySQL server is running.${NC}"
fi

# Create .env file
echo -e "\n${YELLOW}Creating .env file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
fi

# Setup backend
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd backend 2>/dev/null || mkdir -p backend && cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r ../requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Setup frontend
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd ../frontend 2>/dev/null || (cd .. && mkdir -p frontend && cd frontend)

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Node modules already exist${NC}"
fi

echo -e "\n${GREEN}======================================"
echo "Setup Complete!"
echo "======================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Configure your MySQL database in .env file"
echo "2. Import the database schema:"
echo "   mysql -u root -p < database/schema.sql"
echo ""
echo "3. Start the backend server:"
echo "   cd backend"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python app.py"
echo ""
echo "4. Start the frontend server (in another terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo -e "${YELLOW}Or use Docker Compose:${NC}"
echo "   docker-compose up -d"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo "   Username: admin"
echo "   Password: admin123"
