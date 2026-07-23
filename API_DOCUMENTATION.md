# Provigent Inventory Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints (except login and register) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## Response Format

All responses are in JSON format:
```json
{
  "message": "Success message",
  "data": {}
}
```

Error responses:
```json
{
  "error": "Error message"
}
```

---

## Authentication Endpoints

### 1. User Login
**POST** `/auth/login`

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@provigent.com",
    "role": "admin"
  }
}
```

### 2. User Registration
**POST** `/auth/register`

Request:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe",
  "role": "staff"
}
```

Response (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics
**GET** `/dashboard/stats`

Query Parameters: None

Response (200):
```json
{
  "total_items": 1247,
  "total_inventory_value": 45320.50,
  "low_stock_count": 4,
  "pending_orders": 8,
  "critical_alerts": 2,
  "warning_alerts": 5
}
```

### 2. Get Active Alerts
**GET** `/dashboard/alerts`

Query Parameters:
- `limit` (optional, default: 10)

Response (200):
```json
[
  {
    "id": 1,
    "alert_type": "low_stock",
    "item_id": 5,
    "item_name": "Coffee Beans",
    "title": "Low stock alert",
    "description": "Coffee Beans stock is below minimum",
    "severity": "warning",
    "is_resolved": false,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### 3. Get Low Stock Items
**GET** `/dashboard/low-stock`

Query Parameters: None

Response (200):
```json
[
  {
    "id": 5,
    "name": "Coffee Beans",
    "sku": "SKU-001",
    "current_quantity": 3,
    "min_quantity": 10,
    "max_quantity": 50,
    "status": "critical"
  }
]
```

### 4. Get Recent Orders
**GET** `/dashboard/recent-orders`

Query Parameters: None

Response (200):
```json
[
  {
    "id": 1,
    "order_number": "ORD-20240115101500",
    "supplier_id": 1,
    "supplier_name": "Fresh Foods Co",
    "order_date": "2024-01-15",
    "status": "pending",
    "total_amount": 1500.00,
    "items": []
  }
]
```

---

## Inventory Endpoints

### 1. Get All Inventory Items
**GET** `/inventory`

Query Parameters:
- `page` (optional, default: 1)
- `per_page` (optional, default: 20)
- `search` (optional) - Search by name, SKU, or barcode
- `category_id` (optional)
- `status` (optional) - Filter by status: critical, warning, good

Response (200):
```json
{
  "items": [
    {
      "id": 1,
      "name": "Coffee Beans",
      "sku": "SKU-001",
      "barcode": "1234567890001",
      "category": "Raw Materials",
      "current_quantity": 3,
      "min_quantity": 10,
      "max_quantity": 50,
      "unit": "kg",
      "unit_cost": 8.50,
      "supplier_id": 1,
      "supplier": "Fresh Foods Co",
      "status": "critical",
      "location": "A1-01",
      "created_at": "2024-01-10T08:00:00"
    }
  ],
  "total": 47,
  "page": 1,
  "per_page": 20
}
```

### 2. Get Item Details
**GET** `/inventory/<item_id>`

Response (200): Single item object (same as above)

### 3. Create Inventory Item
**POST** `/inventory`

Request:
```json
{
  "name": "Coffee Beans",
  "sku": "SKU-001",
  "barcode": "1234567890001",
  "category_id": 1,
  "unit": "kg",
  "min_quantity": 10,
  "max_quantity": 50,
  "reorder_quantity": 25,
  "unit_cost": 8.50,
  "supplier_id": 1,
  "location": "A1-01",
  "description": "High quality arabica coffee beans"
}
```

Response (201): Created item object

### 4. Update Inventory Item
**PUT** `/inventory/<item_id>`

Request: Any fields to update (partial update supported)
```json
{
  "current_quantity": 50,
  "location": "A1-02"
}
```

Response (200): Updated item object

### 5. Delete Inventory Item
**DELETE** `/inventory/<item_id>`

Response (200):
```json
{
  "message": "Item deleted successfully"
}
```

---

## Orders Endpoints

### 1. Get All Orders
**GET** `/orders`

Query Parameters:
- `page` (optional, default: 1)
- `per_page` (optional, default: 20)
- `status` (optional) - draft, pending, confirmed, processing, shipped, delivered, cancelled

Response (200):
```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-20240115101500",
      "supplier_id": 1,
      "supplier_name": "Fresh Foods Co",
      "order_date": "2024-01-15",
      "expected_delivery_date": "2024-01-18",
      "status": "pending",
      "total_amount": 1500.00,
      "notes": "Rush order",
      "created_at": "2024-01-15T10:15:00",
      "items": [
        {
          "id": 1,
          "item_id": 5,
          "item_name": "Coffee Beans",
          "sku": "SKU-001",
          "quantity_ordered": 100,
          "quantity_received": 0,
          "unit_price": 8.50,
          "line_total": 850.00
        }
      ]
    }
  ],
  "total": 15,
  "page": 1
}
```

### 2. Create Purchase Order
**POST** `/orders`

Request:
```json
{
  "supplier_id": 1,
  "expected_delivery_date": "2024-01-20",
  "notes": "Standard order",
  "items": [
    {
      "item_id": 5,
      "quantity": 50,
      "unit_price": 8.50
    },
    {
      "item_id": 6,
      "quantity": 100,
      "unit_price": 1.50
    }
  ]
}
```

Response (201): Created order object

### 3. Update Order Status
**PUT** `/orders/<order_id>`

Request:
```json
{
  "status": "delivered"
}
```

Response (200): Updated order object

---

## Suppliers Endpoints

### 1. Get All Suppliers
**GET** `/suppliers`

Query Parameters:
- `page` (optional, default: 1)
- `per_page` (optional, default: 20)

Response (200):
```json
{
  "suppliers": [
    {
      "id": 1,
      "name": "Fresh Foods Co",
      "contact_person": "John Smith",
      "email": "john@freshfoods.com",
      "phone": "555-0101",
      "address": "123 Food St",
      "city": "Chicago",
      "country": "USA",
      "lead_time_days": 3,
      "rating": 4.5,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 5,
  "page": 1
}
```

### 2. Create Supplier
**POST** `/suppliers`

Request:
```json
{
  "name": "Regional Distributor",
  "contact_person": "Jane Doe",
  "email": "jane@regional.com",
  "phone": "555-0103",
  "address": "456 Supply Ave",
  "city": "Denver",
  "country": "USA",
  "lead_time_days": 5,
  "payment_terms": "Net 30"
}
```

Response (201): Created supplier object

### 3. Update Supplier
**PUT** `/suppliers/<supplier_id>`

Request: Any fields to update

Response (200): Updated supplier object

---

## Stock Adjustment Endpoint

### Adjust Stock
**POST** `/stock/adjust`

Request:
```json
{
  "item_id": 5,
  "quantity": -10,
  "reason": "Damaged goods",
  "notes": "Water damage in warehouse"
}
```

Response (200):
```json
{
  "message": "Stock adjusted",
  "item": {
    "id": 5,
    "name": "Coffee Beans",
    "current_quantity": 3,
    "status": "critical"
  }
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently no rate limiting is enforced. This should be added for production deployments.

---

## Examples

### Example 1: Login and Get Inventory
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Use the returned access_token
curl -X GET http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Example 2: Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "expected_delivery_date": "2024-01-20",
    "items": [
      {
        "item_id": 5,
        "quantity": 50,
        "unit_price": 8.50
      }
    ]
  }'
```

### Example 3: Search Inventory
```bash
curl -X GET "http://localhost:5000/api/inventory?search=coffee&status=critical" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Version History

- **v1.0.0** (2024-01-15) - Initial release
