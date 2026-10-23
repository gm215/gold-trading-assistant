import React from 'react';
import { MarketOverview, Language, MetalSymbol, SubscriptionState } from '../types';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Globe2,
  RefreshCw,
  BarChart2,
  Calculator,
  Calendar,
  MessageSquare,
  Briefcase,
  Zap,
  Layers,
  Crown,
  Clock,
} from 'lucide-react';

interface NavbarProps {
  overview: MarketOverview | null;
  selectedMetal: MetalSymbol;
  onSelectMetal: (sym: MetalSymbol) => void;
  activeTab: 'dashboard' | 'directory' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot';
  setActiveTab: (tab: 'dashboard' | 'directory' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onRefreshPrice: () => void;
  isRefreshing: boolean;
  openTradesCount: number;
  subscription: SubscriptionState;
  onOpenSubscriptionModal: () => void;
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
  subscription,
  onOpenSubscriptionModal,
}) => {
  const currentMetalInfo = overview?.metals?.[selectedMetal];
  const isPos = currentMetalInfo ? currentMetalInfo.change >= 0 : true;

  const metalsList: { symbol: MetalSymbol; labelAr: string; labelEn: string; category: 'PRECIOUS' | 'INDUSTRIAL' }[] = [
    { symbol: 'XAU/USD', labelAr: 'الذهب (Gold)', labelEn: 'Gold', category: 'PRECIOUS' },
    { symbol: 'XAG/USD', labelAr: 'الفضة (Silver)', labelEn: 'Silver', category: 'PRECIOUS' },
    { symbol: 'XPT/USD', labelAr: 'البلاتين (Platinum)', labelEn: 'Platinum', category: 'PRECIOUS' },
    { symbol: 'XPD/USD', labelAr: 'البلاديوم (Palladium)', labelEn: 'Palladium', category: 'PRECIOUS' },
    { symbol: 'HG/USD', labelAr: 'النحاس (Copper)', labelEn: 'Copper', category: 'INDUSTRIAL' },
    { symbol: 'AL/USD', labelAr: 'الألومنيوم (Alum)', labelEn: 'Aluminum', category: 'INDUSTRIAL' },
    { symbol: 'NI/USD', labelAr: 'النيكل (Nickel)', labelEn: 'Nickel', category: 'INDUSTRIAL' },
    { symbol: 'ZN/USD', labelAr: 'الزنك (Zinc)', labelEn: 'Zinc', category: 'INDUSTRIAL' },
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
              ${currentMetalInfo ? currentMetalInfo.price.toFixed(selectedMetal === 'HG/USD' ? 3 : 2) : '4,028.89'}
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

          {/* Provider Feed Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-[10px] text-emerald-300">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span className="font-sans font-semibold">
              {currentMetalInfo?.category === 'PRECIOUS' ? 'GoldAPI.io Live' : 'LME Futures Feed'}
            </span>
            {currentMetalInfo?.exchange && (
              <span className="text-slate-400">({currentMetalInfo.exchange})</span>
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
        </div>

        {/* Quick controls & Subscription Pill */}
        <div className="flex items-center gap-2">
          {/* Subscription / 7-Day Trial Pill */}
          <button
            onClick={onOpenSubscriptionModal}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border ${
              subscription.isSubscribed
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : subscription.isTrialExpired
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {subscription.isSubscribed
                ? (lang === 'ar' ? 'مشترك PRO' : 'PRO Active')
                : subscription.isTrialExpired
                ? (lang === 'ar' ? 'انتهت التجربة - اشترك بـ 5$' : 'Trial Expired ($5/mo)')
                : (lang === 'ar' ? `تجربة مجانية: ${subscription.trialDaysRemaining} أيام` : `Free Trial: ${subscription.trialDaysRemaining}d`)}
            </span>
          </button>

          <button
            onClick={onRefreshPrice}
            disabled={isRefreshing}
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700"
            title={lang === 'ar' ? 'سحب الأسعار اللحظية من GoldAPI.io' : 'Fetch live rates from GoldAPI.io'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-[10px] hidden sm:inline font-bold">
              {isRefreshing ? (lang === 'ar' ? 'جاري السحب...' : 'Syncing...') : (lang === 'ar' ? 'تحديث الأسعار' : 'Sync')}
            </span>
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
            <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'منصة تداول المعادن الذكية' : 'Metals Trading & AI Advisory'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-emerald-400 font-semibold text-[10px]">GoldAPI Live</span>
            </p>
          </div>
        </div>

        {/* Metals Quick Switcher Pills (Categorized with colors) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar max-w-full">
          {metalsList.map((m) => {
            const isSelected = selectedMetal === m.symbol;
            const metalObj = overview?.metals?.[m.symbol];
            const price = metalObj?.price;
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
                    ${price.toFixed(m.symbol === 'HG/USD' ? 2 : 0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Navigation Tabs */}
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
            <span>{lang === 'ar' ? 'الإشارات' : 'Signals'}</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'دليل المعادن' : 'Metals Hub'}</span>
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
            <span>{lang === 'ar' ? 'التجريبي' : 'Demo Tracker'}</span>
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
            <span>{lang === 'ar' ? 'اللوت' : 'Lot Calc'}</span>
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
            <span>{lang === 'ar' ? 'المستشار' : 'AI Copilot'}</span>
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
