import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAxiosInstance = () => {
  const token = localStorage.getItem('access_token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

export default function InventoryDashboard() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard data
  const [stats, setStats] = useState({
    total_items: 0,
    total_inventory_value: 0,
    low_stock_count: 0,
    pending_orders: 0,
    critical_alerts: 0,
    warning_alerts: 0
  });
  
  const [alerts, setAlerts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);
  
  const handleApiError = (err, fallbackMessage) => {
    const status = err.response?.status;
    const message = err.response?.data?.error || fallbackMessage;
    if (status === 401 || status === 403) {
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
      setError('Session expired or access denied. Please log in again.');
      return;
    }
    setError(message);
    console.error(err);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const api = getAxiosInstance();
      const [statsRes, alertsRes, lowStockRes, ordersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/alerts'),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/recent-orders')
      ]);
      
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setLowStockItems(lowStockRes.data);
      setRecentOrders(ordersRes.data);
    } catch (err) {
      handleApiError(err, 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const api = getAxiosInstance();
      const res = await api.get('/inventory', {
        params: { search: searchQuery, per_page: 50 }
      });
      setInventory(res.data.items);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const api = getAxiosInstance();
      const res = await api.get('/suppliers', { params: { per_page: 50 } });
      setSuppliers(res.data.suppliers);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const api = getAxiosInstance();
      const res = await api.get('/orders', { params: { per_page: 50 } });
      setOrders(res.data.orders);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch(tab) {
      case 'inventory':
        loadInventory();
        break;
      case 'suppliers':
        loadSuppliers();
        break;
      case 'orders':
        loadOrders();
        break;
      default:
        loadDashboardData();
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    window.location.reload();
  };
  
  const handleLoginSuccess = (accessToken, userData) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    loadDashboardData();
  };
  
  const getStatusColor = (status) => {
    const colors = {
      critical: '#dc2626',
      danger: '#dc2626',
      warning: '#ea580c',
      good: '#16a34a',
      delivered: '#16a34a',
      'in-transit': '#2563eb',
      'in_transit': '#2563eb',
      pending: '#ea580c',
      draft: '#9ca3af',
      confirmed: '#2563eb',
      processing: '#2563eb',
      shipped: '#2563eb'
    };
    return colors[status] || '#666';
  };
  
  if (!token) {
    return <LoginForm onLogin={handleLoginSuccess} />;
  }
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-0)', padding: '1.5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="ti ti-package" style={{ fontSize: '28px', color: 'var(--text-primary)' }}></i>
            <h1 style={{ fontSize: '24px', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>Inventory Manager</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '14px' }}>
              Logout
            </button>
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '18px' }}></i>
          <input
            type="text"
            placeholder="Search items, SKUs, or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadInventory()}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'ti-home' },
          { id: 'inventory', label: 'Inventory', icon: 'ti-package' },
          { id: 'orders', label: 'Orders', icon: 'ti-shopping-cart' },
          { id: 'suppliers', label: 'Suppliers', icon: 'ti-truck' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--text-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 500 : 400,
              whiteSpace: 'nowrap'
            }}
          >
            <i className={`ti ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: 'var(--radius)', marginBottom: '1rem', color: '#c33' }}>
          {error}
        </div>
      )}
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard title="Total items" value={stats.total_items} icon="ti-package" />
            <StatCard title="Inventory value" value={`$${stats.total_inventory_value.toFixed(2)}`} icon="ti-wallet" />
            <StatCard title="Low stock alerts" value={stats.low_stock_count} icon="ti-alert-circle" color="#ea580c" />
            <StatCard title="Pending orders" value={stats.pending_orders} icon="ti-truck" color="#2563eb" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            <AlertsPanel alerts={alerts} />
            <RecentOrdersPanel orders={recentOrders} />
          </div>
        </>
      )}
      
      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <InventoryTable items={inventory} loading={loading} />
      )}
      
      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <OrdersTable orders={orders} loading={loading} getStatusColor={getStatusColor} />
      )}
      
      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <SuppliersTable suppliers={suppliers} loading={loading} />
      )}
    </div>
  );
}

// Sub-components
function StatCard({ title, value, icon, color }) {
  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)', margin: 0 }}>{title}</h3>
        <i className={`ti ${icon}`} style={{ fontSize: '20px', color: color || 'var(--text-secondary)' }}></i>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function AlertsPanel({ alerts }) {
  const getSeverityColor = (severity) => {
    const colors = { critical: '#dc2626', warning: '#ea580c', info: '#2563eb' };
    return colors[severity] || '#666';
  };
  
  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="ti ti-bell" style={{ fontSize: '18px' }}></i>
        Active alerts
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-0)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${getSeverityColor(alert.severity)}` }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{alert.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.description}</div>
          </div>
        ))}
        {alerts.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No active alerts</p>}
      </div>
    </div>
  );
}

function RecentOrdersPanel({ orders }) {
  const getStatusColor = (status) => {
    const colors = { delivered: '#16a34a', 'in-transit': '#2563eb', pending: '#ea580c' };
    return colors[status] || '#666';
  };
  
  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="ti ti-shopping-cart" style={{ fontSize: '18px' }}></i>
        Recent orders
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {orders.map(order => (
          <div key={order.id} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-0)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${getStatusColor(order.status)}` }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{order.order_number}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.supplier_name || 'Unknown supplier'}</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: getStatusColor(order.status), textTransform: 'capitalize', marginTop: '0.25rem' }}>{order.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryTable({ items, loading }) {
  const getStatusColor = (status) => {
    const colors = { critical: '#dc2626', warning: '#ea580c', good: '#16a34a' };
    return colors[status] || '#666';
  };
  
  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  
  return (
    <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-0)' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Item</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>SKU</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Quantity</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Min / Max</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{item.name}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '12px' }}>{item.sku}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.current_quantity}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{item.min_quantity} / {item.max_quantity}</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 500, backgroundColor: getStatusColor(item.status) + '20', color: getStatusColor(item.status), textTransform: 'capitalize' }}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ orders, loading, getStatusColor }) {
  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  
  return (
    <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-0)' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Order #</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Supplier</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Amount</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Status</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>{order.order_number}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{order.supplier_name}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>${order.total_amount?.toFixed(2) || '0.00'}</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 500, backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status), textTransform: 'capitalize' }}>
                  {order.status}
                </span>
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '12px' }}>{new Date(order.order_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SuppliersTable({ suppliers, loading }) {
  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>;
  
  return (
    <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-0)' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Supplier</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Contact</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Email</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-primary)' }}>Lead Time</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>{supplier.name}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{supplier.contact_person}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{supplier.email}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{supplier.lead_time_days} days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      onLogin(res.data.access_token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-0)' }}>
      <div style={{ padding: '2rem', backgroundColor: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, margin: '0 0 1.5rem 0', color: 'var(--text-primary)', textAlign: 'center' }}>Inventory Manager</h1>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: '#fee', borderRadius: 'var(--radius)', marginBottom: '1rem', color: '#c33', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', backgroundColor: 'var(--surface-0)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              placeholder="admin"
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', backgroundColor: 'var(--surface-0)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              placeholder="admin123"
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--text-primary)', color: 'var(--surface-2)', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
          Demo credentials: admin / admin123
        </p>
      </div>
    </div>
  );
}
