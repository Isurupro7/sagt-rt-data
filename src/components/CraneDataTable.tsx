import { CraneReading } from '../lib/api';

interface CraneDataTableProps {
  readings: CraneReading[];
  loading: boolean;
}

export function CraneDataTable({ readings, loading }: CraneDataTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600"></div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 text-sm">
        No historical data available. Sync data to populate records.
      </div>
    );
  }

  const groupedByTimestamp = readings.reduce((acc, reading) => {
    const timestamp = new Date(reading.timestamp).toISOString();
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(reading);
    return acc;
  }, {} as Record<string, CraneReading[]>);

  const timestamps = Object.keys(groupedByTimestamp).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const latestTimestamp = timestamps[0];
  const latestReadings = groupedByTimestamp[latestTimestamp] || [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Latest Readings</h2>
          {latestTimestamp && (
            <span className="text-xs text-slate-400">
              {new Date(latestTimestamp).toLocaleString()}
            </span>
          )}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Crane
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Hoist (hrs)
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Trolley (hrs)
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Gantry (hrs)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {latestReadings.sort((a, b) => a.crane_id.localeCompare(b.crane_id, undefined, { numeric: true })).map((reading) => (
                <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {reading.crane_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right tabular-nums">
                    {reading.hoist_hours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right tabular-nums">
                    {reading.trolley_hours.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right tabular-nums">
                    {reading.gantry_hours.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {timestamps.length > 1 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Previous Records</h2>
          <div className="space-y-2">
            {timestamps.slice(1, 6).map((timestamp) => (
              <details key={timestamp} className="bg-white rounded-lg border border-slate-200 group">
                <summary className="px-4 py-3 cursor-pointer hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between transition-colors">
                  <span>{new Date(timestamp).toLocaleString()}</span>
                  <span className="text-xs text-slate-400">{groupedByTimestamp[timestamp].length} readings</span>
                </summary>
                <div className="border-t border-slate-100">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Crane
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Hoist (hrs)
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Trolley (hrs)
                        </th>
                        <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Gantry (hrs)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {groupedByTimestamp[timestamp].sort((a, b) => a.crane_id.localeCompare(b.crane_id, undefined, { numeric: true })).map((reading) => (
                        <tr key={reading.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 text-sm font-medium text-slate-900">
                            {reading.crane_id}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-600 text-right tabular-nums">
                            {reading.hoist_hours.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-600 text-right tabular-nums">
                            {reading.trolley_hours.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-600 text-right tabular-nums">
                            {reading.gantry_hours.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
