import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Filter, Search, LogOut, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { apiGet, apiPut } from '../api';
import { Complaint, ComplaintStatus } from '../types';

const ALL_SECTORS = [
  'All',
  'IT',
  'Electrical',
  'Water & Plumbing',
  'Mess / Food',
  'Housekeeping',
  'Hostel Maintenance',
  'Fire & Safety',
  'Security',
  'Facilities / Infrastructure',
  'Transport',
  'Sports',
  'Academics / Faculty',
  'Examination',
  'Library',
  'Fees / Accounts',
  'General Administration'
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ complaints: Complaint[] }>('/api/complaints');
      if (data.complaints) {
        setComplaints(data.complaints);
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch complaints:', err);
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      await apiPut(`/api/complaints/${complaintId}`, { status: newStatus });
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchSeverity = severityFilter === 'All' || c.priority === severityFilter;
    const matchSearch = !searchQuery || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.studentRoll && c.studentRoll.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchSector && matchStatus && matchSeverity && matchSearch;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    critical: complaints.filter(c => c.priority === 'Critical').length,
    high: complaints.filter(c => c.priority === 'High').length,
    unassigned: complaints.filter(c => !c.assignedAdminId).length,
  };

  const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">CampusCare Admin Portal</h1>
            <p className="text-sm text-slate-400">Sector-Wise Complaint Monitoring & Governance System</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Complaints</p>
          <p className="text-2xl font-extrabold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-xl">
          <p className="text-xs text-amber-400 uppercase font-semibold">Pending</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-slate-800/80 border border-blue-500/30 p-4 rounded-xl">
          <p className="text-xs text-blue-400 uppercase font-semibold">In Progress</p>
          <p className="text-2xl font-extrabold text-blue-300 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-slate-800/80 border border-emerald-500/30 p-4 rounded-xl">
          <p className="text-xs text-emerald-400 uppercase font-semibold">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-300 mt-1">{stats.resolved}</p>
        </div>
        <div className="bg-slate-800/80 border border-red-500/30 p-4 rounded-xl">
          <p className="text-xs text-red-400 uppercase font-semibold">Critical</p>
          <p className="text-2xl font-extrabold text-red-400 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-slate-800/80 border border-orange-500/30 p-4 rounded-xl">
          <p className="text-xs text-orange-400 uppercase font-semibold">High Priority</p>
          <p className="text-2xl font-extrabold text-orange-300 mt-1">{stats.high}</p>
        </div>
        <div className="bg-slate-800/80 border border-purple-500/30 p-4 rounded-xl">
          <p className="text-xs text-purple-400 uppercase font-semibold">Unassigned</p>
          <p className="text-2xl font-extrabold text-purple-300 mt-1">{stats.unassigned}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Roll No, Title..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select 
            value={sectorFilter} 
            onChange={e => setSectorFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {ALL_SECTORS.map(s => <option key={s} value={s}>Sector: {s}</option>)}
          </select>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {statuses.map(s => <option key={s} value={s}>Status: {s}</option>)}
          </select>
          <select 
            value={severityFilter} 
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {severities.map(s => <option key={s} value={s}>Severity: {s}</option>)}
          </select>
        </div>
      </section>

      {/* Complaints Table */}
      <section className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Complaints Directory ({filteredComplaints.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 animate-spin text-blue-400" />
            <span>Loading sector complaints...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Student Roll</th>
                  <th className="px-4 py-3">Title / Details</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No complaints found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/60 transition">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400 font-semibold">{c.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">{c.studentRoll || 'N/A'}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-100 truncate">{c.title || c.category}</div>
                        {c.aiSummary && <div className="text-xs text-slate-400 truncate mt-0.5">{c.aiSummary}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-700/60 text-slate-300 border border-slate-600/40">
                          {c.sector || 'General Administration'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${
                          c.priority === 'Critical' ? 'bg-red-950/60 text-red-300 border-red-800' :
                          c.priority === 'High' ? 'bg-orange-950/60 text-orange-300 border-orange-800' :
                          c.priority === 'Medium' ? 'bg-blue-950/60 text-blue-300 border-blue-800' :
                          'bg-slate-700/60 text-slate-300 border-slate-600'
                        }`}>
                          {c.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${
                          c.status === 'Resolved' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' :
                          c.status === 'In Progress' ? 'bg-blue-950/60 text-blue-300 border-blue-800' :
                          'bg-amber-950/60 text-amber-300 border-amber-800'
                        }`}>
                          {c.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          value={c.status} 
                          onChange={(e) => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;