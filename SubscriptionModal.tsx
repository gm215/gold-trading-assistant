import React, { useState } from 'react';
import { SubscriptionState, Language } from '../types';
import {
  Crown,
  Sparkles,
  CheckCircle,
  Clock,
  CreditCard,
  Zap,
  X,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onActivateSubscription: () => void;
  onResetTrial: () => void;
  onSimulateExpiredTrial: () => void;
  lang: Language;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onActivateSubscription,
  onResetTrial,
  onSimulateExpiredTrial,
  lang,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'apple' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onActivateSubscription();
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'ar' ? 'باقة GoldAdvisor PRO' : 'GoldAdvisor PRO Plan'}
          </h3>

          {/* Trial Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono-nums border">
            {subscription.isSubscribed ? (
              <span className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 flex items-center gap-1.5 px-3 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'أنت مشترك حالياً في باقة PRO النشطة' : 'Active PRO Membership'}
              </span>
            ) : subscription.isTrialExpired ? (
              <span className="bg-rose-500/20 text-rose-400 border-rose-500/40 flex items-center gap-1.5 px-3 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'انتهت الفترة التجريبية (7 أيام) - اشترك للمتابعة' : '7-Day Free Trial Expired'}
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {lang === 'ar'
                  ? `فترة تجريبية مجانية: متبقي ${subscription.trialDaysRemaining} أيام`
                  : `Free Trial Active: ${subscription.trialDaysRemaining} days remaining`}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 mb-5 relative">
          <div className="flex items-baseline justify-between mb-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-amber-400 font-bold block uppercase tracking-wider">
                {lang === 'ar' ? 'اشتراك شهري شامل' : 'All-Inclusive Monthly'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono-nums">$5</span>
                <span className="text-xs text-slate-400">{lang === 'ar' ? '/ شهرياً' : '/ month'}</span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              {lang === 'ar' ? 'أول 7 أيام مجاناً' : '7 Days Free First'}
            </span>
          </div>

          {/* Features Checklist */}
          <ul className="space-y-2 text-xs text-slate-200">
            {[
              lang === 'ar' ? 'توصيات لحظية بالذكاء الاصطناعي (شراء / بيع / انتظار)' : 'Live AI recommendations (BUY / SELL / HOLD)',
              lang === 'ar' ? 'تغذية الأسعار الحقيقية والمباشرة من GoldAPI.io' : 'Live real-time feed from GoldAPI.io for all metals',
              lang === 'ar' ? 'تحديد دقيق لسعر الدخول، وقف الخسارة، و3 أهداف ربح' : 'Exact entry zone, stop loss, and TP1, TP2, TP3 targets',
              lang === 'ar' ? 'تغطية شاملة للمعادن الثمينة والصناعية (ذهب، فضة، نحاس، ألومنيوم، نيكل)' : 'Full coverage of Precious & Industrial metals',
              lang === 'ar' ? 'محفظة التداول الافتراضي (Demo Tracker) بلا قيود' : 'Unlimited Virtual Demo Paper Trading Tracker',
              lang === 'ar' ? 'استشارات غير محدودة مع المساعد الذكي AI Copilot' : 'Unlimited conversational advice with AI Copilot',
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2 mb-5">
          <label className="text-xs text-slate-400 block font-medium">
            {lang === 'ar' ? 'اختر وسيلة الدفع المناسبة:' : 'Select Payment Method:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedMethod('card')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedMethod === 'card'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{lang === 'ar' ? 'بطاقة بنكية' : 'Card'}</span>
            </button>

            <button
              onClick={() => setSelectedMethod('apple')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedMethod === 'apple'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Apple Pay</span>
            </button>

            <button
              onClick={() => setSelectedMethod('crypto')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedMethod === 'crypto'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>USDT / Crypto</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubscribe}
          disabled={isProcessing}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isProcessing
              ? (lang === 'ar' ? 'جاري تأكيد الاشتراك...' : 'Processing...')
              : subscription.isSubscribed
              ? (lang === 'ar' ? 'تحديث وتجديد الاشتراك' : 'Renew Subscription')
              : (lang === 'ar' ? 'تأكيد الاشتراك الآن (5$ شهرياً)' : 'Subscribe Now ($5 / month)')}
          </span>
        </button>

        {successToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
            {lang === 'ar' ? 'تهانينا! تم تفعيل اشتراكك في باقة PRO بنجاح.' : 'Success! PRO subscription is now active.'}
          </div>
        )}

        {/* Developer Sandbox Controls (For Testing) */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{lang === 'ar' ? 'أدوات اختبار المشرف:' : 'Tester Controls:'}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateExpiredTrial}
              className="text-rose-400 hover:underline"
              title="اختبار ظهور واجهة انتهاء الفترة التجريبية"
            >
              {lang === 'ar' ? 'محاكاة انتهاء التجربة' : 'Simulate Expired'}
            </button>
            <span>•</span>
            <button
              onClick={onResetTrial}
              className="text-amber-400 hover:underline"
              title="إعادة تعيين التجربة إلى 7 أيام"
            >
              {lang === 'ar' ? 'إعادة ضبط 7 أيام' : 'Reset 7-Day'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
