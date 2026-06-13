import { CraneReading } from '../lib/supabase';

interface CraneDataTableProps {
  readings: CraneReading[];
  loading: boolean;
}

export function CraneDataTable({ readings, loading }: CraneDataTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No crane readings available. Click "Fetch Latest Data" to get started.
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Latest Readings
          {latestTimestamp && (
            <span className="text-sm font-normal text-gray-600 ml-3">
              {new Date(latestTimestamp).toLocaleString()}
            </span>
          )}
        </h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crane ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoist Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trolley Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gantry Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {latestReadings.sort((a, b) => a.crane_id.localeCompare(b.crane_id)).map((reading) => (
                <tr key={reading.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reading.crane_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {reading.hoist_hours.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {reading.trolley_hours.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Historical Readings</h2>
          <div className="space-y-4">
            {timestamps.slice(1, 6).map((timestamp) => (
              <details key={timestamp} className="bg-white rounded-lg shadow">
                <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 font-medium text-gray-700">
                  {new Date(timestamp).toLocaleString()} ({groupedByTimestamp[timestamp].length} readings)
                </summary>
                <div className="overflow-x-auto border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Crane ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hoist Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trolley Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gantry Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupedByTimestamp[timestamp].sort((a, b) => a.crane_id.localeCompare(b.crane_id)).map((reading) => (
                        <tr key={reading.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {reading.crane_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {reading.hoist_hours.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {reading.trolley_hours.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
