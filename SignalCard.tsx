import React, { useState } from 'react';
import { DeepAnalysisResult, Language } from '../types';
import {
  TrendingUp,
  TrendingDown,
  PauseCircle,
  ShieldAlert,
  Target,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Brain,
  Scale,
  Clock,
  AlertTriangle,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface SignalCardProps {
  analysis: DeepAnalysisResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  lang: Language;
  onApplyToCalculator: (entry: string, sl: string, tp: string) => void;
  onExecuteInDemoTracker: (analysis: DeepAnalysisResult) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  analysis,
  isLoading,
  onRefresh,
  lang,
  onApplyToCalculator,
  onExecuteInDemoTracker,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [executedToast, setExecutedToast] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 animate-pulse" />
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-spin">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              {lang === 'ar'
                ? 'جاري تحليل السوق بالذكاء الاصطناعي وتوليد التوصية الفورية...'
                : 'AI Analyzing Market Data & Formulating High-Accuracy Signal...'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              {lang === 'ar'
                ? 'يتم تقييم مستويات الدعم والمقاومة، ومؤشرات السيولة، ومؤشر الدولار الأمريكي (DXY) لضمان دقة إشارة (شراء / بيع / انتظار).'
                : 'Evaluating order blocks, liquidity sweeps, RSI momentum, and US Dollar fundamentals.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
        <p className="text-slate-400 text-sm mb-3">
          {lang === 'ar' ? 'لا توجد إشارة نشطة حالياً.' : 'No active recommendation available.'}
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          {lang === 'ar' ? 'توليد توصية جديدة الآن' : 'Generate AI Signal Now'}
        </button>
      </div>
    );
  }

  const isBuy = analysis.signal === 'BUY';
  const isSell = analysis.signal === 'SELL';
  const isHold = analysis.signal === 'HOLD';

  const badgeConfig = {
    BUY: {
      color: 'bg-emerald-500 text-slate-950 border-emerald-400',
      glow: 'shadow-emerald-500/25',
      labelAr: 'إشارة شراء (BUY)',
      labelEn: 'BUY / LONG',
      icon: TrendingUp,
    },
    SELL: {
      color: 'bg-rose-500 text-white border-rose-400',
      glow: 'shadow-rose-500/25',
      labelAr: 'إشارة بيع (SELL)',
      labelEn: 'SELL / SHORT',
      icon: TrendingDown,
    },
    HOLD: {
      color: 'bg-amber-500/90 text-slate-950 border-amber-400',
      glow: 'shadow-amber-500/20',
      labelAr: 'ترقب وانتظار (HOLD)',
      labelEn: 'HOLD / WAIT',
      icon: PauseCircle,
    },
  }[analysis.signal];

  const IconComponent = badgeConfig.icon;

  const handleCopy = () => {
    const textToCopy = `[AI Trading Assistant Signal]
Asset: ${analysis.symbol}
Action: ${analysis.signal}
Entry Zone: ${analysis.entryZone}
Stop Loss: ${analysis.stopLoss}
Take Profit 1: ${analysis.tp1}
Take Profit 2: ${analysis.tp2}
Take Profit 3: ${analysis.tp3}
Risk:Reward: ${analysis.riskRewardRatio}
Timeframe: ${analysis.recommendedTimeframe}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleExecuteDemo = () => {
    onExecuteInDemoTracker(analysis);
    setExecutedToast(true);
    setTimeout(() => setExecutedToast(false), 3000);
  };

  return (
    <div
      className={`bg-slate-900/95 border rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all ${
        isBuy
          ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
          : isSell
          ? 'border-rose-500/40 ring-1 ring-rose-500/20'
          : 'border-amber-500/30'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${
              isBuy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isSell
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide border shadow-md ${badgeConfig.color} ${badgeConfig.glow}`}
              >
                {lang === 'ar' ? badgeConfig.labelAr : badgeConfig.labelEn}
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 font-bold">
                <Brain className="w-3.5 h-3.5" />
                {lang === 'ar' ? `دقة التحليل: ${analysis.confidence}%` : `Confidence: ${analysis.confidence}%`}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              {lang === 'ar' ? analysis.signalTitleAr : analysis.signalTitleEn}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Demo Execution Button */}
          {!isHold && (
            <button
              onClick={handleExecuteDemo}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              title={lang === 'ar' ? 'تنفيذ الصفقة ومتابعة أرباحها في الحساب التجريبي' : 'Track in Demo Paper Trading'}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تنفيذ في التجريبي' : 'Track in Demo'}</span>
            </button>
          )}

          <button
            onClick={() => onApplyToCalculator(analysis.entryZone, analysis.stopLoss, analysis.tp1)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            title={lang === 'ar' ? 'تطبيق في حاسبة إدارة المخاطر' : 'Apply to Risk Calculator'}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'حساب اللوت' : 'Calc Lots'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title={lang === 'ar' ? 'نسخ أرقام الصفقة لبرامج التداول' : 'Copy parameters'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
          </button>

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Toast for Demo Execution */}
      {executedToast && (
        <div className="my-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {lang === 'ar'
              ? 'تم فتح وتتبع الصفقة في لوحة التداول الافتراضي بنجاح! راقب أرباحها وخسائرها لحظياً من تبويب (الصفقات الافتراضية).'
              : 'Trade executed in Demo Tracker! You can monitor live P&L in the Demo tab.'}
          </span>
        </div>
      )}

      {/* Key Numbers Grid (Entry, SL, TP1, R:R) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Entry Zone */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'سعر الدخول' : 'Entry Zone'}</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono-nums text-white">
            {analysis.entryZone}
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium mt-1">
            {lang === 'ar' ? 'نقطة التمركز' : 'Ideal price level'}
          </span>
        </div>

        {/* Stop Loss */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-rose-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'وقف الخسارة (SL)' : 'Stop Loss (SL)'}</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono-nums text-rose-400">
            {analysis.stopLoss}
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium mt-1">
            {lang === 'ar' ? 'حماية رأس المال' : 'Defense benchmark'}
          </span>
        </div>

        {/* Take Profit 1 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-emerald-950/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'الهدف الأول (TP1)' : 'Target 1 (TP1)'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono-nums text-emerald-400">
            {analysis.tp1}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium mt-1">
            {lang === 'ar' ? 'الهدف الرئيسي الأول' : 'Primary take profit'}
          </span>
        </div>

        {/* Risk / Reward & Timeframe */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'العائد : المخاطرة' : 'Risk : Reward'}</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono-nums text-cyan-300">
            {analysis.riskRewardRatio}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            {lang === 'ar' ? `فريم: ${analysis.recommendedTimeframe}` : `TF: ${analysis.recommendedTimeframe}`}
          </span>
        </div>
      </div>

      {/* Extended Targets (TP2 & TP3) Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono-nums">
        <span className="text-slate-400 font-medium">{lang === 'ar' ? 'أهداف التمديد الإضافية:' : 'Extended Profit Targets:'}</span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
          TP2: <b>{analysis.tp2}</b>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
          TP3: <b>{analysis.tp3}</b>
        </span>
        <span className="text-slate-500 text-[11px] mr-auto">
          {lang === 'ar' ? `الاتجاه العام: ${analysis.trendOutlook}` : `Macro Trend: ${analysis.trendOutlook}`}
        </span>
      </div>

      {/* Accordion Toggle for Reasoning & Justification */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-amber-400" />
            {lang === 'ar' ? 'سبب التحليل وتبرير القرار (مفصل ومباشر)' : 'Detailed Technical Reasoning & Decision Justification'}
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs leading-relaxed">
            {/* 1. Reasoning / سبب التحليل */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <h4 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {lang === 'ar' ? 'سبب التحليل الفني (Technical Reasoning)' : 'Technical Reasoning'}
              </h4>
              <p className="text-slate-300 whitespace-pre-wrap">{analysis.reasoning}</p>
            </div>

            {/* 2. Justification / تبرير القرار */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <h4 className="font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {lang === 'ar' ? 'تبرير قرار التوصية (Decision Justification)' : 'Decision Justification'}
              </h4>
              <p className="text-slate-300 whitespace-pre-wrap">{analysis.justification}</p>
            </div>

            {/* Key advice */}
            <div className="md:col-span-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <span className="font-bold block mb-0.5">
                {lang === 'ar' ? '💡 نصيحة إدارة المخاطر الخاصة بالصفقة:' : '💡 Risk Execution Rule:'}
              </span>
              <p>{analysis.keyAdvice}</p>
            </div>

            {/* Warnings if any */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="md:col-span-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">
                    {lang === 'ar' ? 'تنبيهات وملاحظات مهمة:' : 'Important Session Cautions:'}
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {analysis.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
