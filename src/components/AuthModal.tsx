import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  ShieldCheck,
  Check,
  LogIn,
  UserPlus,
  LogOut,
  Smartphone,
  Sparkles,
  AlertCircle,
  Edit3,
  Loader2,
  Save,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  lang,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing state for already logged-in user
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editName, setEditName] = useState(user?.displayName || '');

  useEffect(() => {
    if (user) {
      setEditPhone(user.phone || '');
      setEditName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 خانات.' : 'Password must be at least 6 characters.');
      return;
    }

    if (mode === 'REGISTER' && !phone) {
      setError(lang === 'ar' ? 'يرجى إدخال رقم الهاتف للمصادقة وتأمين الحساب.' : 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = mode === 'REGISTER' ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload =
        mode === 'REGISTER'
          ? {
              email: email.trim(),
              password,
              phone: phone.trim(),
              displayName: displayName.trim() || email.split('@')[0],
            }
          : {
              email: email.trim(),
              password,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (lang === 'ar' ? 'فشلت العملية، يرجى المحاولة ثانية.' : 'Authentication failed.'));
      }

      onLogin(data.user);
      setSuccessMsg(
        lang === 'ar'
          ? mode === 'REGISTER'
            ? 'تم إنشاء حساب المتداول وحفظه في السحابة بنجاح!'
            : 'تم تسجيل الدخول بنجاح! تم استرجاع محفظتك وصفقاتك.'
          : 'Authentication successful! Profile and trades synced.'
      );

      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (err: any) {
      setError(err?.message || (lang === 'ar' ? 'تعذر الاتصال بالخادم.' : 'Server connection failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          phone: editPhone.trim(),
          displayName: editName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update details');
      }

      onLogin({
        ...user,
        phone: data.user.phone,
        displayName: data.user.displayName,
      });

      setSuccessMsg(lang === 'ar' ? 'تم تحديث رقم الهاتف والبيانات بنجاح!' : 'Phone & profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-[#0b101d] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User is Already Logged In */}
        {user && user.isLoggedIn ? (
          <div className="space-y-4 text-center pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/25">
              <User className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-0.5">
                {user.displayName}
              </h3>
              <p className="text-xs text-amber-400 font-mono-nums">
                {user.email}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 mt-1 font-mono-nums">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-400 dir-ltr">{user.phone}</span>
              </div>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-right">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 text-right">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Edit details form or Details card */}
            {isEditing ? (
              <form onSubmit={handleUpdateDetails} className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-right">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 justify-end">
                  <span>{lang === 'ar' ? 'تعديل رقم الهاتف والاسم' : 'Update Phone & Details'}</span>
                  <Edit3 className="w-3.5 h-3.5" />
                </h4>

                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {lang === 'ar' ? 'الاسم الجديد' : 'New Name'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">
                    {lang === 'ar' ? 'رقم الهاتف الجديد' : 'New Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white dir-ltr font-mono-nums focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-amber-400 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{lang === 'ar' ? 'حفظ التعديلات' : 'Save Details'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Account Card Features */
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2 text-right">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">{lang === 'ar' ? 'حالة الحساب:' : 'Status:'}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'محفوظ في السحابة ومفعل' : 'Cloud Synchronized'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">{lang === 'ar' ? 'رصيد الحساب الافتراضي:' : 'Paper Balance:'}</span>
                  <span className="text-white font-bold font-mono-nums">${user.balance?.toLocaleString() || '10,000'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">{lang === 'ar' ? 'مزامنة الأجهزة:' : 'Device Sync:'}</span>
                  <span className="text-amber-400 font-semibold">{lang === 'ar' ? 'متاح من أي هاتف آيفون/أندرويد' : 'Active across all devices'}</span>
                </div>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تعديل رقم الهاتف أو الاسم' : 'Change Phone / Details'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-right">
              {lang === 'ar'
                ? '💡 ميزة المزامنة السحابية: إذا غيّرت هاتفك أو فتحت التطبيق من أي جهاز آخر، فقط اكتب بريدك الإلكتروني وكلمة المرور وستجد جميع صفقاتك ورصيدك محفوظين بدقة.'
                : '💡 Cloud Sync: If you switch devices or open from another phone, just log in with this email and password to access your trades and portfolio balance.'}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onLogout}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-4 pt-1">
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'حساب المتداول السحابي' : 'Cloud Trader Account'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {mode === 'LOGIN'
                  ? lang === 'ar' ? 'تسجيل الدخول لحسابك' : 'Sign In to Your Account'
                  : lang === 'ar' ? 'إنشاء حساب متداول جديد' : 'Create Trader Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {lang === 'ar'
                  ? 'سجّل بإيميلك، كلمة سر، ورقم هاتفك لحفظ صفقاتك وتفاصيلك للوصول لها من أي هاتف.'
                  : 'Link email, password & phone to sync your portfolio across all phones and devices.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'LOGIN'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'REGISTER'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'حساب جديد' : 'New Account'}
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Display Name (Register only) */}
              {mode === 'REGISTER' && (
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {lang === 'ar' ? 'اسم المتداول الكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: بلال أحمد' : 'e.g. Bilal Ahmed'}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-2.5 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  {lang === 'ar' ? 'البريد الإلكتروني (Email)' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@example.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-2.5 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono-nums"
                  />
                </div>
              </div>

              {/* Phone (Shown in both register and login as a key identifier) */}
              {mode === 'REGISTER' && (
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    {lang === 'ar' ? 'رقم الهاتف (للمصادقة والتنبيهات)' : 'Phone Number (Authentication & Alerts)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 50 123 4567 / +20 100 123 4567"
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-2.5 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono-nums dir-ltr text-left"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  {lang === 'ar' ? 'الرقم السري (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-2.5 pr-10 pl-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono-nums"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'LOGIN' ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {isLoading
                    ? lang === 'ar' ? 'جاري الاتصال بالخادم...' : 'Connecting to Cloud...'
                    : mode === 'LOGIN'
                    ? lang === 'ar' ? 'تسجيل الدخول ومزامنة البيانات' : 'Sign In & Sync'
                    : lang === 'ar' ? 'إنشاء حساب وتأكيد رقم الهاتف' : 'Create & Verify Account'}
                </span>
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {lang === 'ar'
                  ? 'تشفير سحابي آمن 256-bit، بياناتك محفوظة دائماً حتى لو غيّرت جهازك.'
                  : '256-bit Cloud Encrypted. Your portfolio is accessible from any phone.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
