import { CraneLiveData } from '../lib/api';
import { CraneIcon } from './CraneIcon';

interface StatusCardProps {
  reading: CraneLiveData;
  isNew?: boolean;
  isLoading?: boolean;
}

export function StatusCard({ reading, isNew, isLoading }: StatusCardProps) {
  const isOnline = reading.control_on_state;
  const avgSoc = Math.round((reading.soc1 + reading.soc2 + reading.soc3) / 3);

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-300 ${
        isNew ? 'ring-1 ring-emerald-400' : ''
      } ${isOnline ? 'border-slate-200' : 'border-slate-100'} ${!isLoading && !isOnline ? 'opacity-75' : ''}`}
    >
      <div className="p-4">
        {/* Header - always visible */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <CraneIcon className="w-8 h-8" isActive={isLoading ? false : isOnline} />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{reading.crane_id}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isLoading ? (
                  <div className="w-12 h-3 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={`text-[11px] font-medium ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                    {reading.engine_auto_mode && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                        AUTO
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hours Grid */}
        <div className="grid grid-cols-3 gap-px bg-slate-100 rounded-lg overflow-hidden mb-4">
          <div className="bg-white p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Hoist</p>
            {isLoading ? (
              <div className="w-10 h-4 bg-slate-100 rounded mx-auto mt-1 animate-pulse" />
            ) : (
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{reading.hoist_hours.toFixed(1)}</p>
            )}
          </div>
          <div className="bg-white p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Trolley</p>
            {isLoading ? (
              <div className="w-10 h-4 bg-slate-100 rounded mx-auto mt-1 animate-pulse" />
            ) : (
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{reading.trolley_hours.toFixed(1)}</p>
            )}
          </div>
          <div className="bg-white p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Gantry</p>
            {isLoading ? (
              <div className="w-10 h-4 bg-slate-100 rounded mx-auto mt-1 animate-pulse" />
            ) : (
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{reading.gantry_hours.toFixed(1)}</p>
            )}
          </div>
        </div>

        {/* Battery Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">BATTERY SOC</p>
            {isLoading ? (
              <div className="w-8 h-3 bg-slate-100 rounded animate-pulse" />
            ) : (
              <span className={`text-xs font-semibold ${avgSoc > 60 ? 'text-emerald-600' : avgSoc > 30 ? 'text-amber-600' : 'text-red-600'}`}>
                {avgSoc}%
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="h-2 bg-slate-100 rounded-full animate-pulse" />
          ) : (
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${avgSoc > 60 ? 'bg-emerald-500' : avgSoc > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${avgSoc}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
