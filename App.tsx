import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MarketOverview,
  DeepAnalysisResult,
  Language,
  MetalSymbol,
  DemoAccount,
  DemoTrade,
  SubscriptionState,
} from './types';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GoldChart } from './components/GoldChart';
import { SignalCard } from './components/SignalCard';
import { TechnicalIndicatorsRadar } from './components/TechnicalIndicatorsRadar';
import { RiskCalculator } from './components/RiskCalculator';
import { TradePlanValidator } from './components/TradePlanValidator';
import { EconomicCalendar } from './components/EconomicCalendar';
import { TradingCopilotChat } from './components/TradingCopilotChat';
import { DemoTradingTracker } from './components/DemoTradingTracker';
import { SubscriptionModal } from './components/SubscriptionModal';
import { MetalsDirectory } from './components/MetalsDirectory';
import { LuxuryGoldVaultHero } from './components/LuxuryGoldVaultHero';
import {
  Coins,
  Crown,
  Briefcase,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

const INITIAL_DEMO_ACCOUNT: DemoAccount = {
  balance: 10000,
  initialDeposit: 10000,
  trades: [
    {
      id: 'demo-sample-1',
      symbol: 'XAU/USD',
      metalName: 'الذهب الفوري',
      type: 'BUY',
      lots: 0.25,
      entryPrice: 4015.00,
      currentPrice: 4028.89,
      stopLoss: 3995.00,
      takeProfit: 4050.00,
      openTime: 'اليوم 09:30',
      pnlDollar: 347.25,
      pnlPercent: 3.47,
      status: 'OPEN',
    },
  ],
};

const INITIAL_SUBSCRIPTION: SubscriptionState = {
  isSubscribed: false,
  trialStartDate: new Date().toISOString(),
  trialDaysRemaining: 7,
  isTrialExpired: false,
  plan: 'FREE_TRIAL',
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedMetal, setSelectedMetal] = useState<MetalSymbol>('XAU/USD');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot'>('dashboard');
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Live Auto-Refresh & Dynamic Tick State
  const [priceTick, setPriceTick] = useState<'up' | 'down' | 'same'>('same');
  const [autoRefreshActive, setAutoRefreshActive] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(3);
  const prevPriceRef = useRef<number | null>(null);

  // Subscription State with 7-Day Free Trial countdown
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    try {
      const saved = localStorage.getItem('gold_advisor_subscription');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Calculate remaining trial days
        const start = new Date(parsed.trialStartDate).getTime();
        const now = Date.now();
        const daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 7 - daysElapsed);
        const isTrialExpired = daysRemaining <= 0 && !parsed.isSubscribed;
        return {
          ...parsed,
          trialDaysRemaining: daysRemaining,
          isTrialExpired,
        };
      }
      return INITIAL_SUBSCRIPTION;
    } catch {
      return INITIAL_SUBSCRIPTION;
    }
  });

  // Save subscription to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gold_advisor_subscription', JSON.stringify(subscription));
    } catch (e) {
      console.error(e);
    }
  }, [subscription]);

  // Demo Trading Tracker State
  const [demoAccount, setDemoAccount] = useState<DemoAccount>(() => {
    try {
      const saved = localStorage.getItem('gold_advisor_demo_account');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ACCOUNT;
    } catch {
      return INITIAL_DEMO_ACCOUNT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gold_advisor_demo_account', JSON.stringify(demoAccount));
    } catch (e) {
      console.error(e);
    }
  }, [demoAccount]);

  // Pre-filled fields for calculator when sent from signal
  const [calcParams, setCalcParams] = useState<{ entry?: string; sl?: string; tp?: string }>({});

  // Process live market update and detect tick direction
  const processMarketData = useCallback((data: MarketOverview, sym: MetalSymbol) => {
    const liveMetal = data.metals?.[sym];
    const newPrice = liveMetal ? liveMetal.price : data.price;

    if (prevPriceRef.current !== null && newPrice !== prevPriceRef.current) {
      setPriceTick(newPrice > prevPriceRef.current ? 'up' : 'down');
      setTimeout(() => setPriceTick('same'), 1100);
    }
    prevPriceRef.current = newPrice;
    setOverview(data);

    // Auto-check open demo trades against live prices for TP / SL hits
    setDemoAccount((prevAccount) => {
      let updatedBalance = prevAccount.balance;
      let hadChange = false;

      const updatedTrades = prevAccount.trades.map((trade) => {
        if (trade.status !== 'OPEN') return trade;

        const tradeMetal = data.metals?.[trade.symbol];
        if (!tradeMetal) return trade;

        const currentPrice = tradeMetal.price;
        const mult = tradeMetal.lotMultiplier;
        const diff = trade.type === 'BUY' ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
        const pnl = diff * trade.lots * mult;

        // Check Take Profit hit
        const hitTP =
          trade.takeProfit > 0 &&
          (trade.type === 'BUY' ? currentPrice >= trade.takeProfit : currentPrice <= trade.takeProfit);

        // Check Stop Loss hit
        const hitSL =
          trade.stopLoss > 0 &&
          (trade.type === 'BUY' ? currentPrice <= trade.stopLoss : currentPrice >= trade.stopLoss);

        if (hitTP || hitSL) {
          hadChange = true;
          const exitPrice = hitTP ? trade.takeProfit : trade.stopLoss;
          const exitDiff = trade.type === 'BUY' ? exitPrice - trade.entryPrice : trade.entryPrice - exitPrice;
          const finalPnl = exitDiff * trade.lots * mult;
          updatedBalance += finalPnl;

          return {
            ...trade,
            status: 'CLOSED' as const,
            closePrice: exitPrice,
            closeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            closeReason: hitTP ? ('TAKE_PROFIT' as const) : ('STOP_LOSS' as const),
            pnlDollar: finalPnl,
            pnlPercent: Number(((finalPnl / prevAccount.balance) * 100).toFixed(2)),
            currentPrice: exitPrice,
          };
        }

        return {
          ...trade,
          currentPrice,
          pnlDollar: pnl,
          pnlPercent: Number(((pnl / prevAccount.balance) * 100).toFixed(2)),
        };
      });

      if (!hadChange) {
        return { ...prevAccount, trades: updatedTrades };
      }
      return {
        ...prevAccount,
        balance: Number(updatedBalance.toFixed(2)),
        trades: updatedTrades,
      };
    });
  }, []);

  // Fetch live market overview for selected metal
  const fetchMarketOverview = useCallback(async (sym: MetalSymbol = selectedMetal, force = false) => {
    try {
      if (force) setIsRefreshingPrice(true);
      const url = `/api/market/gold-overview?symbol=${encodeURIComponent(sym)}${force ? '&force=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      processMarketData(data, sym);
    } catch (err) {
      console.error('Failed to load market overview:', err);
    } finally {
      if (force) setIsRefreshingPrice(false);
    }
  }, [selectedMetal, processMarketData]);

  // Fetch Deep AI Analysis for current active metal
  const fetchDeepAnalysis = useCallback(async (sym: MetalSymbol = selectedMetal, customPrice?: number) => {
    try {
      setIsAnalyzing(true);
      const targetPrice = customPrice || overview?.metals?.[sym]?.price || overview?.price;
      const res = await fetch('/api/ai/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          currentPrice: targetPrice,
          timeframe: '1H',
          lang,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to load deep AI analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedMetal, overview?.metals, overview?.price, lang]);

  // Handle metal selection
  const handleSelectMetal = (sym: MetalSymbol) => {
    setSelectedMetal(sym);
    prevPriceRef.current = null;
    fetchMarketOverview(sym, true);
    fetchDeepAnalysis(sym);
  };

  const handleAnalyzeFromDirectory = (sym: MetalSymbol) => {
    setSelectedMetal(sym);
    prevPriceRef.current = null;
    setActiveTab('dashboard');
    fetchMarketOverview(sym, true);
    fetchDeepAnalysis(sym);
  };

  // Initial load
  useEffect(() => {
    fetchMarketOverview(selectedMetal, false);
  }, []);

  // Initial AI analysis trigger
  useEffect(() => {
    if (overview && !analysis && !isAnalyzing) {
      fetchDeepAnalysis(selectedMetal, overview.price);
    }
  }, [overview, analysis, isAnalyzing, fetchDeepAnalysis, selectedMetal]);

  // Continuous live background polling every 3 seconds (3, 2, 1, 0)
  useEffect(() => {
    if (!autoRefreshActive) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchMarketOverview(selectedMetal, false);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshActive, selectedMetal, fetchMarketOverview]);

  // Demo Trade Actions
  const handleOpenDemoTrade = (
    tradeData: Omit<DemoTrade, 'id' | 'openTime' | 'pnlDollar' | 'pnlPercent' | 'status' | 'currentPrice'>
  ) => {
    const liveMetal = overview?.metals?.[tradeData.symbol];
    const livePrice = liveMetal ? liveMetal.price : tradeData.entryPrice;

    const newTrade: DemoTrade = {
      ...tradeData,
      id: `trade-${Date.now()}`,
      openTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentPrice: livePrice,
      pnlDollar: 0,
      pnlPercent: 0,
      status: 'OPEN',
    };

    setDemoAccount((prev) => ({
      ...prev,
      trades: [newTrade, ...prev.trades],
    }));
  };

  const handleCloseDemoTrade = (tradeId: string) => {
    setDemoAccount((prev) => {
      const trade = prev.trades.find((t) => t.id === tradeId);
      if (!trade || trade.status !== 'OPEN') return prev;

      const liveMetal = overview?.metals?.[trade.symbol];
      const livePrice = liveMetal ? liveMetal.price : trade.currentPrice;
      const mult = liveMetal ? liveMetal.lotMultiplier : 100;
      const diff = trade.type === 'BUY' ? livePrice - trade.entryPrice : trade.entryPrice - livePrice;
      const finalPnl = diff * trade.lots * mult;

      const updatedTrades = prev.trades.map((t) =>
        t.id === tradeId
          ? {
              ...t,
              status: 'CLOSED' as const,
              closePrice: livePrice,
              closeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              closeReason: 'MANUAL' as const,
              pnlDollar: Number(finalPnl.toFixed(2)),
              pnlPercent: Number(((finalPnl / prev.balance) * 100).toFixed(2)),
            }
          : t
      );

      return {
        ...prev,
        balance: Number((prev.balance + finalPnl).toFixed(2)),
        trades: updatedTrades,
      };
    });
  };

  const handleResetDemoAccount = () => {
    const confirmText =
      lang === 'ar'
        ? 'هل أنت متأكد من رغبتك في إعادة تعيين الحساب التجريبي إلى 10,000$ ومسح الصفقات؟'
        : 'Are you sure you want to reset your demo account back to $10,000?';
    if (window.confirm(confirmText)) {
      setDemoAccount({
        balance: 10000,
        initialDeposit: 10000,
        trades: [],
      });
    }
  };

  // One-click execute from Signal Card into Demo Tracker
  const handleExecuteFromSignal = (sig: DeepAnalysisResult) => {
    if (sig.signal === 'HOLD') return;

    const parseNum = (str: string) => {
      const match = str.replace(/[^0-9.]/g, '');
      return match ? parseFloat(match) : 0;
    };

    const entryPrice = parseNum(sig.entryZone) || overview?.metals?.[selectedMetal]?.price || 4028.0;
    const stopLoss = parseNum(sig.stopLoss) || entryPrice * 0.995;
    const takeProfit = parseNum(sig.tp1) || entryPrice * 1.012;

    handleOpenDemoTrade({
      symbol: selectedMetal,
      metalName: overview?.metals?.[selectedMetal]?.nameAr || selectedMetal,
      type: sig.signal === 'BUY' ? 'BUY' : 'SELL',
      lots: 0.2,
      entryPrice,
      stopLoss,
      takeProfit,
    });
  };

  const handleApplyToCalculator = (entry: string, sl: string, tp: string) => {
    setCalcParams({ entry, sl, tp });
    setActiveTab('calculator');
  };

  // Subscription Actions
  const handleActivateSubscription = () => {
    setSubscription({
      isSubscribed: true,
      trialStartDate: subscription.trialStartDate,
      trialDaysRemaining: 30,
      isTrialExpired: false,
      plan: 'PRO_MONTHLY',
    });
  };

  const handleResetTrial = () => {
    setSubscription({
      isSubscribed: false,
      trialStartDate: new Date().toISOString(),
      trialDaysRemaining: 7,
      isTrialExpired: false,
      plan: 'FREE_TRIAL',
    });
  };

  const handleSimulateExpiredTrial = () => {
    setSubscription({
      isSubscribed: false,
      trialStartDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      trialDaysRemaining: 0,
      isTrialExpired: true,
      plan: 'FREE_TRIAL',
    });
  };

  const currentMetalInfo = overview?.metals?.[selectedMetal];
  const activePrice = currentMetalInfo?.price || overview?.price || 4028.89;
  const openTradesCount = demoAccount.trades.filter((t) => t.status === 'OPEN').length;
  const isLocked = subscription.isTrialExpired && !subscription.isSubscribed;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-20 md:pb-6"
    >
      {/* Top Navbar with multi-metal switcher, tabs, and trial/pro pill */}
      <Navbar
        overview={overview}
        selectedMetal={selectedMetal}
        onSelectMetal={handleSelectMetal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onRefreshPrice={() => fetchMarketOverview(selectedMetal, true)}
        isRefreshing={isRefreshingPrice}
        openTradesCount={openTradesCount}
        subscription={subscription}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        priceTick={priceTick}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Tab 1: Dashboard (Luxury 3D Gold Hero, AI Signal, Chart, Technical Radar) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Luxury 3D Bullion Vault Hero Showcase */}
            {currentMetalInfo && (
              <LuxuryGoldVaultHero
                metal={currentMetalInfo}
                symbol={selectedMetal}
                priceTick={priceTick}
                lang={lang}
                onQuickAnalyze={() => fetchDeepAnalysis(selectedMetal, activePrice)}
                onQuickTrade={(act) =>
                  handleOpenDemoTrade({
                    symbol: selectedMetal,
                    metalName: currentMetalInfo.nameAr,
                    type: act,
                    lots: 0.2,
                    entryPrice: currentMetalInfo.price,
                    stopLoss: act === 'BUY' ? currentMetalInfo.price * 0.994 : currentMetalInfo.price * 1.006,
                    takeProfit: act === 'BUY' ? currentMetalInfo.price * 1.012 : currentMetalInfo.price * 0.988,
                  })
                }
                autoRefreshActive={autoRefreshActive}
                onToggleAutoRefresh={() => setAutoRefreshActive(!autoRefreshActive)}
                refreshCountdown={refreshCountdown}
              />
            )}

            {/* Quick Market Overview Stats Cards */}
            {currentMetalInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {/* Spot Price */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">
                    {lang === 'ar' ? `${currentMetalInfo.nameAr} (${selectedMetal})` : `${currentMetalInfo.nameEn} Spot`}
                  </span>
                  <div
                    className={`text-lg sm:text-2xl font-black font-mono-nums transition-all duration-300 ${
                      priceTick === 'up'
                        ? 'text-emerald-300 scale-105'
                        : priceTick === 'down'
                        ? 'text-rose-400 scale-105'
                        : 'text-amber-400'
                    }`}
                  >
                    ${currentMetalInfo.price.toFixed(selectedMetal === 'HG/USD' ? 3 : 2)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-mono-nums flex items-center gap-1 mt-0.5">
                    <span className={currentMetalInfo.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {currentMetalInfo.change >= 0 ? `+${currentMetalInfo.change}` : currentMetalInfo.change} ({currentMetalInfo.changePercent}%)
                    </span>
                  </div>
                </div>

                {/* 24h High */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">
                    {lang === 'ar' ? 'أعلى سعر 24 س' : '24h High'}
                  </span>
                  <div className="text-base sm:text-xl font-bold font-mono-nums text-emerald-400">
                    ${currentMetalInfo.high24h.toFixed(selectedMetal === 'HG/USD' ? 3 : 2)}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {lang === 'ar' ? 'مقاومة الجلسة' : 'Session High'}
                  </span>
                </div>

                {/* 24h Low */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">
                    {lang === 'ar' ? 'أدنى سعر 24 س' : '24h Low'}
                  </span>
                  <div className="text-base sm:text-xl font-bold font-mono-nums text-rose-400">
                    ${currentMetalInfo.low24h.toFixed(selectedMetal === 'HG/USD' ? 3 : 2)}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {lang === 'ar' ? 'قاع الجلسة' : 'Session Low'}
                  </span>
                </div>

                {/* Virtual Demo Balance Card for fast glance */}
                <div
                  onClick={() => setActiveTab('demo')}
                  className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3 shadow-lg backdrop-blur-sm transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mb-0.5">
                    <span>{lang === 'ar' ? 'محفظة التجريبي' : 'Demo Equity'}</span>
                    <Briefcase className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-base sm:text-xl font-black font-mono-nums text-white">
                    ${demoAccount.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono-nums">
                    {openTradesCount} {lang === 'ar' ? 'صفقات نشطة' : 'Trades'}
                  </span>
                </div>

                {/* Spread and Multiplier */}
                <div className="hidden lg:block bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
                  <span className="text-[11px] text-slate-400 block mb-0.5">
                    {lang === 'ar' ? 'مواصفات العقد (اللوت)' : 'Lot Specifications'}
                  </span>
                  <div className="text-sm font-bold font-mono-nums text-white">
                    1 Lot = {currentMetalInfo.lotMultiplier.toLocaleString()} {currentMetalInfo.unit.split('/')[1] || 'units'}
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {currentMetalInfo.category === 'PRECIOUS' ? 'GoldAPI Live' : 'LME Global'}
                  </span>
                </div>
              </div>
            )}

            {/* AI Signal Card with Paywall Lock support */}
            <SignalCard
              analysis={analysis}
              isLoading={isAnalyzing}
              onRefresh={() => fetchDeepAnalysis(selectedMetal, activePrice)}
              lang={lang}
              onApplyToCalculator={handleApplyToCalculator}
              onExecuteInDemoTracker={handleExecuteFromSignal}
              isLocked={isLocked}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            />

            {/* Interactive Candlestick / Line Chart */}
            <GoldChart
              currentPrice={activePrice}
              high24h={currentMetalInfo?.high24h || 4032}
              low24h={currentMetalInfo?.low24h || 3986}
              open24h={currentMetalInfo?.open24h || 4024}
              analysis={analysis}
              lang={lang}
              symbol={selectedMetal}
              metalName={currentMetalInfo?.nameAr || currentMetalInfo?.nameEn}
            />

            {/* Technical Indicators Radar */}
            <TechnicalIndicatorsRadar overview={overview} lang={lang} />
          </div>
        )}

        {/* Tab 2: Metals Directory (دليل المعادن الشامل الثمينة والصناعية) */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <MetalsDirectory
              metals={overview?.metals || null}
              selectedMetal={selectedMetal}
              onSelectMetal={handleSelectMetal}
              onAnalyzeMetal={handleAnalyzeFromDirectory}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 3: Demo Trading Tracker (لوحة الصفقات الافتراضية) */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <DemoTradingTracker
              demoAccount={demoAccount}
              metals={overview?.metals || null}
              onOpenTrade={handleOpenDemoTrade}
              onCloseTrade={handleCloseDemoTrade}
              onResetAccount={handleResetDemoAccount}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 4: Risk & Lot Calculator */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <RiskCalculator
              currentPrice={activePrice}
              initialEntry={calcParams.entry}
              initialSL={calcParams.sl}
              initialTP={calcParams.tp}
              lang={lang}
              symbol={selectedMetal}
              lotMultiplier={currentMetalInfo?.lotMultiplier || 100}
            />
          </div>
        )}

        {/* Tab 5: AI Copilot Chat */}
        {activeTab === 'copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TradingCopilotChat currentPrice={activePrice} lang={lang} />
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">
                    {lang === 'ar' ? 'مساعد التداول الذكي' : 'AI Copilot Capabilities'}
                  </h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      {lang === 'ar'
                        ? 'مربوط بأسعار الذهب والمعادن اللحظية من GoldAPI وبورصة LME لتحليل السوق بدقة.'
                        : 'Connected to live GoldAPI & LME spot pricing.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      {lang === 'ar'
                        ? 'تحديد نقاط دخول ووقف خسارة وأهداف ربح مدروسة حسابياً بناءً على تقلبات السوق.'
                        : 'Mathematically grounded stop loss and take profit targets.'}
                    </span>
                  </li>
                </ul>
              </div>

              {analysis && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono-nums">
                  <span className="text-slate-400 text-[11px] font-sans block mb-2 font-bold">
                    {lang === 'ar' ? `توصية ${selectedMetal} الحالية:` : `Active ${selectedMetal} Signal:`}
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Action:</span>
                    <b className={analysis.signal === 'BUY' ? 'text-emerald-400' : analysis.signal === 'SELL' ? 'text-rose-400' : 'text-amber-400'}>
                      {analysis.signal}
                    </b>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Entry:</span>
                    <span className="text-white">{analysis.entryZone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">SL:</span>
                    <span className="text-rose-400">{analysis.stopLoss}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">TP:</span>
                    <span className="text-emerald-400">{analysis.tp1}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Trade Plan Auditor / Validator */}
        {activeTab === 'validator' && (
          <div className="space-y-6">
            <TradePlanValidator currentPrice={activePrice} lang={lang} />
          </div>
        )}

        {/* Tab 7: Macro & Economic Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <EconomicCalendar lang={lang} />
          </div>
        )}
      </main>

      {/* Subscription & 7-Day Trial Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscription={subscription}
        onActivateSubscription={handleActivateSubscription}
        onResetTrial={handleResetTrial}
        onSimulateExpiredTrial={handleSimulateExpiredTrial}
        lang={lang}
      />

      {/* Mobile Bottom Navigation Bar for iPhones & Smart Phones */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        openTradesCount={openTradesCount}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 mt-10 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <div className="space-y-1">
            <p className="font-semibold text-slate-400">
              GoldAdvisor AI - {lang === 'ar' ? 'منصة تداول المعادن الذكية بالذكاء الاصطناعي' : 'Institutional Metals Trading Platform'}
            </p>
            <p className="text-[11px] max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'إخلاء مسؤولية المخاطر: تداول عقود الفروقات والذهب والمعادن ينطوي على درجة عالية من المخاطر المالية. التوصيات والتحليلات هي لأغراض استشارية وتدريبية فقط، ولوحة الصفقات الافتراضية مخصصة للتدريب واختبار الاستراتيجيات دون مخاطرة بأموال حقيقية.'
                : 'Risk Disclosure: CFD and Precious Metals trading involves substantial risk. AI recommendations and demo paper trading are provided for tactical and educational analysis only.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-amber-400 text-[11px] font-mono-nums shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
