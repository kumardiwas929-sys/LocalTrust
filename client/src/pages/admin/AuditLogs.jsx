import React, { useState, useEffect } from 'react';
import { History, Shield, Terminal, Clock } from 'lucide-react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/audit-logs')
      .then((res) => {
        if (res?.data) setLogs(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Security Audit Trail</h1>
        <p className="text-xs text-slate-500">
          Append-only immutable record of all administrative actions, compliance approvals, and account suspensions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-4">Action</th>
                <th className="p-4">Admin Officer</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Audit Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No admin audit events recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {log.adminId?.name || 'Super Admin'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {log.targetType} ({log.targetId?.substring(0, 8)}...)
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
