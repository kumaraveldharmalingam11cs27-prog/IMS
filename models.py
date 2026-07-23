from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120))
    role = db.Column(db.String(20), default='staff')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    contact_person = db.Column(db.String(120))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(50))
    website = db.Column(db.String(255))
    payment_terms = db.Column(db.String(100))
    lead_time_days = db.Column(db.Integer, default=7)
    rating = db.Column(db.Numeric(3, 2))
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    inventory_items = db.relationship('InventoryItem', backref='supplier', lazy='dynamic')
    orders = db.relationship('Order', backref='supplier', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_person': self.contact_person,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'lead_time_days': self.lead_time_days,
            'rating': float(self.rating) if self.rating else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    inventory_items = db.relationship('InventoryItem', backref='category', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    sku = db.Column(db.String(50), unique=True, nullable=False, index=True)
    barcode = db.Column(db.String(100), index=True)
    description = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    unit = db.Column(db.String(20), default='piece')
    current_quantity = db.Column(db.Integer, default=0, index=True)
    min_quantity = db.Column(db.Integer, default=10)
    max_quantity = db.Column(db.Integer, default=100)
    reorder_quantity = db.Column(db.Integer, default=50)
    unit_cost = db.Column(db.Numeric(10, 2))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    last_restocked = db.Column(db.DateTime)
    expiry_date = db.Column(db.Date)
    location = db.Column(db.String(100))
    notes = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    stock_history = db.relationship('StockHistory', backref='inventory_item', lazy='dynamic', cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', backref='inventory_item', lazy='dynamic')
    
    @property
    def status(self):
        if self.current_quantity == 0:
            return 'critical'
        elif self.current_quantity <= self.min_quantity:
            return 'critical'
        elif self.current_quantity <= (self.min_quantity + (self.max_quantity - self.min_quantity) * 0.3):
            return 'warning'
        else:
            return 'good'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'barcode': self.barcode,
            'category_id': self.category_id,
            'category': self.category.name if self.category else None,
            'current_quantity': self.current_quantity,
            'min_quantity': self.min_quantity,
            'max_quantity': self.max_quantity,
            'reorder_quantity': self.reorder_quantity,
            'unit': self.unit,
            'unit_cost': float(self.unit_cost) if self.unit_cost else None,
            'supplier_id': self.supplier_id,
            'supplier': self.supplier.name if self.supplier else None,
            'status': self.status,
            'location': self.location,
            'created_at': self.created_at.isoformat()
        }

class StockHistory(db.Model):
    __tablename__ = 'stock_history'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id', ondelete='CASCADE'), nullable=False, index=True)
    previous_quantity = db.Column(db.Integer)
    new_quantity = db.Column(db.Integer)
    transaction_type = db.Column(db.String(20), default='sale', index=True)
    quantity_change = db.Column(db.Integer)
    reference_id = db.Column(db.String(50))
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    created_user = db.relationship('User', backref='stock_histories')
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'previous_quantity': self.previous_quantity,
            'new_quantity': self.new_quantity,
            'transaction_type': self.transaction_type,
            'quantity_change': self.quantity_change,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat()
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False, index=True)
    order_date = db.Column(db.Date, default=datetime.utcnow, index=True)
    expected_delivery_date = db.Column(db.Date)
    actual_delivery_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='draft', index=True)
    total_amount = db.Column(db.Numeric(12, 2))
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    order_items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    created_user = db.relationship('User', backref='orders')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'expected_delivery_date': self.expected_delivery_date.isoformat() if self.expected_delivery_date else None,
            'status': self.status,
            'total_amount': float(self.total_amount) if self.total_amount else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'items': [item.to_dict() for item in self.order_items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'), nullable=False, index=True)
    quantity_ordered = db.Column(db.Integer, nullable=False)
    quantity_received = db.Column(db.Integer, default=0)
    unit_price = db.Column(db.Numeric(10, 2))
    line_total = db.Column(db.Numeric(12, 2))
    received_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'item_name': self.inventory_item.name if self.inventory_item else None,
            'sku': self.inventory_item.sku if self.inventory_item else None,
            'quantity_ordered': self.quantity_ordered,
            'quantity_received': self.quantity_received,
            'unit_price': float(self.unit_price) if self.unit_price else None,
            'line_total': float(self.line_total) if self.line_total else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(20), default='low_stock', index=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    severity = db.Column(db.String(20), default='warning', index=True)
    is_resolved = db.Column(db.Boolean, default=False, index=True)
    resolved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    inventory_item = db.relationship('InventoryItem')
    purchase_order = db.relationship('Order')
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'item_id': self.item_id,
            'item_name': self.inventory_item.name if self.inventory_item else None,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat()
        }

class StockAdjustment(db.Model):
    __tablename__ = 'stock_adjustments'
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id', ondelete='CASCADE'), nullable=False, index=True)
    adjustment_quantity = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(200))
    notes = db.Column(db.Text)
    adjusted_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    adjusted_user = db.relationship('User', backref='stock_adjustments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_id': self.item_id,
            'adjustment_quantity': self.adjustment_quantity,
            'reason': self.reason,
            'adjusted_by': self.adjusted_by,
            'created_at': self.created_at.isoformat()
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    action = db.Column(db.String(200))
    table_name = db.Column(db.String(100), index=True)
    record_id = db.Column(db.Integer)
    old_values = db.Column(db.JSON)
    new_values = db.Column(db.JSON)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    user = db.relationship('User', backref='audit_logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'table_name': self.table_name,
            'created_at': self.created_at.isoformat()
        }
