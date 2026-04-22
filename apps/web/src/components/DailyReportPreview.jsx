
import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DailyReportPreview = ({ reportData, project, date }) => {
  const { currentUser } = useAuth();
  const { diaryEntry, scaffoldRequests, materialDeliveries, alerts } = reportData;

  return (
    <div id="report-content" className="bg-white text-black p-8 rounded-xl shadow-sm border border-border max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.name}</h1>
          <h2 className="text-xl text-gray-600">Daily Site Report</h2>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-800">{format(new Date(date), 'MMMM dd, yyyy')}</p>
          <p className="text-sm text-gray-500">Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Site Diary Section */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Site Conditions & Diary</h3>
        {diaryEntry ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Weather</p>
              <p className="font-medium capitalize">{diaryEntry.weather}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Temperature</p>
              <p className="font-medium">{diaryEntry.temperature}°C</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Workers Present</p>
              <p className="font-medium">{diaryEntry.personnel_count}</p>
            </div>
            <div className="col-span-1 md:col-span-4 bg-gray-50 p-4 rounded-lg mt-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Activities & Progress</p>
              <p className="text-sm whitespace-pre-wrap">{diaryEntry.work_summary}</p>
            </div>
            {diaryEntry.safety_issues && (
              <div className="col-span-1 md:col-span-4 bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-xs text-red-800 uppercase tracking-wider font-semibold mb-1">Safety Incidents</p>
                <p className="text-sm text-red-900 whitespace-pre-wrap">{diaryEntry.safety_issues}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 italic">
            No diary entry recorded for this date.
          </div>
        )}
      </section>

      {/* Scaffold Requests Section */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Scaffold Requests</h3>
        {scaffoldRequests && scaffoldRequests.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Type</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Location</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scaffoldRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-gray-900">{req.id.substring(0, 8)}</TableCell>
                    <TableCell className="text-gray-700">{req.type}</TableCell>
                    <TableCell className="text-gray-700">{req.location}</TableCell>
                    <TableCell className="text-gray-700 capitalize">{req.status}</TableCell>
                    <TableCell className="text-gray-700 text-right">€{req.totalCost?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No scaffold requests created on this date.</p>
        )}
      </section>

      {/* Material Deliveries Section */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Material Deliveries</h3>
        {materialDeliveries && materialDeliveries.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">LKW ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Driver</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialDeliveries.map(del => (
                  <TableRow key={del.id}>
                    <TableCell className="font-medium text-gray-900">{del.lkw_id}</TableCell>
                    <TableCell className="text-gray-700">{del.driver_name}</TableCell>
                    <TableCell className="text-gray-700">{del.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No material deliveries recorded on this date.</p>
        )}
      </section>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">System Alerts</h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-700">{alert.severity}</span>
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

export default DailyReportPreview;
