"use client";
import React, { useState, useEffect } from 'react';
import { X, Trophy, Plus, Minus, Check, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';

interface LiveMatchScorerProps {
  bookingId: string;
  sportType: string;
  onClose: () => void;
}

const LiveMatchScorer: React.FC<LiveMatchScorerProps> = ({ bookingId, sportType, onClose }) => {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize or get match
    fetchApi('/live-match', {
      method: 'POST',
      body: JSON.stringify({ bookingId, sportType }),
      requiresAuth: true
    }).then(data => {
      setMatch(data);
      setScoreData(data.scoreData || {});
      setLoading(false);
    }).catch(err => {
      console.error('Failed to init match:', err);
      setLoading(false);
    });
  }, [bookingId, sportType]);

  const updateScore = async (newData: any) => {
    if (!match) return;
    setSaving(true);
    try {
      const updated = await fetchApi(`/live-match/${match.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ scoreData: newData }),
        requiresAuth: true
      });
      setScoreData(updated.scoreData);
    } catch (err) {
      console.error('Failed to update score:', err);
    } finally {
      setSaving(false);
    }
  };

  const addRuns = (runs: number) => {
    const newData = { ...scoreData, runs: (scoreData.runs || 0) + runs };
    // Increment balls/overs logic for cricket
    let balls = (scoreData.balls || 0) + 1;
    let overs = scoreData.overs || 0;
    if (balls >= 6) {
      overs += 1;
      balls = 0;
    }
    updateScore({ ...newData, balls, overs });
  };

  if (loading) return (
    <div className="fixed inset-0 z-[2000] bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="fixed inset-0 z-[2000] bg-white flex flex-col"
    >
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-black text-gray-900 tracking-tight">Live Match Scorer</h3>
            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">{sportType}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        {/* Current Score Display */}
        <div className="bg-gray-900 rounded-[32px] p-8 text-white flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-20%] w-[150%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-gray-900/0 to-transparent blur-3xl" />
          
          <span className="text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4 relative z-10">Current Score</span>
          <div className="text-[72px] font-black leading-none tracking-tighter relative z-10 flex items-center">
            {scoreData.runs || 0}<span className="text-gray-600 mx-2">/</span>{scoreData.wickets || 0}
          </div>
          <div className="mt-4 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full relative z-10">
            <span className="text-[16px] font-bold">Overs: {scoreData.overs || 0}.{scoreData.balls || 0}</span>
          </div>
          
          {saving && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Loader2 className="animate-spin text-emerald-400" size={12} />
              <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">Syncing</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 6].map(runs => (
            <button 
              key={runs}
              onClick={() => addRuns(runs)}
              disabled={saving}
              className="aspect-square rounded-3xl bg-gray-50 border-2 border-gray-100 flex flex-col items-center justify-center active:scale-95 transition-all hover:border-emerald-500 hover:bg-emerald-50 group"
            >
              <span className="text-[24px] font-black text-gray-900 group-hover:text-emerald-600">{runs}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-emerald-500">Runs</span>
            </button>
          ))}
          <button 
            onClick={() => updateScore({ ...scoreData, wickets: (scoreData.wickets || 0) + 1 })}
            disabled={saving}
            className="aspect-square rounded-3xl bg-red-50 border-2 border-red-100 flex flex-col items-center justify-center active:scale-95 transition-all hover:bg-red-500 hover:border-red-500 group"
          >
            <span className="text-[24px] font-black text-red-600 group-hover:text-white">W</span>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest group-hover:text-red-100">Wicket</span>
          </button>
        </div>

        {/* Manual Adjustments */}
        <div className="bg-gray-50 rounded-3xl p-6">
          <h4 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-4">Manual Adjustments</h4>
          <div className="flex gap-4">
            <button onClick={() => updateScore({ ...scoreData, runs: (scoreData.runs || 0) - 1 })} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 active:bg-gray-100 transition-colors">-1 Run</button>
            <button onClick={() => updateScore({ ...scoreData, wickets: (scoreData.wickets || 0) - 1 })} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 active:bg-gray-100 transition-colors">-1 Wicket</button>
          </div>
        </div>
      </div>

      <div className="p-6 pb-10 border-t border-gray-100 flex flex-col gap-3">
        <button 
          onClick={() => {
            if(confirm('Are you sure you want to end this match scoring?')) {
              updateScore({ ...scoreData, status: 'FINISHED' });
              onClose();
            }
          }}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-[16px] shadow-lg active:scale-95 transition-all"
        >
          Finish Match
        </button>
        <button 
          onClick={onClose}
          className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold text-[14px] active:scale-95 transition-all"
        >
          Close Scorer
        </button>
      </div>
    </motion.div>
  );
};

export default LiveMatchScorer;
