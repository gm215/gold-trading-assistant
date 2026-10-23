import React, { useState, useEffect } from 'react';
import { Language, MetalSymbol } from '../types';
import { Calculator, ShieldCheck, AlertCircle, DollarSign, Percent, Scale, Sparkles } from 'lucide-react';

interface RiskCalculatorProps {
  currentPrice: number;
  initialEntry?: string;
  initialSL?: string;
  initialTP?: string;
  lang: Language;
  symbol?: MetalSymbol;
  lotMultiplier?: number;
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  currentPrice,
  initialEntry,
  initialSL,
  initialTP,
  lang,
  symbol = 'XAU/USD',
  lotMultiplier = 100,
}) => {
  const [balance, setBalance] = useState<number>(5000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice);
  const [stopLoss, setStopLoss] = useState<number>(Number((currentPrice * 0.995).toFixed(symbol === 'HG/USD' ? 3 : 2)));
  const [takeProfit, setTakeProfit] = useState<number>(Number((currentPrice * 1.012).toFixed(symbol === 'HG/USD' ? 3 : 2)));
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');

  // Update when active metal price or signal parameters change
  useEffect(() => {
    setEntryPrice(currentPrice);
    setStopLoss(Number((currentPrice * 0.995).toFixed(symbol === 'HG/USD' ? 3 : 2)));
    setTakeProfit(Number((currentPrice * 1.012).toFixed(symbol === 'HG/USD' ? 3 : 2)));
  }, [currentPrice, symbol]);

  useEffect(() => {
    if (initialEntry) {
      const match = initialEntry.replace(/[^0-9.]/g, '');
      if (match) setEntryPrice(parseFloat(match));
    }
    if (initialSL) {
      const match = initialSL.replace(/[^0-9.]/g, '');
      if (match) setStopLoss(parseFloat(match));
    }
    if (initialTP) {
      const match = initialTP.replace(/[^0-9.]/g, '');
      if (match) setTakeProfit(parseFloat(match));
    }
  }, [initialEntry, initialSL, initialTP]);

  const riskDollarAmount = (balance * riskPercent) / 100;
  const slDistance = Math.abs(entryPrice - stopLoss);
  const tpDistance = Math.abs(takeProfit - entryPrice);

  // Stop loss in dollars per standard lot = slDistance * lotMultiplier
  const standardLotRisk = slDistance * lotMultiplier;
  const calculatedStandardLots = standardLotRisk > 0 ? riskDollarAmount / standardLotRisk : 0.01;
  const standardLots = Math.max(0.01, Math.min(50, Number(calculatedStandardLots.toFixed(2))));

  // Profit calculation
  const potentialProfit = standardLots * tpDistance * lotMultiplier;
  const riskRewardRatio = slDistance > 0 ? (tpDistance / slDistance).toFixed(2) : '0';

  const isRiskTooHigh = riskPercent > 3;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {lang === 'ar' ? `حاسبة إدارة المخاطر وحجم اللوت (${symbol})` : `Risk & Lot Size Calculator (${symbol})`}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'حساب رياضي دقيق لحجم العقد لحماية رأس المال من التراجع العنيف'
                : 'Exact mathematical contract sizing based on risk tolerance'}
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAction('BUY')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              action === 'BUY'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'شراء BUY' : 'BUY'}
          </button>
          <button
            onClick={() => setAction('SELL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              action === 'SELL'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'بيع SELL' : 'SELL'}
          </button>
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Account Balance */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>{lang === 'ar' ? 'رأس مال الحساب ($)' : 'Account Balance ($)'}</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={balance}
            onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono-nums font-bold text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Risk Percentage */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>{lang === 'ar' ? 'نسبة المخاطرة %' : 'Risk Percentage %'}</span>
            <span className="text-[10px] text-amber-400 font-bold">{lang === 'ar' ? 'الموصى: 1-2%' : 'Rec: 1-2%'}</span>
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((pct) => (
              <button
                key={pct}
                onClick={() => setRiskPercent(pct)}
                className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                  riskPercent === pct
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {pct}%
              </button>
            ))}
            <input
              type="number"
              min="0.1"
              max="20"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 1)}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 text-center text-white font-mono-nums text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Entry Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>{lang === 'ar' ? 'سعر الدخول ($)' : 'Entry Price ($)'}</span>
            <button
              onClick={() => setEntryPrice(currentPrice)}
              className="text-[10px] text-amber-400 hover:underline"
            >
              {lang === 'ar' ? 'استخدم السعر الحالي' : 'Use Current'}
            </button>
          </label>
          <input
            type="number"
            step="0.01"
            value={entryPrice}
            onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono-nums font-bold text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Stop Loss */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>{lang === 'ar' ? 'وقف الخسارة ($)' : 'Stop Loss ($)'}</span>
            <span className="text-[10px] text-rose-400 font-mono-nums font-bold">
              {slDistance.toFixed(2)}$
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-rose-900/60 rounded-xl px-3.5 py-2 text-rose-400 font-mono-nums font-bold text-sm focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Target Profit Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>{lang === 'ar' ? 'سعر جني الأرباح المستهدف TP ($)' : 'Target Take Profit ($)'}</span>
            <span className="text-[10px] text-emerald-400 font-mono-nums font-bold">
              +{tpDistance.toFixed(2)}$
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            value={takeProfit}
            onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-emerald-900/60 rounded-xl px-3.5 py-2 text-emerald-400 font-mono-nums font-bold text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs text-slate-400">{lang === 'ar' ? 'نسبة العائد إلى المخاطرة (R:R):' : 'Risk to Reward Ratio:'}</span>
          <div className="text-lg font-bold font-mono-nums text-white flex items-center gap-2 mt-0.5">
            <span>1 : {riskRewardRatio}</span>
            {parseFloat(riskRewardRatio) >= 2 ? (
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {lang === 'ar' ? 'ممتاز (فوق 1:2)' : 'Optimal (>1:2)'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {lang === 'ar' ? 'أقل من الموصى' : 'Sub-optimal'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Results HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Recommended Lot Size */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 relative overflow-hidden">
          <span className="text-xs text-amber-300 font-semibold block mb-1">
            {lang === 'ar' ? 'حجم اللوت القياسي الموصى به' : 'Recommended Lot Size'}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-nums text-white">
            {standardLots} <span className="text-xs font-sans text-amber-400">LOT</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {lang === 'ar'
              ? `مبني على مضاعف العقد (${lotMultiplier} وحدة لكل 1 لوت)`
              : `Based on contract multiplier (${lotMultiplier} units / 1 lot)`}
          </p>
        </div>

        {/* Dollar Risk Amount */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-950/60">
          <span className="text-xs text-rose-400 font-semibold block mb-1">
            {lang === 'ar' ? 'أقصى خسارة محتملة في الصفقة' : 'Maximum Risk At Stop Loss'}
          </span>
          <div className="text-2xl font-black font-mono-nums text-rose-400">
            -${riskDollarAmount.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {lang === 'ar'
              ? `لا تتجاوز ${riskPercent}% من إجمالي رصيدك البالغ $${balance}`
              : `Strictly ${riskPercent}% limit of your $${balance} account`}
          </p>
        </div>

        {/* Potential Profit Amount */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-950/60">
          <span className="text-xs text-emerald-400 font-semibold block mb-1">
            {lang === 'ar' ? 'الربح المتوقع عند الهدف TP' : 'Potential Profit At Take Profit'}
          </span>
          <div className="text-2xl font-black font-mono-nums text-emerald-400">
            +${potentialProfit.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {lang === 'ar'
              ? `عائد تقديري يعادل +${((potentialProfit / balance) * 100).toFixed(1)}% على المحفظة`
              : `Estimated +${((potentialProfit / balance) * 100).toFixed(1)}% portfolio growth`}
          </p>
        </div>
      </div>

      {isRiskTooHigh && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            {lang === 'ar'
              ? 'تنبيه أمان: المخاطرة بأكثر من 3% في سوق المعادن ترفع احتمالية الخسائر المتتالية بشكل حاد. ينصح بالبقاء بين 1% إلى 2%.'
              : 'Caution: Risking more than 3% in metals exposes accounts to severe drawdowns. We recommend 1-2%.'}
          </span>
        </div>
      )}
    </div>
  );
};
