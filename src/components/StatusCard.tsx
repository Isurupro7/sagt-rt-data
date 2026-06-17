import { CraneLiveData } from '../lib/api';
import { CraneIcon } from './CraneIcon';
import { Battery, Zap, Power } from 'lucide-react';

interface StatusCardProps {
  reading: CraneLiveData;
  isNew?: boolean;
}

function BatteryIndicator({ level, label }: { level: number; label: string }) {
  const color = level > 60 ? 'text-green-500' : level > 30 ? 'text-yellow-500' : 'text-red-500';
  const bgColor = level > 60 ? 'bg-green-500' : level > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col items-center">
      <Battery className={`w-4 h-4 ${color}`} />
      <div className="w-8 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${bgColor} rounded-full`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 mt-0.5">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{level}%</span>
    </div>
  );
}

export function StatusCard({ reading, isNew }: StatusCardProps) {
  const isOnline = reading.control_on_state;

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg border overflow-hidden transition-all duration-500 ${
        isNew ? 'ring-2 ring-green-400 scale-[1.02]' : ''
      } ${isOnline ? 'border-green-200' : 'border-gray-200'}`}
    >
      {/* Status indicator bar */}
      <div className={`h-1.5 ${isOnline ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-300'}`} />

      <div className="p-4">
        {/* Header: Crane ID + Status + Icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <CraneIcon className="w-10 h-10" isActive={isOnline} />
            <div>
              <h3 className="text-lg font-bold text-gray-900">{reading.crane_id}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  isOnline
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  <Power className="w-3 h-3 mr-1" />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {reading.engine_auto_mode && (
                  <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase tracking-wide text-blue-600 font-medium">Hoist</span>
            <p className="text-sm font-bold text-blue-900 mt-0.5">{reading.hoist_hours.toFixed(1)}</p>
            <span className="text-[10px] text-blue-500">hrs</span>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase tracking-wide text-purple-600 font-medium">Trolley</span>
            <p className="text-sm font-bold text-purple-900 mt-0.5">{reading.trolley_hours.toFixed(1)}</p>
            <span className="text-[10px] text-purple-500">hrs</span>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 text-center">
            <span className="text-[10px] uppercase tracking-wide text-orange-600 font-medium">Gantry</span>
            <p className="text-sm font-bold text-orange-900 mt-0.5">{reading.gantry_hours.toFixed(1)}</p>
            <span className="text-[10px] text-orange-500">hrs</span>
          </div>
        </div>

        {/* Battery SOC */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-around">
            <BatteryIndicator level={reading.soc1} label="SC 1" />
            <BatteryIndicator level={reading.soc2} label="SC 2" />
            <BatteryIndicator level={reading.soc3} label="SC 3" />
          </div>
        </div>
      </div>
    </div>
  );
}
