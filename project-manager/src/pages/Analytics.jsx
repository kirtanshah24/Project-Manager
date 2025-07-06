import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { useClients } from '../context/ClientContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { formatINR } from '../utils/api';

const Analytics = () => {
  const { projects, tasks } = useProjects();
  const { clients, invoices } = useClients();

  // --- Data Processing ---

  // 1. Earnings by Month
  const earningsByMonth = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, inv) => {
      const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + inv.amount;
      return acc;
    }, {});
  
  const monthlyData = Object.keys(earningsByMonth)
    .map(month => ({ name: month, earnings: earningsByMonth[month] }))
    .sort((a, b) => new Date(a.name) - new Date(b.name));

  // 2. Earnings by Client
  const earningsByClient = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, inv) => {
      const client = clients.find(c => c.id === inv.clientId);
      const clientName = client?.name || 'Unknown Client';
      acc[clientName] = (acc[clientName] || 0) + inv.amount;
      return acc;
    }, {});
  
  const clientData = Object.keys(earningsByClient)
    .map(name => ({ name, earnings: earningsByClient[name] }))
    .sort((a, b) => b.earnings - a.earnings);

  // 4. Top Paying Clients (Pie Chart)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  // --- Reusable Chart Component ---
  const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Visualize your performance and financial health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings by Month */}
        <ChartCard title="Monthly Earnings">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatINR(value)} />
            <Legend />
            <Bar dataKey="earnings" fill="#8884d8" />
          </BarChart>
        </ChartCard>

        {/* Earnings by Client */}
        <ChartCard title="Earnings by Client">
          <BarChart data={clientData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip formatter={(value) => formatINR(value)} />
            <Legend />
            <Bar dataKey="earnings" fill="#82ca9d" />
          </BarChart>
        </ChartCard>

        {/* Top Paying Clients */}
        <ChartCard title="Top Paying Clients">
          <PieChart>
            <Pie
              data={clientData.slice(0, 5)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="earnings"
            >
              {clientData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatINR(value)} />
            <Legend />
          </PieChart>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics; 