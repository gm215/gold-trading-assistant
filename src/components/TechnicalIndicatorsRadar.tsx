import React from 'react';
import { MarketOverview, Language } from '../types';
import { Gauge, Activity, Compass, BarChart2, ShieldCheck, Zap } from 'lucide-react';

interface TechnicalIndicatorsRadarProps {
  overview: MarketOverview | null;
  lang: Language;
}

export const TechnicalIndicatorsRadar: React.FC<TechnicalIndicatorsRadarProps> = ({
  overview,
  lang,
}) => {
  if (!overview) return null;

  const { indicators, price } = overview;
  const { rsi, ema20, ema50, ema200, macd, pivots, atr14 } = indicators;

  // Determine RSI sentiment
  const rsiSentiment =
    rsi > 70
      ? { textAr: 'تشبع شرائي (فوق 70)', textEn: 'Overbought (>70)', color: 'text-rose-400', bg: 'bg-rose-500' }
      : rsi < 30
      ? { textAr: 'تشبع بيعي (أقل من 30)', textEn: 'Oversold (<30)', color: 'text-emerald-400', bg: 'bg-emerald-500' }
      : { textAr: 'منطقة محايدة / زخم إيجابي', textEn: 'Neutral / Steady Momentum', color: 'text-amber-400', bg: 'bg-amber-500' };

  // Determine EMA Trend
  const emaTrendBullish = price > ema20 && ema20 > ema50;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              {lang === 'ar' ? 'رادار المؤشرات الفنية للذهب' : 'Gold Technical Indicators Radar'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'حسابات رياضية دقيقة مبنية على إغلاقات الشموع اللحظية' : 'Live algorithmic metrics for XAU/USD'}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono-nums font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          ATR(14): ${atr14}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RSI Box */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              RSI (14)
            </span>
            <span className={`font-mono-nums font-bold text-sm ${rsiSentiment.color}`}>{rsi}</span>
          </div>

          {/* Visual Gauge Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${rsiSentiment.bg}`}
              style={{ width: `${Math.min(100, Math.max(0, rsi))}%` }}
            />
            {/* 30 & 70 marks */}
            <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-slate-600" title="30 Oversold" />
            <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-slate-600" title="70 Overbought" />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">30 (دعم)</span>
            <span className={`font-medium ${rsiSentiment.color}`}>
              {lang === 'ar' ? rsiSentiment.textAr : rsiSentiment.textEn}
            </span>
            <span className="text-slate-500">70 (مقاومة)</span>
          </div>
        </div>

        {/* Moving Averages Alignment */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'ar' ? 'المتوسطات المتحركة (EMA)' : 'Moving Averages (EMA)'}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                emaTrendBullish ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {emaTrendBullish ? (lang === 'ar' ? 'ترتيب صاعد' : 'Bullish Stack') : (lang === 'ar' ? 'ترتيب هابط' : 'Bearish Stack')}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono-nums">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-cyan-400">EMA 20:</span>
              <span className="font-bold">${ema20}</span>
              <span className={price > ema20 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                {price > ema20 ? '▲ فوق المتوسط' : '▼ تحت المتوسط'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-amber-400">EMA 50:</span>
              <span className="font-bold">${ema50}</span>
              <span className={price > ema50 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                {price > ema50 ? '▲ فوق المتوسط' : '▼ تحت المتوسط'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-purple-400">EMA 200:</span>
              <span className="font-bold">${ema200}</span>
              <span className={price > ema200 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                {price > ema200 ? '▲ اتجاه طويل صاعد' : '▼ اتجاه هابط'}
              </span>
            </div>
          </div>
        </div>

        {/* MACD Box */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              MACD (12, 26, 9)
            </span>
            <span
              className={`font-mono-nums font-bold text-xs ${
                macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Hist: {macd.histogram > 0 ? `+${macd.histogram}` : macd.histogram}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono-nums">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">MACD Line:</span>
              <span className="font-bold text-white">{macd.line}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Signal Line:</span>
              <span className="font-bold text-amber-400">{macd.signal}</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            {macd.histogram >= 0 ? (
              <span className="text-emerald-400 font-medium">
                {lang === 'ar' ? 'تقاطع إيجابي يدعم استمرار الصعود' : 'Positive histogram indicates buying pressure'}
              </span>
            ) : (
              <span className="text-rose-400 font-medium">
                {lang === 'ar' ? 'تقاطع سلبي يشير لضغوط بيعية' : 'Negative histogram indicates selling pressure'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Pivot Points (Classic Floor Levels) */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">
              {lang === 'ar' ? 'مستويات البيفوت المحورية اليومية (Pivot Points)' : 'Daily Pivot Point Levels'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {lang === 'ar' ? 'الدعوم والمقاومات الحسابية' : 'Key Support & Resistance Benchmarks'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs font-mono-nums">
          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/30">
            <span className="text-[10px] text-rose-400 block font-sans">R3 (أقصى مقاومة)</span>
            <b className="text-rose-300">${pivots.r3}</b>
          </div>
          <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/20">
            <span className="text-[10px] text-rose-400 block font-sans">R2 (مقاومة 2)</span>
            <b className="text-rose-300">${pivots.r2}</b>
          </div>
          <div className="p-2 rounded-lg bg-rose-950/10 border border-rose-900/20">
            <span className="text-[10px] text-rose-400 block font-sans">R1 (مقاومة 1)</span>
            <b className="text-rose-300">${pivots.r1}</b>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <span className="text-[10px] text-amber-400 block font-sans font-bold">PIVOT (الارتكاز)</span>
            <b className="text-amber-300 font-bold">${pivots.pp}</b>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/10 border border-emerald-900/20">
            <span className="text-[10px] text-emerald-400 block font-sans">S1 (دعم 1)</span>
            <b className="text-emerald-300">${pivots.s1}</b>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/20">
            <span className="text-[10px] text-emerald-400 block font-sans">S2 (دعم 2)</span>
            <b className="text-emerald-300">${pivots.s2}</b>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/30">
            <span className="text-[10px] text-emerald-400 block font-sans">S3 (أقصى دعم)</span>
            <b className="text-emerald-300">${pivots.s3}</b>
          </div>
        </div>
      </div>
    </div>
  );
};
