import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

interface WorkOrder {
  id: number;
  code: string;
  title: string;
  status: string;
  priority: string;
  customerName: string;
  siteName: string;
  assignedToName: string | null;
}

export default function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { email, role, logout } = useAuth();

  useEffect(() => {
    client.get('/work-orders')
      .then((res) => setWorkOrders(res.data.content))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Work Orders</h2>
        <div>
          <span style={{ marginRight: 12 }}>{email} ({role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Code</th>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Priority</th>
            <th style={{ padding: 8 }}>Customer</th>
            <th style={{ padding: 8 }}>Site</th>
            <th style={{ padding: 8 }}>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((wo) => (
            <tr key={wo.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{wo.code}</td>
              <td style={{ padding: 8 }}>{wo.title}</td>
              <td style={{ padding: 8 }}>{wo.status}</td>
              <td style={{ padding: 8 }}>{wo.priority}</td>
              <td style={{ padding: 8 }}>{wo.customerName}</td>
              <td style={{ padding: 8 }}>{wo.siteName}</td>
              <td style={{ padding: 8 }}>{wo.assignedToName ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}