import React, { useState } from 'react';
import { MetalInfo, MetalSymbol, Language, MetalCategory } from '../types';
import {
  Layers,
  Coins,
  Factory,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

interface MetalsDirectoryProps {
  metals: Record<MetalSymbol, MetalInfo> | null;
  selectedMetal: MetalSymbol;
  onSelectMetal: (sym: MetalSymbol) => void;
  onAnalyzeMetal: (sym: MetalSymbol) => void;
  lang: Language;
}

export const MetalsDirectory: React.FC<MetalsDirectoryProps> = ({
  metals,
  selectedMetal,
  onSelectMetal,
  onAnalyzeMetal,
  lang,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | MetalCategory>('ALL');

  if (!metals) return null;

  const metalList = Object.values(metals);
  const filteredList =
    filterCategory === 'ALL' ? metalList : metalList.filter((m) => m.category === filterCategory);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
      {/* Directory Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              {lang === 'ar' ? 'دليل المعادن الثمينة والصناعية الشامل' : 'Comprehensive Metals & Commodities Hub'}
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                8 المعادن
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'بيانات تحليلية، استخدامات صناعية، ومحركات الطلب العالمي للذهب والمعادن الأساسية'
                : 'Market drivers, industrial use cases, and live contract specifications'}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'الكل (8)' : 'All (8)'}
          </button>
          <button
            onClick={() => setFilterCategory('PRECIOUS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterCategory === 'PRECIOUS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'معادن ثمينة' : 'Precious'}</span>
          </button>
          <button
            onClick={() => setFilterCategory('INDUSTRIAL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterCategory === 'INDUSTRIAL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'معادن صناعية' : 'Industrial'}</span>
          </button>
        </div>
      </div>

      {/* Metals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredList.map((metal) => {
          const isSelected = selectedMetal === metal.symbol;
          const isPos = metal.change >= 0;

          return (
            <div
              key={metal.symbol}
              className={`p-4 rounded-2xl bg-slate-950/80 border transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-amber-500 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        metal.category === 'PRECIOUS'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {metal.symbol.split('/')[0]}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{metal.nameAr}</h4>
                      <span className="text-[10px] text-slate-400 font-mono-nums">{metal.symbol}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      metal.category === 'PRECIOUS'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {metal.category === 'PRECIOUS'
                      ? (lang === 'ar' ? 'معدن ثمين' : 'Precious')
                      : (lang === 'ar' ? 'صناعي' : 'Industrial')}
                  </span>
                </div>

                {/* Price & Change */}
                <div className="flex items-baseline justify-between my-2 font-mono-nums">
                  <div>
                    <span className="text-lg font-black text-white">
                      ${metal.price.toFixed(metal.symbol === 'HG/USD' ? 3 : 2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{metal.unit}</span>
                  </div>

                  <div className={`text-xs font-bold flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isPos ? `+${metal.change}` : metal.change} ({metal.changePercent}%)</span>
                  </div>
                </div>

                {/* Industrial Usage / Market Catalyst */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed mb-1">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold mb-1">
                    <Info className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'ar' ? 'الاستخدام ومحركات الطلب:' : 'Industrial Drivers:'}</span>
                  </div>
                  <p className="line-clamp-3">
                    {lang === 'ar' ? metal.industrialUseAr : metal.industrialUseEn}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Specifications & Action */}
              <div className="space-y-2 pt-2 border-t border-slate-900 text-[10px] font-mono-nums text-slate-400">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'حجم اللوت:' : 'Lot Spec:'}</span>
                  <b className="text-white">1 Lot = {metal.lotMultiplier.toLocaleString()}</b>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'البورصة:' : 'Exchange:'}</span>
                  <b className="text-amber-400">{metal.exchange || 'COMEX/LME'}</b>
                </div>

                <button
                  onClick={() => {
                    onSelectMetal(metal.symbol);
                    onAnalyzeMetal(metal.symbol);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-850 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSelected ? (lang === 'ar' ? 'المعدن المحدد حالياً' : 'Selected Metal') : (lang === 'ar' ? 'تحليل هذا المعدن' : 'Analyze Metal')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
