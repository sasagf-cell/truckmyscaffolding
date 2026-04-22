
import React from 'react';

const ProductProofSection = () => {
  const tableData = [
    { tag: 'SCF-2024-001', area: 'Reactor A', status: 'In progress', responsible: 'J. Smith', due: '2024-01-15' },
    { tag: 'SCF-2024-002', area: 'Pump House', status: 'Ready for handover', responsible: 'M. Johnson', due: '2024-01-14' },
    { tag: 'SCF-2024-003', area: 'Piping Zone', status: 'Pending', responsible: 'R. Williams', due: '2024-01-16' },
    { tag: 'SCF-2024-004', area: 'Boiler Unit 3', status: 'In progress', responsible: 'A. Davis', due: '2024-01-17' },
    { tag: 'SCF-2024-005', area: 'Cooling Tower', status: 'Closed', responsible: 'S. Miller', due: '2024-01-10' },
    { tag: 'SCF-2024-006', area: 'Tank Farm B', status: 'Ready for handover', responsible: 'J. Smith', due: '2024-01-15' },
    { tag: 'SCF-2024-007', area: 'Flare Stack', status: 'Pending', responsible: 'K. Wilson', due: '2024-01-18' },
    { tag: 'SCF-2024-008', area: 'Compressor 2', status: 'In progress', responsible: 'M. Johnson', due: '2024-01-16' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-block px-2 py-0.5 bg-[#f3f4f6] text-[#9ca3af] border border-[#e5e7eb] rounded text-xs font-medium">Pending</span>;
      case 'In progress':
        return <span className="inline-block px-2 py-0.5 bg-[#f0fdfa] text-[#0EA5A0] border border-[#ccfbf1] rounded text-xs font-medium">In progress</span>;
      case 'Ready for handover':
        return <span className="inline-block px-2 py-0.5 bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5] rounded text-xs font-medium">Ready for handover</span>;
      case 'Closed':
        return <span className="inline-block px-2 py-0.5 bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb] rounded text-xs font-medium">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <section className="bg-[#f5f5f5] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-3">
            See the software in action
          </h2>
          <p className="text-lg text-[#64748B]">
            TrackMyScaffolding is built around the actual screens scaffold teams use every day.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* MAIN PREVIEW - Live Status by Area */}
          <div className="bg-white border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 rounded-lg flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">
                Live Status by Area
              </h3>
              <p className="text-[#64748B] text-sm">
                Project managers see all active scaffolds by area, tag, or status: requested, approved, in progress, ready for handover, and closed.
              </p>
            </div>
            
            <div className="lg:w-2/3 overflow-x-auto">
              <div className="min-w-[600px] border border-[#e5e7eb] rounded overflow-hidden select-none pointer-events-none">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1E3A5F] text-white text-xs uppercase tracking-wider">
                      <th className="p-3 font-bold border-b border-[#1E3A5F]">Tag</th>
                      <th className="p-3 font-bold border-b border-[#1E3A5F]">Area</th>
                      <th className="p-3 font-bold border-b border-[#1E3A5F]">Status</th>
                      <th className="p-3 font-bold border-b border-[#1E3A5F]">Responsible</th>
                      <th className="p-3 font-bold border-b border-[#1E3A5F]">Due/Handover</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {tableData.map((row, idx) => (
                      <tr key={idx} className="even:bg-[#f9fafb] odd:bg-white border-b border-[#e5e7eb] last:border-0">
                        <td className="p-3 font-semibold text-[#1E3A5F]">{row.tag}</td>
                        <td className="p-3 text-[#64748B]">{row.area}</td>
                        <td className="p-3">{getStatusBadge(row.status)}</td>
                        <td className="p-3 text-[#64748B]">{row.responsible}</td>
                        <td className="p-3 text-[#64748B]">{row.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECONDARY PREVIEWS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SECONDARY CARD 1 - Scaffold Request Form */}
            <div className="bg-white border border-[#e5e7eb] shadow-[0_1px_1px_rgba(0,0,0,0.03)] p-5 rounded-lg flex flex-col">
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">
                Scaffold Request Form
              </h3>
              <p className="text-[#64748B] text-sm mb-5">
                Scaffold planners and site engineers submit requests with area, tag number, scope, and access requirements.
              </p>
              
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 select-none pointer-events-none flex-grow">
                <div className="text-[#1E3A5F] font-bold text-sm border-b border-[#e5e7eb] pb-2 mb-3">
                  New Request
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-[#1E3A5F] text-xs font-semibold mb-1">Area</div>
                    <div className="bg-white border border-[#e5e7eb] h-8 rounded px-2 flex items-center text-xs text-[#64748B]">Select area...</div>
                  </div>
                  <div>
                    <div className="text-[#1E3A5F] text-xs font-semibold mb-1">Tag Number</div>
                    <div className="bg-white border border-[#e5e7eb] h-8 rounded px-2 flex items-center text-xs text-[#64748B]">e.g. SCF-2024-009</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-[#1E3A5F] text-xs font-semibold mb-1">Type</div>
                    <div className="bg-white border border-[#e5e7eb] h-8 rounded px-2 flex items-center text-xs text-[#64748B]">Standard</div>
                  </div>
                  <div>
                    <div className="text-[#1E3A5F] text-xs font-semibold mb-1">Priority</div>
                    <div className="bg-white border border-[#e5e7eb] h-8 rounded px-2 flex items-center text-xs text-[#64748B]">Normal</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[#1E3A5F] text-xs font-semibold mb-1">Notes</div>
                  <div className="bg-white border border-[#e5e7eb] h-16 rounded px-2 py-1 text-xs text-[#64748B]">Access requirements...</div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#0EA5A0] text-white text-xs px-4 py-2 rounded font-medium">
                    Submit Request
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY CARD 2 - Shutdown Reporting */}
            <div className="bg-white border border-[#e5e7eb] shadow-[0_1px_1px_rgba(0,0,0,0.03)] p-5 rounded-lg flex flex-col">
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">
                Shutdown Reporting
              </h3>
              <p className="text-[#64748B] text-sm mb-5">
                At the end of each shift, supervisors generate simple reports that show completed scaffolds and open issues.
              </p>
              
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 select-none pointer-events-none flex-grow flex flex-col">
                <div className="flex justify-between items-center border-b border-[#e5e7eb] pb-2 mb-3">
                  <div className="text-[#1E3A5F] font-bold text-sm">Shift Summary</div>
                  <div className="text-[#64748B] text-xs">2024-01-15 • Day Shift</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white border border-[#e5e7eb] p-3 rounded flex flex-col">
                    <div className="text-[#64748B] text-xs font-medium uppercase tracking-wide mb-1">Completed</div>
                    <div className="text-[#0EA5A0] font-bold text-2xl">12</div>
                  </div>
                  <div className="bg-white border border-[#e5e7eb] p-3 rounded flex flex-col">
                    <div className="text-[#64748B] text-xs font-medium uppercase tracking-wide mb-1">Open Issues</div>
                    <div className="text-[#1E3A5F] font-bold text-2xl">3</div>
                  </div>
                </div>
                
                <div className="bg-white border border-[#e5e7eb] rounded p-3 flex-grow">
                  <div className="text-[#1E3A5F] text-xs font-bold mb-2">Pending Handovers</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-[#f3f4f6] pb-1">
                      <span className="font-semibold text-[#1E3A5F]">SCF-2024-002</span>
                      <span className="text-[#64748B]">Pump House</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-[#f3f4f6] pb-1">
                      <span className="font-semibold text-[#1E3A5F]">SCF-2024-006</span>
                      <span className="text-[#64748B]">Tank Farm B</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1E3A5F]">SCF-2024-011</span>
                      <span className="text-[#64748B]">Boiler Unit 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductProofSection;
