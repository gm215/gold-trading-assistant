import React, { useState } from 'react';
import { Language, TradeValidation } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';

interface TradePlanValidatorProps {
  currentPrice: number;
  lang: Language;
}

export const TradePlanValidator: React.FC<TradePlanValidatorProps> = ({ currentPrice, lang }) => {
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [entry, setEntry] = useState<string>(currentPrice.toString());
  const [stopLoss, setStopLoss] = useState<string>((currentPrice - 8).toFixed(2));
  const [takeProfit, setTakeProfit] = useState<string>((currentPrice + 20).toFixed(2));
  const [balance, setBalance] = useState<string>('5000');
  const [riskPercent, setRiskPercent] = useState<string>('2');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ evaluation: TradeValidation; math: any } | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/evaluate-trade-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          entry,
          stopLoss,
          takeProfit,
          balance,
          riskPercent,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {lang === 'ar' ? 'فاحص ومحكم صفقات الذهب بالذكاء الاصطناعي' : 'AI Trade Plan Auditor & Validator'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'أدخل خطتك المبدئية وسيقوم الذكاء الاصطناعي بتقييمها واكتشاف أي ثغرات أو مخاطر خفية'
                : 'Test your planned setup before executing to catch bad risk/reward or liquidation traps'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleEvaluate} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Action */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 block">{lang === 'ar' ? 'نوع الصفقة' : 'Action'}</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as 'BUY' | 'SELL')}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="BUY">{lang === 'ar' ? 'شراء BUY' : 'BUY'}</option>
            <option value="SELL">{lang === 'ar' ? 'بيع SELL' : 'SELL'}</option>
          </select>
        </div>

        {/* Entry */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 block">{lang === 'ar' ? 'سعر الدخول ($)' : 'Entry ($)'}</label>
          <input
            type="number"
            step="0.1"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-nums text-xs focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        {/* Stop Loss */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 block">{lang === 'ar' ? 'وقف الخسارة ($)' : 'Stop Loss ($)'}</label>
          <input
            type="number"
            step="0.1"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full bg-slate-950 border border-rose-900/50 rounded-xl px-3 py-2 text-rose-400 font-mono-nums text-xs focus:outline-none focus:border-rose-500"
            required
          />
        </div>

        {/* Take Profit */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 block">{lang === 'ar' ? 'جني الأرباح ($)' : 'Take Profit ($)'}</label>
          <input
            type="number"
            step="0.1"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-3 py-2 text-emerald-400 font-mono-nums text-xs focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Balance */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400 block">{lang === 'ar' ? 'الرصيد ($)' : 'Balance ($)'}</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono-nums text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Submit */}
        <div className="space-y-1 flex flex-col justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? (lang === 'ar' ? 'جاري الفحص...' : 'Auditing...') : (lang === 'ar' ? 'تحكيم الصفقة' : 'Audit Plan')}</span>
          </button>
        </div>
      </form>

      {/* Validation Results Display */}
      {result && (
        <div className="mt-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black ${
                  result.evaluation.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : result.evaluation.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {result.evaluation.status}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {lang === 'ar' ? `درجة جودة الصفقة: ${result.evaluation.score}/100` : `Quality Score: ${result.evaluation.score}/100`}
              </span>
            </div>

            <div className="text-xs font-mono-nums text-slate-400 flex items-center gap-3">
              <span>{lang === 'ar' ? 'العائد:المخاطرة:' : 'R:R:'} <b className="text-cyan-400">{result.math.riskRewardRatio}</b></span>
              <span>{lang === 'ar' ? 'اللوت الموصى به:' : 'Rec Lot:'} <b className="text-amber-400">{result.math.recommendedLots}</b></span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {lang === 'ar' ? result.evaluation.summaryAr : result.evaluation.summaryEn}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Pros */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
              <span className="font-bold block mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'ar' ? 'نقاط القوة في الخطة:' : 'Plan Strengths:'}
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {result.evaluation.pros?.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300">
              <span className="font-bold block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {lang === 'ar' ? 'المخاطر والنواقص:' : 'Risk Flags:'}
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {result.evaluation.cons?.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
            <b className="text-amber-300">{lang === 'ar' ? 'الحكم النهائي لإدارة المخاطر: ' : 'Risk Officer Verdict: '}</b>
            {result.evaluation.riskVerdict}
          </div>
        </div>
      )}
    </div>
  );
};
