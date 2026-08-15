import os
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from functools import wraps

from config import config
from models import (
    db, User, Supplier, Category, InventoryItem, StockHistory, 
    Order, OrderItem, Alert, StockAdjustment, AuditLog
)


def seed_default_data():
    """Create baseline data and enrich the inventory with 150 distinct seeded items."""
    if not Category.query.first():
        categories = [
            Category(name='Raw Materials', description='Raw materials and bulk supplies'),
            Category(name='Finished Goods', description='Finished products ready for sale'),
            Category(name='Packaging', description='Packaging materials'),
            Category(name='Equipment', description='Tools and equipment'),
            Category(name='Other', description='Miscellaneous items'),
        ]
        db.session.add_all(categories)

    if not User.query.first():
        admin = User(
            username='admin',
            email='admin@provigent.com',
            full_name='Administrator',
            role='admin',
            is_active=True,
        )
        admin.set_password('admin123')
        db.session.add(admin)

    if not Supplier.query.first():
        suppliers = [
            Supplier(name='Fresh Foods Co', contact_person='John Smith', email='john@freshfoods.com', phone='555-0101', city='Chicago', country='USA', lead_time_days=3, is_active=True),
            Supplier(name='West Coast Supplies', contact_person='Maria Garcia', email='maria@westcoast.com', phone='555-0102', city='Los Angeles', country='USA', lead_time_days=5, is_active=True),
            Supplier(name='Regional Distributor', contact_person='Robert Johnson', email='robert@regional.com', phone='555-0103', city='Denver', country='USA', lead_time_days=2, is_active=True),
        ]
        db.session.add_all(suppliers)

    categories = Category.query.all()
    suppliers = Supplier.query.all()

    if InventoryItem.query.count() < 150:
        adjectives = ['Aero', 'Alpine', 'Aurora', 'Bravo', 'Bright', 'Cobalt', 'Coastal', 'Crisp', 'Crystal', 'Delta', 'Dynamic', 'Eco', 'Elite', 'Emerald', 'Express', 'Flex', 'Fresh', 'Fusion', 'Glacier', 'Golden', 'Halo', 'Harbor', 'Helix', 'Horizon', 'Hyper', 'Icon', 'Indigo', 'Lumen', 'Marble', 'Metro', 'Nimbus', 'North', 'Nova', 'Ocean', 'Orbit', 'Peak', 'Pilot', 'Plaza', 'Prime', 'Quartz', 'Ridge', 'River', 'Royal', 'Sage', 'Signal', 'Solar', 'South', 'Spark', 'Summit', 'Swift', 'Terra', 'Trident', 'Urban', 'Velvet', 'Vivid', 'Volt', 'West', 'Zen']
        nouns = ['Adapter', 'Beacon', 'Bracket', 'Cable', 'Cap', 'Cartridge', 'Case', 'Clamp', 'Clip', 'Coil', 'Connector', 'Controller', 'Cover', 'Crate', 'Cylinder', 'Detector', 'Diverter', 'Drill', 'Filter', 'Gauge', 'Gasket', 'Handle', 'Holder', 'Hose', 'Hub', 'Insert', 'Kit', 'Latch', 'Module', 'Nozzle', 'Panel', 'Piston', 'Plate', 'Pod', 'Pump', 'Rack', 'Rivet', 'Roller', 'Sensor', 'Shield', 'Socket', 'Spacer', 'Spool', 'Spring', 'Switch', 'Valve', 'Vent', 'Wheel', 'Wire']
        units = ['piece', 'box', 'kg', 'liter', 'roll']

        for index in range(InventoryItem.query.count(), 150):
            adjective = adjectives[index % len(adjectives)]
            noun = nouns[(index * 3) % len(nouns)]
            unit = units[(index + 2) % len(units)]
            item = InventoryItem(
                name=f'{adjective} {noun} {index + 1}',
                sku=f'SKU-{index + 1:03d}',
                barcode=f'{1000000000000 + index}',
                category_id=categories[index % len(categories)].id if categories else None,
                unit=unit,
                current_quantity=random.randint(0, 300),
                min_quantity=random.randint(5, 25),
                max_quantity=random.randint(50, 500),
                unit_cost=round(random.uniform(0.5, 150.0), 2),
                supplier_id=suppliers[index % len(suppliers)].id if suppliers else None,
                location='Chennai',
                notes='Auto-seeded inventory item',
            )
            db.session.add(item)

    db.session.commit()


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    app.config['CORS_HEADERS'] = 'Content-Type,Authorization'
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }, supports_credentials=True)
    jwt = JWTManager(app)
    
    # Create tables
    with app.app_context():
        db.create_all()
        seed_default_data()
    
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Provigent Inventory API is running',
            'api_root': '/api'
        }), 200
    
    @app.route('/api', methods=['GET'])
    def api_root():
        return jsonify({
            'message': 'Provigent Inventory API root',
            'endpoints': [
                '/api/auth/login',
                '/api/auth/register',
                '/api/inventory',
                '/api/dashboard/stats'
            ]
        }), 200
    
    # ==================== AUTHENTICATION ROUTES ====================
    
    @app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
    def login():
        """User login endpoint"""
        if request.method == 'OPTIONS':
            return '', 204
            
        try:
            import json
            
            # Debug: Log all request details
            print(f"\n=== LOGIN REQUEST DEBUG ===")
            print(f"Content-Type: {request.content_type}")
            print(f"Is JSON: {request.is_json}")
            print(f"Method: {request.method}")
            print(f"Headers: {dict(request.headers)}")
            
            # Get raw body
            raw_body = request.get_data(as_text=True)
            print(f"Raw body: {raw_body}")
            print(f"Raw body length: {len(raw_body)}")
            
            username = None
            password = None
            
            # Try to get JSON data
            if request.is_json:
                data = request.get_json(silent=True)
                print(f"get_json() result: {data}")
                if data and isinstance(data, dict):
                    username = data.get('username')
                    password = data.get('password')
                    print(f"Extracted from get_json: username={username}, password={password}")
            
            # If that didn't work, try parsing raw body
            if not username or not password:
                try:
                    if raw_body:
                        print(f"Attempting to parse raw body as JSON...")
                        data = json.loads(raw_body)
                        print(f"Parsed data: {data}")
                        if isinstance(data, dict):
                            username = data.get('username') or username
                            password = data.get('password') or password
                            print(f"Extracted from raw parse: username={username}, password={password}")
                except Exception as parse_err:
                    print(f"Failed to parse raw body: {parse_err}")
            
            # Try form data as fallback
            if not username or not password:
                username = request.form.get('username') or username
                password = request.form.get('password') or password
                print(f"After form fallback: username={username}, password={password}")
            
            # Sanitize
            if isinstance(username, str):
                username = username.strip()
            if isinstance(password, str):
                password = password.strip()
            
            print(f"Final values: username={username}, password={password}")
            print(f"=== END DEBUG ===\n")
            
            if not username or not password:
                return jsonify({'error': 'Missing username or password'}), 400
            
            user = User.query.filter_by(username=username).first()
            
            if not user or not user.check_password(password):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            if not user.is_active:
                return jsonify({'error': 'User account is inactive'}), 403
            
            access_token = create_access_token(identity=str(user.id))
            
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """User registration endpoint"""
        try:
            data = request.get_json()
            
            required_fields = ['username', 'email', 'password', 'full_name']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400
            
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 409
            
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 409
            
            user = User(
                username=data['username'],
                email=data['email'],
                full_name=data['full_name'],
                role=data.get('role', 'staff')
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            return jsonify({
                'message': 'User created successfully',
                'user': user.to_dict()
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # ==================== INVENTORY ROUTES ====================
    
    @app.route('/api/inventory', methods=['GET'])
    @jwt_required()
    def get_inventory():
        """Get all inventory items with pagination and filtering"""
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            search = request.args.get('search', '')
            category_id = request.args.get('category_id', type=int)
            status = request.args.get('status')
            
            query = InventoryItem.query
            
            if search:
                query = query.filter(
                    (InventoryItem.name.ilike(f'%{search}%')) |
                    (InventoryItem.sku.ilike(f'%{search}%')) |
                    (InventoryItem.barcode.ilike(f'%{search}%'))
                )
            
            if category_id:
                query = query.filter_by(category_id=category_id)
            
            if status:
                query = query.all()
                query = [item for item in query if item.status == status]
                total = len(query)
                items = query[(page-1)*per_page:page*per_page]
            else:
                total = query.count()
                items = query.paginate(page=page, per_page=per_page).items
            
            return jsonify({
                'items': [item.to_dict() for item in items],
                'total': total,
                'page': page,
                'per_page': per_page
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/inventory/<int:item_id>', methods=['GET'])
    @jwt_required()
    def get_inventory_item(item_id):
        """Get inventory item details"""
        try:
            item = InventoryItem.query.get_or_404(item_id)
            return jsonify(item.to_dict()), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/inventory', methods=['POST'])
    @jwt_required()
    def create_inventory_item():
        """Create new inventory item"""
        try:
            data = request.get_json()
            
            if InventoryItem.query.filter_by(sku=data['sku']).first():
                return jsonify({'error': 'SKU already exists'}), 409
            
            item = InventoryItem(
                name=data['name'],
                sku=data['sku'],
                barcode=data.get('barcode'),
                description=data.get('description'),
                category_id=data.get('category_id'),
                unit=data.get('unit', 'piece'),
                min_quantity=data.get('min_quantity', 10),
                max_quantity=data.get('max_quantity', 100),
                reorder_quantity=data.get('reorder_quantity', 50),
                unit_cost=data.get('unit_cost'),
                supplier_id=data.get('supplier_id'),
                location=data.get('location', 'Chennai')
            )
            
            db.session.add(item)
            db.session.commit()
            
            return jsonify({
                'message': 'Item created successfully',
                'item': item.to_dict()
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/inventory/<int:item_id>', methods=['PUT'])
    @jwt_required()
    def update_inventory_item(item_id):
        """Update inventory item"""
        try:
            item = InventoryItem.query.get_or_404(item_id)
            data = request.get_json()
            
            for key, value in data.items():
                if key not in ['id', 'created_at'] and hasattr(item, key):
                    setattr(item, key, value)
            
            item.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Item updated successfully',
                'item': item.to_dict()
            }), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/inventory/<int:item_id>', methods=['DELETE'])
    @jwt_required()
    def delete_inventory_item(item_id):
        """Delete inventory item"""
        try:
            item = InventoryItem.query.get_or_404(item_id)
            db.session.delete(item)
            db.session.commit()
            
            return jsonify({'message': 'Item deleted successfully'}), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # ==================== DASHBOARD ROUTES ====================
    
    @app.route('/api/dashboard/stats', methods=['GET'])
    @jwt_required()
    def get_dashboard_stats():
        """Get dashboard statistics"""
        try:
            total_items = InventoryItem.query.count()
            total_value = db.session.query(db.func.sum(
                InventoryItem.current_quantity * InventoryItem.unit_cost
            )).scalar() or 0
            
            low_stock_count = len([item for item in InventoryItem.query.all() 
                                   if item.current_quantity <= item.min_quantity])
            
            pending_orders = Order.query.filter(
                Order.status.in_(['draft', 'pending', 'confirmed', 'processing', 'shipped'])
            ).count()
            
            critical_alerts = Alert.query.filter_by(severity='critical', is_resolved=False).count()
            warning_alerts = Alert.query.filter_by(severity='warning', is_resolved=False).count()
            
            return jsonify({
                'total_items': total_items,
                'total_inventory_value': float(total_value),
                'low_stock_count': low_stock_count,
                'pending_orders': pending_orders,
                'critical_alerts': critical_alerts,
                'warning_alerts': warning_alerts
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/dashboard/alerts', methods=['GET'])
    @jwt_required()
    def get_active_alerts():
        """Get active alerts"""
        try:
            alerts = Alert.query.filter_by(is_resolved=False).order_by(
                Alert.created_at.desc()
            ).limit(10).all()
            
            return jsonify([alert.to_dict() for alert in alerts]), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/dashboard/low-stock', methods=['GET'])
    @jwt_required()
    def get_low_stock_items():
        """Get low stock items"""
        try:
            items = InventoryItem.query.all()
            low_stock = [item for item in items if item.current_quantity <= item.min_quantity]
            
            return jsonify([item.to_dict() for item in low_stock[:20]]), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/dashboard/recent-orders', methods=['GET'])
    @jwt_required()
    def get_recent_orders():
        """Get recent orders"""
        try:
            orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
            return jsonify([order.to_dict() for order in orders]), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ==================== SUPPLIERS ROUTES ====================
    
    @app.route('/api/suppliers', methods=['GET'])
    @jwt_required()
    def get_suppliers():
        """Get all suppliers"""
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            
            suppliers = Supplier.query.filter_by(is_active=True).paginate(
                page=page, per_page=per_page
            )
            
            return jsonify({
                'suppliers': [s.to_dict() for s in suppliers.items],
                'total': suppliers.total,
                'page': page
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/suppliers', methods=['POST'])
    @jwt_required()
    def create_supplier():
        """Create supplier"""
        try:
            data = request.get_json()
            
            supplier = Supplier(
                name=data['name'],
                contact_person=data.get('contact_person'),
                email=data.get('email'),
                phone=data.get('phone'),
                address=data.get('address'),
                city=data.get('city'),
                country=data.get('country'),
                lead_time_days=data.get('lead_time_days', 7)
            )
            
            db.session.add(supplier)
            db.session.commit()
            
            return jsonify({
                'message': 'Supplier created',
                'supplier': supplier.to_dict()
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # ==================== ORDERS ROUTES ====================
    
    @app.route('/api/orders', methods=['GET'])
    @jwt_required()
    def get_orders():
        """Get all orders"""
        try:
            page = request.args.get('page', 1, type=int)
            status = request.args.get('status')
            
            query = Order.query
            if status:
                query = query.filter_by(status=status)
            
            orders = query.order_by(Order.created_at.desc()).paginate(page=page, per_page=20)
            
            return jsonify({
                'orders': [o.to_dict() for o in orders.items],
                'total': orders.total,
                'page': page
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/orders', methods=['POST'])
    @jwt_required()
    def create_order():
        """Create purchase order"""
        try:
            data = request.get_json()
            user_id = get_jwt_identity()
            
            order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            
            order = Order(
                order_number=order_number,
                supplier_id=data['supplier_id'],
                expected_delivery_date=datetime.strptime(
                    data.get('expected_delivery_date'), '%Y-%m-%d'
                ).date() if data.get('expected_delivery_date') else None,
                created_by=user_id,
                notes=data.get('notes')
            )
            
            total = 0
            for item_data in data.get('items', []):
                order_item = OrderItem(
                    item_id=item_data['item_id'],
                    quantity_ordered=item_data['quantity'],
                    unit_price=item_data.get('unit_price')
                )
                if order_item.unit_price:
                    order_item.line_total = order_item.quantity_ordered * order_item.unit_price
                    total += order_item.line_total
                order.order_items.append(order_item)
            
            order.total_amount = total
            db.session.add(order)
            db.session.commit()
            
            return jsonify({
                'message': 'Order created',
                'order': order.to_dict()
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/orders/<int:order_id>', methods=['PUT'])
    @jwt_required()
    def update_order(order_id):
        """Update order status"""
        try:
            order = Order.query.get_or_404(order_id)
            data = request.get_json()
            
            if 'status' in data:
                order.status = data['status']
            
            if data.get('status') == 'delivered' and not order.actual_delivery_date:
                order.actual_delivery_date = datetime.utcnow().date()
            
            db.session.commit()
            
            return jsonify({
                'message': 'Order updated',
                'order': order.to_dict()
            }), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # ==================== STOCK ADJUSTMENT ROUTES ====================
    
    @app.route('/api/stock/adjust', methods=['POST'])
    @jwt_required()
    def adjust_stock():
        """Adjust inventory stock"""
        try:
            data = request.get_json()
            user_id = get_jwt_identity()
            
            item = InventoryItem.query.get_or_404(data['item_id'])
            
            adjustment = StockAdjustment(
                item_id=item.id,
                adjustment_quantity=data['quantity'],
                reason=data.get('reason'),
                notes=data.get('notes'),
                adjusted_by=user_id
            )
            
            old_qty = item.current_quantity
            item.current_quantity += data['quantity']
            
            history = StockHistory(
                item_id=item.id,
                previous_quantity=old_qty,
                new_quantity=item.current_quantity,
                transaction_type='adjustment',
                quantity_change=data['quantity'],
                notes=data.get('notes'),
                created_by=user_id
            )
            
            db.session.add(adjustment)
            db.session.add(history)
            db.session.commit()
            
            return jsonify({
                'message': 'Stock adjusted',
                'item': item.to_dict()
            }), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    # ==================== ERROR HANDLERS ====================
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized'}), 401
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
