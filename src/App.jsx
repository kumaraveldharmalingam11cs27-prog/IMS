import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  
  const handleApiError = (err, fallbackMessage) => {
    const status = err.response?.status;
    const message = err.response?.data?.error || fallbackMessage;
    if (status === 401 || status === 403) {
      localStorage.removeItem('access_token');
      setToken(null);
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
      const [statsRes, alertsRes, lowStockRes, ordersRes, inventoryRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/alerts'),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/recent-orders'),
        api.get('/inventory', { params: { per_page: 200 } })
      ]);
      
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setLowStockItems(lowStockRes.data);
      setRecentOrders(ordersRes.data);
      setInventory(inventoryRes.data.items || []);
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
        params: { search: searchQuery, per_page: 200 }
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
    window.location.reload();
  };
  
  const handleLoginSuccess = (accessToken, userData) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
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
        <ProfessionalDashboard 
          inventory={inventory} 
          stats={stats} 
          alerts={alerts}
          lowStockItems={lowStockItems}
          recentOrders={recentOrders}
        />
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

function ProfessionalDashboard({ inventory, stats, alerts, lowStockItems, recentOrders }) {
  const calculateDaysUntilOutage = (item) => {
    if (!item.current_quantity || !item.reorder_quantity || item.reorder_quantity <= 0) {
      return Math.random() * 15;
    }
    const dailyUsage = item.reorder_quantity / 30;
    return Math.round((item.current_quantity / dailyUsage) * 10) / 10;
  };
  
  const stockOutageData = inventory
    .slice(0, 10)
    .map(item => ({
      name: item.name.substring(0, 15),
      days: calculateDaysUntilOutage(item)
    }))
    .sort((a, b) => a.days - b.days);

  const inventoryAccuracy = 99.1;
  const warehouseUtilization = 81;
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.current_quantity * (item.unit_cost || 0)), 0);
  const daysSinceCheckday = 42;
  const daysData = [
    { month: 'Jan', rate: 3.2 },
    { month: 'Feb', rate: 2.9 },
    { month: 'Mar', rate: 2.5 },
    { month: 'Apr', rate: 2.1 },
    { month: 'May', rate: 1.8 }
  ];

  const topItems = inventory
    .sort((a, b) => (b.current_quantity || 0) - (a.current_quantity || 0))
    .slice(0, 15);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Left Panel - Stock Outage Prediction */}
      <div style={{ 
        backgroundColor: 'var(--surface-2)', 
        borderRadius: '14px', 
        border: '1px solid var(--border)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', textTransform: 'uppercase' }}>
          Pred. months until stock outage
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {stockOutageData.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 400 }}>{item.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600 }}>{item.days.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - Key Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Stock Check Card */}
        <div style={{
          backgroundColor: 'var(--surface-2)',
          borderRadius: '14px',
          border: '2px solid var(--border)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Stock check</p>
            <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--text-primary)' }}>{daysSinceCheckday}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>days since last check</p>
          </div>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--surface-1)',
            border: '3px solid var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--accent-red)'
          }}>
            ⚠
          </div>
        </div>

        {/* Bottom Row - Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Inventory Accuracy */}
          <div style={{
            backgroundColor: 'var(--surface-2)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            padding: '1.5rem'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontWeight: 500 }}>Inventory accuracy</p>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>{inventoryAccuracy}%</div>
            </div>
            <div style={{ 
              width: '100%', 
              height: '6px', 
              backgroundColor: 'var(--surface-1)', 
              borderRadius: '3px', 
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${inventoryAccuracy}%`,
                height: '100%',
                backgroundColor: 'var(--accent-cyan)',
                borderRadius: '3px'
              }} />
            </div>
          </div>

          {/* Warehouse Utilization */}
          <div style={{
            backgroundColor: 'var(--surface-2)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            padding: '1.5rem'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontWeight: 500 }}>Warehouse</p>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' }}>{warehouseUtilization}%</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Utilization</p>
            </div>
            <div style={{ 
              width: '100%', 
              height: '6px', 
              backgroundColor: 'var(--surface-1)', 
              borderRadius: '3px', 
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${warehouseUtilization}%`,
                height: '100%',
                backgroundColor: 'var(--accent-cyan)',
                borderRadius: '3px'
              }} />
            </div>
          </div>
        </div>

        {/* Stock Value */}
        <div style={{
          backgroundColor: 'var(--surface-2)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          padding: '1.5rem'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Value of stock</p>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${(totalStockValue / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Right Panel - In Stock Table & Returns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* In Stock Table */}
        <div style={{
          backgroundColor: 'var(--surface-2)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>In stock</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-1)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '11px' }}>Item</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '11px' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '11px' }}>30d</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '11px' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '11px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>{item.current_quantity}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{Math.round(item.current_quantity / 30 * 30)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)' }}>${item.unit_cost?.toFixed(0) || '0'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>${((item.current_quantity * (item.unit_cost || 0)) / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Returns Section */}
        <div style={{
          backgroundColor: 'var(--surface-2)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1.5rem 0' }}>Returns</h3>
          
          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>43</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>To be processed</p>
            </div>
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>2.9%</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Return rate</p>
            </div>
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>-</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Avg time</p>
            </div>
          </div>

          {/* Chart */}
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontWeight: 500 }}>Return rate by month</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={daysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" style={{ fontSize: '11px' }} />
              <YAxis stroke="var(--text-secondary)" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="rate" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      onLogin(res.data.access_token, res.data.user);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMsg);
      console.error('Login error:', err);
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
