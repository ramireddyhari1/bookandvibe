import React from 'react';
import { Trophy, Users, Clock } from 'lucide-react';

interface LiveMatchCardProps {
  match: {
    id: string;
    sportType: string;
    scoreData: any;
    booking: {
      user: {
        name: string;
      };
    };
  };
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match }) => {
  const { scoreData, sportType, booking } = match;

  return (
    <div className="shrink-0 w-[280px] bg-white rounded-[24px] p-5 shadow-lg border border-emerald-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Trophy size={16} />
          </div>
          <span className="text-[12px] font-black uppercase tracking-wider text-emerald-600">Live {sportType}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black text-red-600 uppercase">Live</span>
        </div>
      </div>

      <div className="flex flex-col items-center py-2">
        {sportType.toUpperCase() === 'CRICKET' ? (
          <div className="flex flex-col items-center">
            <h3 className="text-[36px] font-black text-gray-900 leading-none tracking-tighter">
              {scoreData.runs || 0}<span className="text-gray-300 mx-1">/</span>{scoreData.wickets || 0}
            </h3>
            <p className="text-[13px] font-bold text-gray-500 mt-2 bg-gray-50 px-3 py-1 rounded-full">
              Overs: {scoreData.overs || 0}.{scoreData.balls || 0}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="text-[36px] font-black text-gray-900 leading-none tracking-tighter">
              {scoreData.points || 0}
            </h3>
            <p className="text-[13px] font-bold text-gray-500 mt-2 bg-gray-50 px-3 py-1 rounded-full">Points Scored</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
            {booking.user.name.charAt(0)}
          </div>
          <span className="text-[12px] font-bold text-gray-600 truncate max-w-[100px]">{booking.user.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Active</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchCard;
