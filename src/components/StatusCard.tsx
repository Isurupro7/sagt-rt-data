import { CraneReading } from '../lib/supabase';
import { Activity, Clock, ArrowUpDown, MoveHorizontal } from 'lucide-react';

interface StatusCardProps {
  reading: CraneReading;
  isNew?: boolean;
}

export function StatusCard({ reading, isNew }: StatusCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-4 transition-all duration-500 ${
        isNew ? 'ring-2 ring-green-400 animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{reading.crane_id}</h3>
        <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm text-gray-600">
            <ArrowUpDown className="w-4 h-4 mr-2 text-blue-500" />
            Hoist
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {reading.hoist_hours.toFixed(2)} hrs
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm text-gray-600">
            <MoveHorizontal className="w-4 h-4 mr-2 text-purple-500" />
            Trolley
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {reading.trolley_hours.toFixed(2)} hrs
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm text-gray-600">
            <MoveHorizontal className="w-4 h-4 mr-2 text-orange-500" />
            Gantry
          </span>
          <span className="text-sm font-semibold text-gray-800">
            {reading.gantry_hours.toFixed(2)} hrs
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <span className="flex items-center text-xs text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(reading.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
