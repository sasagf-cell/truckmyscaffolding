
import React from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MonthlyReportPreview = ({ reportData, project, month }) => {
  const { currentUser } = useAuth();
  const { summary, scaffoldRequests, materialDeliveries, alertsSummary } = reportData;

  const [year, monthNum] = month.split('-');
  const monthDate = new Date(year, monthNum - 1, 1);

  return (
    <div id="report-content" className="bg-white text-black p-8 rounded-xl shadow-sm border border-border max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.name}</h1>
          <h2 className="text-xl text-gray-600">Monthly Project Summary</h2>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-800">{format(monthDate, 'MMMM yyyy')}</p>
          <p className="text-sm text-gray-500">Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Executive Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Diary Compliance</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDiaryEntries} <span className="text-sm font-normal text-gray-500">/ {summary.totalDays} days</span></p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">New Scaffolds</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalRequests}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDeliveries}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Est. Cost</p>
            <p className="text-2xl font-bold text-gray-900">€{summary.totalCost.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Scaffold Requests Summary */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Scaffold Requests ({summary.totalRequests})</h3>
        {scaffoldRequests && scaffoldRequests.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Location</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scaffoldRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="text-gray-700">{format(parseISO(req.created), 'MMM dd')}</TableCell>
                    <TableCell className="font-medium text-gray-900">{req.id.substring(0, 8)}</TableCell>
                    <TableCell className="text-gray-700">{req.location}</TableCell>
                    <TableCell className="text-gray-700 capitalize">{req.status}</TableCell>
                    <TableCell className="text-gray-700 text-right">€{req.totalCost?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No scaffold requests created this month.</p>
        )}
      </section>

      {/* Material Deliveries Summary */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Material Deliveries ({summary.totalDeliveries})</h3>
        {materialDeliveries && materialDeliveries.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">LKW ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Driver</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialDeliveries.map(del => (
                  <TableRow key={del.id}>
                    <TableCell className="text-gray-700">{format(parseISO(del.delivery_date), 'MMM dd')}</TableCell>
                    <TableCell className="font-medium text-gray-900">{del.lkw_id}</TableCell>
                    <TableCell className="text-gray-700">{del.driver_name}</TableCell>
                    <TableCell className="text-gray-700">{del.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No material deliveries recorded this month.</p>
        )}
      </section>

      {/* Alerts Summary */}
      {Object.keys(alertsSummary).length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Alerts Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(alertsSummary).map(([type, count]) => (
              <div key={type} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                <span className="font-bold text-gray-900 bg-gray-200 px-2 py-1 rounded-full text-xs">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
        <p>Generated by: {currentUser?.full_name || 'System User'}</p>
        <p>TrackMyScaffolding Report Engine</p>
      </div>
    </div>
  );
};

export default MonthlyReportPreview;
