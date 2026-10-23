import React, { useState } from 'react';
import { MetalInfo, Language, MetalSymbol } from '../types';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
  Zap,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpRight,
  Clock,
  Radio,
} from 'lucide-react';

interface LuxuryGoldVaultHeroProps {
  metal: MetalInfo;
  symbol: MetalSymbol;
  priceTick: 'up' | 'down' | 'same';
  lang: Language;
  onQuickAnalyze: () => void;
  onQuickTrade: (action: 'BUY' | 'SELL') => void;
  autoRefreshActive: boolean;
  onToggleAutoRefresh: () => void;
  refreshCountdown: number;
}

export const LuxuryGoldVaultHero: React.FC<LuxuryGoldVaultHeroProps> = ({
  metal,
  symbol,
  priceTick,
  lang,
  onQuickAnalyze,
  onQuickTrade,
  autoRefreshActive,
  onToggleAutoRefresh,
  refreshCountdown,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const isPos = metal.change >= 0;
  const decimals = symbol === 'HG/USD' ? 3 : 2;

  // Sound FX using Web Audio API (0 external assets, instant & lightweight)
  const playTickSound = (type: 'up' | 'down') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'up' ? 880 : 440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext policy handled gracefully
    }
  };

  React.useEffect(() => {
    if (priceTick === 'up') playTickSound('up');
    if (priceTick === 'down') playTickSound('down');
  }, [metal.price, priceTick]);

  const bid = metal.bid ?? Number((metal.price - 0.20).toFixed(decimals));
  const ask = metal.ask ?? Number((metal.price + 0.20).toFixed(decimals));
  const spread = Math.abs(ask - bid);
  const buyerPercent = Math.min(82, Math.max(48, Math.round(58 + metal.changePercent * 4)));
  const sellerPercent = 100 - buyerPercent;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-[#0d1424] to-slate-950 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background Gold Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner Bar: Live Market Pulse & Refresh Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {lang === 'ar' ? 'نبض الأسعار المباشرة' : 'Live Real-Time Market Feed'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                GoldAPI.io Direct
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {lang === 'ar'
                ? `تحديث تلقائي مستمر كل 3 ثوانٍ (${refreshCountdown} ث)`
                : `Continuous live updates every 3s (${refreshCountdown}s)`}
            </p>
          </div>
        </div>

        {/* Toggles & Sound */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={lang === 'ar' ? 'صوت نبض التداول' : 'Trading Sound Tick'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{lang === 'ar' ? 'التنبيه الصوتي' : 'Tick Sound'}</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              autoRefreshActive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefreshActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px]">
              {lang === 'ar'
                ? autoRefreshActive
                  ? 'البث الحي: شغال'
                  : 'البث الحي: متوقف'
                : autoRefreshActive
                ? 'Auto: Live'
                : 'Auto: Paused'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Bullion Visual + Live Price Terminal + Order Book */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left / Center: Interactive 3D Gold Bar / Metal Ingot Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 shadow-inner group">
          {/* 3D Realistic Bullion SVG Graphic */}
          <div className="relative w-full max-w-[280px] h-[135px] flex items-center justify-center my-1 filter drop-shadow-[0_15px_25px_rgba(217,119,6,0.35)] transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 320 160"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Gold Top Face Gradient */}
                <linearGradient id="goldTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2A3" />
                  <stop offset="25%" stopColor="#E6B800" />
                  <stop offset="50%" stopColor="#FFDF59" />
                  <stop offset="80%" stopColor="#C68A00" />
                  <stop offset="100%" stopColor="#8A5A00" />
                </linearGradient>

                {/* Gold Front Face Gradient */}
                <linearGradient id="goldFront" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D49A00" />
                  <stop offset="40%" stopColor="#A87400" />
                  <stop offset="100%" stopColor="#5A3A00" />
                </linearGradient>

                {/* Gold Right Face Gradient */}
                <linearGradient id="goldRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C99200" />
                  <stop offset="100%" stopColor="#4A2E00" />
                </linearGradient>

                {/* Shimmer Highlight */}
                <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Shadow underneath */}
              <ellipse cx="160" cy="142" rx="135" ry="14" fill="#000000" fillOpacity="0.65" />

              {/* Front Face of Bullion */}
              <polygon
                points="45,95 275,95 255,135 65,135"
                fill="url(#goldFront)"
                stroke="#FFE57F"
                strokeWidth="1.2"
              />

              {/* Top Face of Bullion */}
              <polygon
                points="80,45 240,45 275,95 45,95"
                fill="url(#goldTop)"
                stroke="#FFF6C2"
                strokeWidth="1.5"
              />

              {/* Right Bevel Face */}
              <polygon
                points="240,45 275,95 255,135 240,45"
                fill="url(#goldRight)"
                stroke="#C68A00"
                strokeWidth="0.8"
              />

              {/* Engraved Inscriptions on Top Face */}
              <g transform="rotate(-3 160 70)">
                {/* Stamp Hallmarks */}
                <rect x="135" y="52" width="50" height="8" rx="2" fill="#7A4D00" fillOpacity="0.55" />
                <text x="160" y="58" textAnchor="middle" fill="#543300" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
                  ESSAYEUR FONDEUR
                </text>

                {/* Purity & Weight */}
                <text x="160" y="70" textAnchor="middle" fill="#422500" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
                  {symbol === 'XAU/USD' ? '999.9 FINE GOLD' : symbol === 'XAG/USD' ? '999 FINE SILVER' : `${symbol} 99.9%`}
                </text>
                <text x="160" y="80" textAnchor="middle" fill="#543300" fontSize="7" fontWeight="bold" fontFamily="monospace" letterSpacing="2">
                  NET 1000g • SWISS CERTIFIED
                </text>
                <text x="160" y="88" textAnchor="middle" fill="#7A4D00" fontSize="5.5" fontFamily="monospace">
                  SN: #GLD-2026-XAU
                </text>
              </g>

              {/* Moving Shimmer Bar across top */}
              <polygon
                points="75,45 110,45 145,95 110,95"
                fill="url(#shimmer)"
                className="opacity-40"
              />
            </svg>
          </div>

          {/* Under-Bullion Description */}
          <div className="w-full text-center mt-2 pt-2 border-t border-slate-800/60">
            <span className="text-[11px] font-bold text-amber-300 block">
              {metal.nameAr} ({symbol})
            </span>
            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {metal.industrialUseAr}
            </p>
          </div>
        </div>

        {/* Center / Right: Live Price Ticker & Bid/Ask & Micro-Movement */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Live Price Display with Tick Flashing */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  {lang === 'ar' ? 'السعر اللحظي الفعلي المباشر' : 'Live Benchmark Spot Price'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-nums bg-slate-800 text-slate-300 border border-slate-700">
                  {metal.unit}
                </span>
              </div>

              {/* Big Animated Glowing Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono-nums tracking-tight transition-all duration-300 ${
                    priceTick === 'up'
                      ? 'text-emerald-300 scale-105 drop-shadow-[0_0_16px_rgba(52,211,153,0.8)]'
                      : priceTick === 'down'
                      ? 'text-rose-400 scale-105 drop-shadow-[0_0_16px_rgba(251,113,133,0.8)]'
                      : 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  }`}
                >
                  ${metal.price.toFixed(decimals)}
                </span>

                {/* 24h Delta Pill */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold font-mono-nums border ${
                    isPos
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPos ? `+${metal.change.toFixed(decimals)}` : metal.change.toFixed(decimals)} ({metal.changePercent}%)
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={onQuickAnalyze}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{lang === 'ar' ? 'تحليل ذكاء اصطناعي فوري' : 'Instant AI Analysis'}</span>
              </button>
            </div>
          </div>

          {/* Micro Bid / Ask and Session Range Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
            {/* Bid */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                {lang === 'ar' ? 'سعر الطلب (Bid)' : 'Bid Price'}
              </span>
              <div className="text-sm font-bold font-mono-nums text-emerald-300">
                ${bid.toFixed(decimals)}
              </div>
            </div>

            {/* Ask */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                {lang === 'ar' ? 'سعر العرض (Ask)' : 'Ask Price'}
              </span>
              <div className="text-sm font-bold font-mono-nums text-rose-300">
                ${ask.toFixed(decimals)}
              </div>
            </div>

            {/* Spread */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                {lang === 'ar' ? 'السبريد (الفارق)' : 'Micro Spread'}
              </span>
              <div className="text-sm font-bold font-mono-nums text-slate-200">
                ${spread.toFixed(decimals)}
              </div>
            </div>

            {/* Day High / Low */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                {lang === 'ar' ? 'نطاق اليوم (L / H)' : '24h High/Low'}
              </span>
              <div className="text-xs font-mono-nums text-slate-300">
                <span className="text-rose-400">${metal.low24h.toFixed(decimals)}</span> -{' '}
                <span className="text-emerald-400">${metal.high24h.toFixed(decimals)}</span>
              </div>
            </div>
          </div>

          {/* Live Market Sentiment Bar (Buyers vs Sellers) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold font-mono-nums">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'ar' ? `المشترون ${buyerPercent}%` : `Buyers ${buyerPercent}%`}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {lang === 'ar' ? 'مؤشر تدفق سيولة السوق' : 'Live Order Flow Sentiment'}
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                {lang === 'ar' ? `البائعون ${sellerPercent}%` : `Sellers ${sellerPercent}%`}
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </span>
            </div>
            {/* Sentiment Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${buyerPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 shadow-sm shadow-emerald-500/50"
              />
              <div
                style={{ width: `${sellerPercent}%` }}
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Gold Karat Matrix Quick Bar (If Gold is selected) */}
          {symbol === 'XAU/USD' && metal.karats && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs font-mono-nums">
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold font-sans">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ar' ? 'أسعار جرام الذهب عيار:' : 'Karat Gram Rates:'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-200 text-xs">
                <span>عيار 24: <b className="text-amber-400 font-black">${metal.karats.k24}</b></span>
                <span className="text-slate-700">|</span>
                <span>عيار 22: <b className="text-amber-400 font-black">${metal.karats.k22}</b></span>
                <span className="text-slate-700">|</span>
                <span>عيار 21: <b className="text-amber-400 font-black">${metal.karats.k21}</b></span>
                <span className="text-slate-700">|</span>
                <span>عيار 18: <b className="text-amber-400 font-black">${metal.karats.k18}</b></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
