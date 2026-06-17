import { CraneLiveData } from '../lib/api';
import { CraneIcon } from './CraneIcon';

interface StatusCardProps {
  reading: CraneLiveData;
  isNew?: boolean;
}

function BatteryBar({ level, label }: { level: number; label: string }) {
  const color = level > 60 ? 'bg-emerald-500' : level > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 w-7">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-[11px] font-medium text-slate-600 w-8 text-right">{level}%</span>
    </div>
  );
}

export function StatusCard({ reading, isNew }: StatusCardProps) {
  const isOnline = reading.control_on_state;

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-300 ${
        isNew ? 'ring-1 ring-emerald-400' : ''
      } ${isOnline ? 'border-slate-200' : 'border-slate-100 opacity-75'}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <CraneIcon className="w-8 h-8" isActive={isOnline} />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{reading.crane_id}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={`text-[11px] font-medium ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {reading.engine_auto_mode && (
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                    AUTO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hours Grid */}
        <div className="grid grid-cols-3 gap-px bg-slate-100 rounded-lg overflow-hidden mb-4">
          <div className="bg-white p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Hoist</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{reading.hoist_hours.toFixed(1)}</p>
          </div>
          <div className="bg-white p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Trolley</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{reading.trolley_hours.toFixed(1)}</p>
          </div>
          <div className="bg-white p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Gantry</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{reading.gantry_hours.toFixed(1)}</p>
          </div>
        </div>

        {/* Battery Section */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-2">Super Capacitor</p>
          <BatteryBar level={reading.soc1} label="SC1" />
          <BatteryBar level={reading.soc2} label="SC2" />
          <BatteryBar level={reading.soc3} label="SC3" />
        </div>
      </div>
    </div>
  );
}
