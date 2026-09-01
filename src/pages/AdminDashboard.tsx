import React, { useState, useEffect } from 'react';
import { apiGet } from '../api';
import { Complaint } from '../types';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Fetch stats and complaints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiGet<{ complaints: Complaint[] }>('/api/complaints');
        if (data.complaints) setComplaints(data.complaints);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
      }
    };
    fetchData();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSector && matchStatus;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    critical: complaints.filter(c => c.priority === 'Critical').length,
  };

  const sectors = ['All', ...new Set(complaints.map(c => c.sector).filter(Boolean))];
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

  return (
    <div className="admin-dashboard">
      <h1>CampusCare Admin Dashboard</h1>
      
      <section className="stats-grid">
        <div className="stat-card"><h3>Total Complaints</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{stats.pending}</p></div>
        <div className="stat-card"><h3>In Progress</h3><p>{stats.inProgress}</p></div>
        <div className="stat-card"><h3>Resolved</h3><p>{stats.resolved}</p></div>
        <div className="stat-card"><h3>Critical</h3><p>{stats.critical}</p></div>
      </section>

      <section className="filters">
        <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </section>

      <section className="complaints-table">
        <h2>Complaint List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Sector</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.category}</td>
                <td>{c.sector}</td>
                <td>{c.priority}</td>
                <td>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;