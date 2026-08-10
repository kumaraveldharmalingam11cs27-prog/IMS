#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

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

find_python() {
    if command -v python3 >/dev/null 2>&1; then
        echo "python3"
    elif command -v python >/dev/null 2>&1; then
        echo "python"
    elif command -v py >/dev/null 2>&1; then
        echo "py"
    else
        echo ""
    fi
}

find_node() {
    if command -v node >/dev/null 2>&1; then
        echo "node"
    elif command -v npm >/dev/null 2>&1; then
        echo "npm"
    else
        echo ""
    fi
}

PYTHON_BIN="$(find_python)"
NODE_BIN="$(find_node)"

if [ -z "$PYTHON_BIN" ]; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python found: $($PYTHON_BIN --version 2>/dev/null || true)${NC}"

if [ -z "$NODE_BIN" ]; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 14 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $($NODE_BIN --version 2>/dev/null || true)${NC}"

# Check MySQL
if ! command -v mysql >/dev/null 2>&1; then
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
if [ -f "$ROOT_DIR/app.py" ]; then
    backend_dir="$ROOT_DIR"
elif [ -d "$ROOT_DIR/backend" ]; then
    backend_dir="$ROOT_DIR/backend"
else
    mkdir -p "$ROOT_DIR/backend"
    backend_dir="$ROOT_DIR/backend"
fi

cd "$backend_dir"

if [ ! -d "venv" ]; then
    "$PYTHON_BIN" -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠ Virtual environment already exists${NC}"
fi

if [ -f "$ROOT_DIR/requirements.txt" ]; then
    requirements_file="$ROOT_DIR/requirements.txt"
elif [ -f "$backend_dir/requirements.txt" ]; then
    requirements_file="$backend_dir/requirements.txt"
else
    echo -e "${RED}requirements.txt not found.${NC}"
    exit 1
fi

if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
fi

echo "Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r "$requirements_file"
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Setup frontend
echo -e "\n${YELLOW}Setting up frontend...${NC}"
if [ -f "$ROOT_DIR/package.json" ]; then
    frontend_dir="$ROOT_DIR"
elif [ -f "$ROOT_DIR/frontend/package.json" ]; then
    frontend_dir="$ROOT_DIR/frontend"
else
    mkdir -p "$ROOT_DIR/frontend"
    frontend_dir="$ROOT_DIR/frontend"
fi

cd "$frontend_dir"
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
echo "   mysql -u root -p < schema.sql"
echo ""
echo "3. Start the backend server:"
echo "   cd $backend_dir"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python app.py"
echo ""
echo "4. Start the frontend server (in another terminal):"
echo "   cd $frontend_dir"
echo "   npm start"
echo ""
echo -e "${YELLOW}Or use Docker Compose:${NC}"
echo "   docker-compose up -d"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo "   Username: admin"
echo "   Password: admin123"
