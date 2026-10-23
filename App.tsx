import React, { useState, useEffect, useCallback } from 'react';
import { MarketOverview, DeepAnalysisResult, Language, MetalSymbol, DemoAccount, DemoTrade } from './types';
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
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  Target,
  BarChart2,
  Lock,
  Sparkles,
  ExternalLink,
  Award,
  Briefcase,
  Calculator,
  MessageSquare,
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
      entryPrice: 2728.50,
      currentPrice: 2738.45,
      stopLoss: 2718.00,
      takeProfit: 2750.00,
      openTime: 'اليوم 09:30',
      pnlDollar: 248.75,
      pnlPercent: 3.65,
      status: 'OPEN',
    },
  ],
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedMetal, setSelectedMetal] = useState<MetalSymbol>('XAU/USD');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chart' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot'>('dashboard');
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Demo Trading Tracker State persisted in localStorage
  const [demoAccount, setDemoAccount] = useState<DemoAccount>(() => {
    try {
      const saved = localStorage.getItem('gold_advisor_demo_account');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ACCOUNT;
    } catch {
      return INITIAL_DEMO_ACCOUNT;
    }
  });

  // Save demo account to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('gold_advisor_demo_account', JSON.stringify(demoAccount));
    } catch (e) {
      console.error(e);
    }
  }, [demoAccount]);

  // Pre-filled fields for calculator when sent from signal
  const [calcParams, setCalcParams] = useState<{ entry?: string; sl?: string; tp?: string }>({});

  // Fetch live market overview for selected metal
  const fetchMarketOverview = useCallback(async (sym: MetalSymbol = selectedMetal) => {
    try {
      setIsRefreshingPrice(true);
      const res = await fetch(`/api/market/gold-overview?symbol=${encodeURIComponent(sym)}`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load market overview:', err);
    } finally {
      setIsRefreshingPrice(false);
    }
  }, [selectedMetal]);

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

  // When selected metal changes, refresh market and trigger analysis
  const handleSelectMetal = (sym: MetalSymbol) => {
    setSelectedMetal(sym);
    fetchMarketOverview(sym);
    fetchDeepAnalysis(sym);
  };

  // Initial load
  useEffect(() => {
    fetchMarketOverview(selectedMetal);
  }, []);

  // Initial AI analysis trigger
  useEffect(() => {
    if (overview && !analysis && !isAnalyzing) {
      fetchDeepAnalysis(selectedMetal, overview.price);
    }
  }, [overview, analysis, isAnalyzing, fetchDeepAnalysis, selectedMetal]);

  // Periodic subtle tick poll & auto-evaluation of demo trades TP/SL
  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`/api/market/gold-overview?symbol=${encodeURIComponent(selectedMetal)}`)
        .then((r) => r.json())
        .then((data: MarketOverview) => {
          setOverview(data);

          // Auto-check open demo trades against live prices for TP / SL hits
          setDemoAccount((prevAccount) => {
            let updatedBalance = prevAccount.balance;
            let hadChange = false;

            const updatedTrades = prevAccount.trades.map((trade) => {
              if (trade.status !== 'OPEN') return trade;

              const liveMetal = data.metals?.[trade.symbol];
              if (!liveMetal) return trade;

              const currentPrice = liveMetal.price;
              const mult = liveMetal.lotMultiplier;
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
        })
        .catch(() => {});
    }, 7000);

    return () => clearInterval(timer);
  }, [selectedMetal]);

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

    const entryPrice = parseNum(sig.entryZone) || overview?.metals?.[selectedMetal]?.price || 2738.5;
    const stopLoss = parseNum(sig.stopLoss) || entryPrice * 0.995;
    const takeProfit = parseNum(sig.tp1) || entryPrice * 1.012;

    handleOpenDemoDemoTrack({
      symbol: selectedMetal,
      metalName: overview?.metals?.[selectedMetal]?.nameAr || selectedMetal,
      type: sig.signal === 'BUY' ? 'BUY' : 'SELL',
      lots: 0.2,
      entryPrice,
      stopLoss,
      takeProfit,
    });
  };

  const handleOpenDemoDemoTrack = (
    data: Omit<DemoTrade, 'id' | 'openTime' | 'pnlDollar' | 'pnlPercent' | 'status' | 'currentPrice'>
  ) => {
    handleOpenDemoTrade(data);
  };

  const handleApplyToCalculator = (entry: string, sl: string, tp: string) => {
    setCalcParams({ entry, sl, tp });
    setActiveTab('calculator');
  };

  const currentMetalInfo = overview?.metals?.[selectedMetal];
  const activePrice = currentMetalInfo?.price || overview?.price || 2738.45;
  const openTradesCount = demoAccount.trades.filter((t) => t.status === 'OPEN').length;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-20 md:pb-6"
    >
      {/* Top Navbar with multi-metal switcher and tabs */}
      <Navbar
        overview={overview}
        selectedMetal={selectedMetal}
        onSelectMetal={handleSelectMetal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onRefreshPrice={() => fetchMarketOverview(selectedMetal)}
        isRefreshing={isRefreshingPrice}
        openTradesCount={openTradesCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Quick Market Overview Stats Cards */}
        {currentMetalInfo && (
          <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {/* Spot Price */}
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">
                {lang === 'ar' ? `${currentMetalInfo.nameAr} (${selectedMetal})` : `${currentMetalInfo.nameEn} Spot`}
              </span>
              <div className="text-lg sm:text-2xl font-black font-mono-nums text-amber-400">
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
              <span className="text-[10px] text-amber-400">
                {lang === 'ar' ? 'رافعة مالية قياسية' : 'Standard CFD Spec'}
              </span>
            </div>
          </section>
        )}

        {/* Tab 1: Dashboard (AI Signal, Chart, Technical Radar) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-6">
            {/* AI Signal Card */}
            <SignalCard
              analysis={analysis}
              isLoading={isAnalyzing}
              onRefresh={() => fetchDeepAnalysis(selectedMetal, activePrice)}
              lang={lang}
              onApplyToCalculator={handleApplyToCalculator}
              onExecuteInDemoTracker={handleExecuteFromSignal}
            />

            {/* Interactive Candlestick / Line Chart */}
            <GoldChart
              currentPrice={activePrice}
              high24h={currentMetalInfo?.high24h || 2748}
              low24h={currentMetalInfo?.low24h || 2724}
              open24h={currentMetalInfo?.open24h || 2731}
              analysis={analysis}
              lang={lang}
              symbol={selectedMetal}
              metalName={currentMetalInfo?.nameAr || currentMetalInfo?.nameEn}
            />

            {/* Technical Indicators Radar */}
            <TechnicalIndicatorsRadar overview={overview} lang={lang} />
          </div>
        )}

        {/* Tab 2: Demo Trading Tracker (لوحة الصفقات الافتراضية) */}
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

        {/* Tab 3: Risk & Lot Calculator */}
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

        {/* Tab 4: AI Copilot Chat */}
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
                        ? 'مربوط ببيانات أسعار الذهب والفضة والمعادن اللحظية مع محرك البحث للتحقق من أخبار الفيدرالي والدولار.'
                        : 'Search-grounded in live macroeconomic news, Fed rates, inflation, and physical bullion demand.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      {lang === 'ar'
                        ? 'تحديد نقاط دخول ووقف خسارة وأهداف ربح مدروسة حسابياً بناءً على تقلبات السوق.'
                        : 'Mathematically grounded stop loss and take profit targets tailored to order-flow liquidity.'}
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

        {/* Tab 5: Trade Plan Auditor / Validator */}
        {activeTab === 'validator' && (
          <div className="space-y-6">
            <TradePlanValidator currentPrice={activePrice} lang={lang} />
          </div>
        )}

        {/* Tab 6: Macro & Economic Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <EconomicCalendar lang={lang} />
          </div>
        )}
      </main>

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
              GoldAdvisor AI - {lang === 'ar' ? 'مساعد تداول ذكي للذهب والمعادن الثمينة' : 'Institutional Metals Trading Assistant'}
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
