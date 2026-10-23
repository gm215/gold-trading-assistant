import React, { useState } from 'react';
import { DemoTrade, DemoAccount, MetalSymbol, Language, MetalInfo } from '../types';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  XCircle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DemoTradingTrackerProps {
  demoAccount: DemoAccount;
  metals: Record<MetalSymbol, MetalInfo> | null;
  onOpenTrade: (trade: Omit<DemoTrade, 'id' | 'openTime' | 'pnlDollar' | 'pnlPercent' | 'status' | 'currentPrice'>) => void;
  onCloseTrade: (tradeId: string) => void;
  onResetAccount: () => void;
  lang: Language;
}

export const DemoTradingTracker: React.FC<DemoTradingTrackerProps> = ({
  demoAccount,
  metals,
  onOpenTrade,
  onCloseTrade,
  onResetAccount,
  lang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'open' | 'history'>('open');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for manual trade
  const [formSymbol, setFormSymbol] = useState<MetalSymbol>('XAU/USD');
  const [formType, setFormType] = useState<'BUY' | 'SELL'>('BUY');
  const [formLots, setFormLots] = useState<number>(0.2);
  const [formEntry, setFormEntry] = useState<number>(metals?.['XAU/USD']?.price || 2738.5);
  const [formSL, setFormSL] = useState<number>(Number(((metals?.['XAU/USD']?.price || 2738.5) - 10).toFixed(2)));
  const [formTP, setFormTP] = useState<number>(Number(((metals?.['XAU/USD']?.price || 2738.5) + 20).toFixed(2)));

  const openTrades = demoAccount.trades.filter((t) => t.status === 'OPEN');
  const closedTrades = demoAccount.trades.filter((t) => t.status === 'CLOSED');

  // Compute live floating P&L
  let totalFloatingPnl = 0;
  openTrades.forEach((trade) => {
    const liveMetal = metals?.[trade.symbol];
    const livePrice = liveMetal ? liveMetal.price : trade.entryPrice;
    const mult = liveMetal ? liveMetal.lotMultiplier : 100;
    const diff = trade.type === 'BUY' ? livePrice - trade.entryPrice : trade.entryPrice - livePrice;
    const pnl = diff * trade.lots * mult;
    totalFloatingPnl += pnl;
  });

  const equity = demoAccount.balance + totalFloatingPnl;
  const totalClosedProfit = closedTrades.reduce((acc, t) => acc + t.pnlDollar, 0);
  const winningTrades = closedTrades.filter((t) => t.pnlDollar > 0);
  const winRate = closedTrades.length > 0 ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1) : '0';

  const handleSymbolChange = (sym: MetalSymbol) => {
    setFormSymbol(sym);
    const m = metals?.[sym];
    if (m) {
      setFormEntry(m.price);
      const slDist = m.price * 0.005;
      const tpDist = m.price * 0.012;
      setFormSL(Number((formType === 'BUY' ? m.price - slDist : m.price + slDist).toFixed(2)));
      setFormTP(Number((formType === 'BUY' ? m.price + tpDist : m.price - tpDist).toFixed(2)));
    }
  };

  const handleSubmitManualTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const metalName = metals?.[formSymbol]?.nameAr || formSymbol;
    onOpenTrade({
      symbol: formSymbol,
      metalName,
      type: formType,
      lots: formLots,
      entryPrice: formEntry,
      stopLoss: formSL,
      takeProfit: formTP,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
      {/* Tracker Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              {lang === 'ar' ? 'لوحة التداول الافتراضي (Demo Tracker)' : 'Virtual Demo Trading Tracker'}
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                {lang === 'ar' ? 'حساب تجريبي' : 'Paper Trading'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'تتبع أرباح وخسائر الصفقات المقترحة بشكل واقعي لحظة بلحظة لاختبار الاستراتيجية'
                : 'Real-time forward testing and performance metrics with simulated capital'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'فتح صفقة يدوية' : 'New Demo Trade'}</span>
          </button>
          <button
            onClick={onResetAccount}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            title={lang === 'ar' ? 'إعادة ضبط الرصيد إلى 10,000$' : 'Reset account'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Balance and Equity HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Balance */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {lang === 'ar' ? 'الرصيد الأساسي (Balance)' : 'Account Balance'}
          </span>
          <div className="text-lg sm:text-xl font-black font-mono-nums text-white">
            ${demoAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">
            {lang === 'ar' ? 'الإيداع: $10,000' : 'Initial: $10,000'}
          </span>
        </div>

        {/* Equity */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {lang === 'ar' ? 'صافي القيمة الحالية (Equity)' : 'Account Equity'}
          </span>
          <div className="text-lg sm:text-xl font-black font-mono-nums text-amber-400">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">
            {lang === 'ar' ? 'شاملاً الصفقات العائمة' : 'Live with open P&L'}
          </span>
        </div>

        {/* Floating P&L */}
        <div
          className={`p-3.5 rounded-xl border ${
            totalFloatingPnl >= 0
              ? 'bg-emerald-950/20 border-emerald-900/40'
              : 'bg-rose-950/20 border-rose-900/40'
          }`}
        >
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {lang === 'ar' ? 'الربح/الخسارة اللحظية' : 'Floating P&L'}
          </span>
          <div
            className={`text-lg sm:text-xl font-black font-mono-nums ${
              totalFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalFloatingPnl >= 0 ? `+$${totalFloatingPnl.toFixed(2)}` : `-$${Math.abs(totalFloatingPnl).toFixed(2)}`}
          </div>
          <span className="text-[10px] text-slate-400 font-mono-nums">
            {openTrades.length} {lang === 'ar' ? 'صفقات مفتوحة' : 'Open trades'}
          </span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {lang === 'ar' ? 'نسبة نجاح الصفقات' : 'Win Rate'}
          </span>
          <div className="text-lg sm:text-xl font-black font-mono-nums text-cyan-400">
            {winRate}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono-nums">
            {winningTrades.length} / {closedTrades.length} {lang === 'ar' ? 'صفقة رابحة' : 'Wins'}
          </span>
        </div>
      </div>

      {/* Sub Tabs: Open vs Closed */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('open')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'open'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>{lang === 'ar' ? 'الصفقات المفتوحة' : 'Open Positions'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono-nums text-white">
            {openTrades.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>{lang === 'ar' ? 'سجل الصفقات السابقة' : 'Trade History'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono-nums text-white">
            {closedTrades.length}
          </span>
        </button>
      </div>

      {/* Open Positions List */}
      {activeSubTab === 'open' && (
        <div className="space-y-3">
          {openTrades.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs sm:text-sm bg-slate-950/40 rounded-xl border border-slate-800/60 flex flex-col items-center justify-center gap-2">
              <Briefcase className="w-8 h-8 text-slate-600" />
              <span>
                {lang === 'ar'
                  ? 'لا توجد صفقات مفتوحة حالياً. يمكنك تفعيل أي توصية من قسم الإشارات أو فتح صفقة تجريبية جديدة.'
                  : 'No open demo trades. Execute an AI recommendation or open a trade manually.'}
              </span>
            </div>
          ) : (
            openTrades.map((trade) => {
              const liveMetal = metals?.[trade.symbol];
              const livePrice = liveMetal ? liveMetal.price : trade.entryPrice;
              const mult = liveMetal ? liveMetal.lotMultiplier : 100;
              const diff = trade.type === 'BUY' ? livePrice - trade.entryPrice : trade.entryPrice - livePrice;
              const pnl = diff * trade.lots * mult;
              const isProfit = pnl >= 0;

              return (
                <div
                  key={trade.id}
                  className={`p-4 rounded-xl bg-slate-950/80 border transition-all ${
                    isProfit ? 'border-emerald-900/40 hover:border-emerald-500/40' : 'border-rose-900/40 hover:border-rose-500/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          trade.type === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {trade.type}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <b className="text-white text-sm">{trade.symbol}</b>
                          <span className="text-xs text-slate-400 font-mono-nums">({trade.lots} Lot)</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono-nums">{trade.openTime}</span>
                      </div>
                    </div>

                    {/* Live P&L and Close Button */}
                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono-nums">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الربح/الخسارة اللحظي' : 'Live P&L'}</span>
                        <b
                          className={`text-base sm:text-lg font-black ${
                            isProfit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isProfit ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                        </b>
                      </div>

                      <button
                        onClick={() => onCloseTrade(trade.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600/80 text-slate-200 hover:text-white transition-colors border border-slate-700"
                      >
                        {lang === 'ar' ? 'إغلاق الصفقة' : 'Close Trade'}
                      </button>
                    </div>
                  </div>

                  {/* Price Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-xs font-mono-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'ar' ? 'سعر الدخول:' : 'Entry:'}</span>
                      <span className="text-slate-300 font-bold">${trade.entryPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'ar' ? 'السعر الحالي:' : 'Current:'}</span>
                      <span className="text-amber-400 font-bold">${livePrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'ar' ? 'وقف الخسارة SL:' : 'Stop Loss:'}</span>
                      <span className="text-rose-400 font-bold">${trade.stopLoss.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">{lang === 'ar' ? 'هدف الربح TP:' : 'Take Profit:'}</span>
                      <span className="text-emerald-400 font-bold">${trade.takeProfit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Closed Trades History */}
      {activeSubTab === 'history' && (
        <div className="space-y-2">
          {closedTrades.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
              {lang === 'ar' ? 'لا توجد صفقات مغلقة في السجل بعد.' : 'No closed trades recorded yet.'}
            </div>
          ) : (
            closedTrades.map((trade) => {
              const isProfit = trade.pnlDollar >= 0;
              return (
                <div
                  key={trade.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        trade.type === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {trade.type}
                    </span>
                    <b className="text-white">{trade.symbol}</b>
                    <span className="text-slate-400 font-mono-nums">({trade.lots} Lot)</span>
                    <span className="text-slate-500 text-[11px] font-mono-nums">{trade.closeTime}</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono-nums">
                    <span className="text-slate-400">
                      {lang === 'ar' ? 'دخول:' : 'In:'} ${trade.entryPrice.toFixed(2)} → {lang === 'ar' ? 'خروج:' : 'Out:'} ${trade.closePrice?.toFixed(2)}
                    </span>
                    <b className={`font-black text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? `+$${trade.pnlDollar.toFixed(2)}` : `-$${Math.abs(trade.pnlDollar).toFixed(2)}`}
                    </b>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Manual New Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                {lang === 'ar' ? 'فتح صفقة تجريبية جديدة' : 'Open New Demo Position'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitManualTrade} className="space-y-3.5">
              {/* Metal Selector */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">{lang === 'ar' ? 'الأصل / المعدن' : 'Metal'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['XAU/USD', 'XAG/USD', 'XPT/USD'] as MetalSymbol[]).map((sym) => (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => handleSymbolChange(sym)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        formSymbol === sym
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {sym.split('/')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action BUY / SELL */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">{lang === 'ar' ? 'نوع الصفقة' : 'Action'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('BUY')}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      formType === 'BUY'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {lang === 'ar' ? 'شراء (BUY)' : 'BUY'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('SELL')}
                    className={`py-2 text-xs font-black rounded-xl border transition-all ${
                      formType === 'SELL'
                        ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {lang === 'ar' ? 'بيع (SELL)' : 'SELL'}
                  </button>
                </div>
              </div>

              {/* Lots & Entry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{lang === 'ar' ? 'حجم اللوت' : 'Lot Size'}</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={formLots}
                    onChange={(e) => setFormLots(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-nums text-xs font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{lang === 'ar' ? 'سعر الدخول ($)' : 'Entry Price'}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formEntry}
                    onChange={(e) => setFormEntry(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-nums text-xs font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* SL & TP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-rose-400 block mb-1">{lang === 'ar' ? 'وقف الخسارة (SL)' : 'Stop Loss'}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formSL}
                    onChange={(e) => setFormSL(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-rose-900/60 rounded-xl px-3 py-2 text-rose-400 font-mono-nums text-xs font-bold focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-1">{lang === 'ar' ? 'هدف الربح (TP)' : 'Take Profit'}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formTP}
                    onChange={(e) => setFormTP(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-emerald-900/60 rounded-xl px-3 py-2 text-emerald-400 font-mono-nums text-xs font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
                >
                  {lang === 'ar' ? 'تنفيذ وفتح الصفقة الآن' : 'Execute Demo Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
