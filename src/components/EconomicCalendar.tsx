import React, { useState, useEffect } from 'react';
import { EconomicEvent, Language } from '../types';
import { Calendar, Flame, AlertCircle, TrendingUp, Info } from 'lucide-react';

interface EconomicCalendarProps {
  lang: Language;
}

export const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ lang }) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market/economic-calendar')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch((err) => console.error('Error fetching calendar:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {lang === 'ar' ? 'الأجندة الاقتصادية وتأثيرها على الذهب' : 'Gold Macro Economic Calendar'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'أهم الأخبار والبيانات الأمريكية التي تحرك أسعار الذهب الفوري بقوة'
                : 'High-impact economic catalysts driving XAU/USD volatility'}
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 font-semibold">
          <Flame className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'أحداث عالية التأثير' : 'High Impact Events'}
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          {lang === 'ar' ? 'جاري تحميل الأجندة الاقتصادية...' : 'Loading economic events...'}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                    {evt.country}
                  </span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {lang === 'ar' ? evt.eventAr : evt.eventEn}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono-nums">{evt.date}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.impact === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {evt.impact}
                  </span>
                </div>
              </div>

              {/* Forecast & Previous Numbers */}
              <div className="flex items-center gap-4 text-xs font-mono-nums text-slate-400 mb-2">
                <span>{lang === 'ar' ? 'التوقع:' : 'Forecast:'} <b className="text-slate-200">{evt.forecast}</b></span>
                <span>{lang === 'ar' ? 'السابق:' : 'Previous:'} <b className="text-slate-200">{evt.previous}</b></span>
              </div>

              {/* Direct Effect on Gold */}
              <div className="flex items-start gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-amber-200/90 leading-relaxed">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <b className="text-white">{lang === 'ar' ? 'تأثيره المباشر على الذهب: ' : 'Gold Impact: '}</b>
                  {evt.goldEffect}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gold Market Sentiment Gauge */}
      <div className="mt-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block mb-1">
            {lang === 'ar' ? 'مؤشر معنويات المتداولين على الذهب (Market Sentiment):' : 'XAU/USD Market Sentiment Meter:'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">68% {lang === 'ar' ? 'شراء (Bullish)' : 'Bullish'}</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400 font-bold text-sm">32% {lang === 'ar' ? 'بيع (Bearish)' : 'Bearish'}</span>
          </div>
        </div>
        <div className="w-full sm:w-48 bg-slate-800 h-3 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full" style={{ width: '68%' }} title="Bullish 68%" />
          <div className="bg-rose-500 h-full" style={{ width: '32%' }} title="Bearish 32%" />
        </div>
      </div>
    </div>
  );
};
