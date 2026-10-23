import React from 'react';
import { MarketOverview, Language, MetalSymbol } from '../types';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Globe2,
  RefreshCw,
  BarChart2,
  Calculator,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Briefcase,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  overview: MarketOverview | null;
  selectedMetal: MetalSymbol;
  onSelectMetal: (sym: MetalSymbol) => void;
  activeTab: 'dashboard' | 'chart' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot';
  setActiveTab: (tab: 'dashboard' | 'chart' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onRefreshPrice: () => void;
  isRefreshing: boolean;
  openTradesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  overview,
  selectedMetal,
  onSelectMetal,
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onRefreshPrice,
  isRefreshing,
  openTradesCount,
}) => {
  const currentMetalInfo = overview?.metals?.[selectedMetal];
  const isPos = currentMetalInfo ? currentMetalInfo.change >= 0 : true;

  const metalsList: { symbol: MetalSymbol; labelAr: string; labelEn: string }[] = [
    { symbol: 'XAU/USD', labelAr: 'الذهب (Gold)', labelEn: 'Gold' },
    { symbol: 'XAG/USD', labelAr: 'الفضة (Silver)', labelEn: 'Silver' },
    { symbol: 'XPT/USD', labelAr: 'البلاتين (Platinum)', labelEn: 'Platinum' },
    { symbol: 'XPD/USD', labelAr: 'البلاديوم (Palladium)', labelEn: 'Palladium' },
    { symbol: 'HG/USD', labelAr: 'النحاس (Copper)', labelEn: 'Copper' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md">
      {/* Top Live Correlated Assets & Metals Strip */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 px-3 sm:px-4 py-1.5 text-xs font-mono-nums flex items-center justify-between overflow-x-auto gap-3 no-scrollbar">
        <div className="flex items-center gap-4 whitespace-nowrap">
          {/* Active Metal Live Price */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-amber-400">{selectedMetal}:</span>
            <span className="font-black text-white text-sm">
              ${currentMetalInfo ? currentMetalInfo.price.toFixed(selectedMetal === 'HG/USD' ? 3 : 2) : '2,738.45'}
            </span>
            {currentMetalInfo && (
              <span
                className={`flex items-center gap-0.5 text-[11px] font-bold ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPos ? `+${currentMetalInfo.change}` : currentMetalInfo.change} ({currentMetalInfo.changePercent}%)
              </span>
            )}
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* DXY */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 font-sans">DXY:</span>
            <span className="font-bold">{overview?.correlated.dxy.value || '103.42'}</span>
            <span className="text-rose-400 text-[10px] font-bold">
              {overview?.correlated.dxy.change}%
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* US 10Y */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 font-sans">US 10Y:</span>
            <span className="font-bold">{overview?.correlated.us10y.value || '4.18%'}</span>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshPrice}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800/60"
            title={lang === 'ar' ? 'تحديث الأسعار اللحظية' : 'Refresh Market Prices'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="text-[10px] hidden sm:inline">{lang === 'ar' ? 'تحديث لحظي' : 'Live'}</span>
          </button>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1"
          >
            <Globe2 className="w-3 h-3 text-amber-400" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>GoldAdvisor</span>
                <span className="text-amber-400 font-extrabold text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                  AI PRO
                </span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              {lang === 'ar' ? 'مساعد تداول ذكي للذهب والمعادن' : 'AI Trading Assistant for Metals'}
            </p>
          </div>
        </div>

        {/* Metals Quick Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {metalsList.map((m) => {
            const isSelected = selectedMetal === m.symbol;
            const price = overview?.metals?.[m.symbol]?.price;
            return (
              <button
                key={m.symbol}
                onClick={() => onSelectMetal(m.symbol)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{lang === 'ar' ? m.labelAr.split(' ')[0] : m.labelEn}</span>
                {price && (
                  <span className={`text-[10px] font-mono-nums ${isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>
                    ${price.toFixed(m.symbol === 'HG/USD' ? 2 : 1)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile, bottom bar used on phone) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الإشارات والتحليل' : 'Signals & Analysis'}</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'demo'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الصفقات الافتراضية' : 'Demo Tracker'}</span>
            {openTradesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'حاسبة اللوت' : 'Lot Calc'}</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'copilot'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'المستشار الذكي' : 'AI Copilot'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الأجندة' : 'Calendar'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
