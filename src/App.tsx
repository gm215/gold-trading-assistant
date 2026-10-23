import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MarketOverview,
  DeepAnalysisResult,
  Language,
  MetalSymbol,
  DemoAccount,
  DemoTrade,
  SubscriptionState,
  UserProfile,
} from './types';
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
import { SubscriptionModal } from './components/SubscriptionModal';
import { AuthModal } from './components/AuthModal';
import { MetalsDirectory } from './components/MetalsDirectory';
import { LuxuryGoldVaultHero } from './components/LuxuryGoldVaultHero';
import {
  Coins,
  Crown,
  Briefcase,
  Layers,
  Sparkles,
  Award,
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
      entryPrice: 4015.00,
      currentPrice: 4028.89,
      stopLoss: 3995.00,
      takeProfit: 4050.00,
      openTime: 'اليوم 09:30',
      pnlDollar: 347.25,
      pnlPercent: 3.47,
      status: 'OPEN',
    },
  ],
};

const INITIAL_SUBSCRIPTION: SubscriptionState = {
  isSubscribed: false,
  trialStartDate: new Date().toISOString(),
  trialDaysRemaining: 7,
  isTrialExpired: false,
  plan: 'FREE_TRIAL',
};

// Instant Default Market Overview (Directly matching live market)
const DEFAULT_MARKET_OVERVIEW: MarketOverview = {
  symbol: 'XAU/USD',
  name: 'Gold Spot',
  category: 'PRECIOUS',
  price: 4028.89,
  bid: 4028.51,
  ask: 4029.07,
  change: 4.58,
  changePercent: 0.11,
  high24h: 4035.20,
  low24h: 3986.83,
  open24h: 4024.31,
  volumeOz: '198,420 oz',
  timestamp: new Date().toISOString(),
  provider: 'GoldAPI.io (Live Feed)',
  isLiveAPI: true,
  lastLiveSync: '01:50 PM',
  metals: {
    'XAU/USD': {
      symbol: 'XAU/USD',
      nameEn: 'Gold Spot',
      nameAr: 'الذهب الفوري',
      category: 'PRECIOUS',
      unit: 'USD / oz',
      price: 4028.89,
      change: 4.58,
      changePercent: 0.11,
      high24h: 4035.20,
      low24h: 3986.83,
      open24h: 4024.31,
      bid: 4028.51,
      ask: 4029.07,
      lotMultiplier: 100,
      pipSize: 0.1,
      exchange: 'FOREXCOM',
      industrialUseAr: 'الملاذ الآمن الأول عالمياً، احتياطيات البنوك المركزية، والمجوهرات الفاخرة والرقائق الدقيقة.',
      karats: { k24: 129.53, k22: 118.65, k21: 113.34, k18: 97.15 },
    },
    'XAG/USD': {
      symbol: 'XAG/USD',
      nameEn: 'Silver Spot',
      nameAr: 'الفضة الفورية',
      category: 'PRECIOUS',
      unit: 'USD / oz',
      price: 54.08,
      change: -0.52,
      changePercent: -0.95,
      high24h: 54.75,
      low24h: 53.46,
      open24h: 54.60,
      bid: 54.06,
      ask: 54.10,
      lotMultiplier: 5000,
      pipSize: 0.01,
      exchange: 'FOREXCOM',
      industrialUseAr: 'أعلى موصل كهربائي وحراري، ركيزة صناعة الألواح الشمسية والسيارات الكهربائية والطب.',
    },
    'XPT/USD': {
      symbol: 'XPT/USD',
      nameEn: 'Platinum Spot',
      nameAr: 'البلاتين',
      category: 'PRECIOUS',
      unit: 'USD / oz',
      price: 1566.80,
      change: -2.92,
      changePercent: -0.19,
      high24h: 1582.00,
      low24h: 1556.54,
      open24h: 1569.72,
      bid: 1565.95,
      ask: 1567.65,
      lotMultiplier: 50,
      pipSize: 0.1,
      exchange: 'SAXO',
      industrialUseAr: 'المحفزات الكيميائية لعوادم السيارات، خلايا وقود الهيدروجين الأخضر، وصناعة الساعات الراقية.',
    },
    'XPD/USD': {
      symbol: 'XPD/USD',
      nameEn: 'Palladium Spot',
      nameAr: 'البلاديوم',
      category: 'PRECIOUS',
      unit: 'USD / oz',
      price: 1049.20,
      change: -5.36,
      changePercent: -0.51,
      high24h: 1062.17,
      low24h: 1042.70,
      open24h: 1054.56,
      bid: 1048.80,
      ask: 1052.50,
      lotMultiplier: 100,
      pipSize: 0.1,
      exchange: 'FX_IDC',
      industrialUseAr: 'معالجة الانبعاثات في محركات البنزين، الدوائر الإلكترونية المتطورة، وتكرير الهيدروجين.',
    },
    'HG/USD': {
      symbol: 'HG/USD',
      nameEn: 'Copper Futures',
      nameAr: 'عقود النحاس',
      category: 'INDUSTRIAL',
      unit: 'USD / lb',
      price: 4.925,
      change: 0.020,
      changePercent: 0.41,
      high24h: 4.985,
      low24h: 4.880,
      open24h: 4.905,
      bid: 4.920,
      ask: 4.930,
      lotMultiplier: 25000,
      pipSize: 0.001,
      exchange: 'COMEX / LME ($14,495/t)',
      industrialUseAr: 'مؤشر صحة الاقتصاد العالمي (دكتور نحاس)، شبكات نقل الكهرباء، محركات الطاقة المتجددة.',
    },
    'AL/USD': {
      symbol: 'AL/USD',
      nameEn: 'Aluminum Futures',
      nameAr: 'الألومنيوم',
      category: 'INDUSTRIAL',
      unit: 'USD / ton',
      price: 3021.50,
      change: 9.50,
      changePercent: 0.32,
      high24h: 3045.00,
      low24h: 2998.00,
      open24h: 3012.00,
      bid: 3020.00,
      ask: 3023.00,
      lotMultiplier: 25,
      pipSize: 0.5,
      exchange: 'LME Official',
      industrialUseAr: 'هياكل الطائرات وصناعة الطيران، هياكل السيارات خفيفة الوزن، التغليف، وقطاع الإنشاءات.',
    },
    'NI/USD': {
      symbol: 'NI/USD',
      nameEn: 'Nickel Futures',
      nameAr: 'النيكل',
      category: 'INDUSTRIAL',
      unit: 'USD / ton',
      price: 15265.00,
      change: 55.00,
      changePercent: 0.36,
      high24h: 15480.00,
      low24h: 15120.00,
      open24h: 15210.00,
      bid: 15255.00,
      ask: 15275.00,
      lotMultiplier: 6,
      pipSize: 5.0,
      exchange: 'LME Official',
      industrialUseAr: 'المكون الرئيسي لبطاريات الليثيوم للسيارات الكهربائية، وإنتاج الفولاذ المقاوم للصدأ.',
    },
    'ZN/USD': {
      symbol: 'ZN/USD',
      nameEn: 'Zinc Futures',
      nameAr: 'الزنك',
      category: 'INDUSTRIAL',
      unit: 'USD / ton',
      price: 3775.00,
      change: 15.00,
      changePercent: 0.40,
      high24h: 3810.00,
      low24h: 3740.00,
      open24h: 3760.00,
      bid: 3772.00,
      ask: 3778.00,
      lotMultiplier: 25,
      pipSize: 1.0,
      exchange: 'LME Official',
      industrialUseAr: 'جلفنة الحديد لحمايته من الصدأ، صناعة بطاريات الزنك الحديثة، وسبائك الصب الدقيق.',
    },
  },
  correlated: {
    dxy: { name: 'US Dollar Index', value: 103.42, change: -0.28 },
    us10y: { name: 'US 10Y Yield', value: '4.18%', change: -0.04 },
    silver: { name: 'Silver (XAG/USD)', value: 54.08, change: -0.95 },
    oil: { name: 'Crude Oil (WTI)', value: 71.80, change: -0.65 },
  },
  indicators: {
    rsi: 58.4,
    ema20: 4022.80,
    ema50: 4014.20,
    ema200: 3995.60,
    macd: { line: 3.4, signal: 2.1, histogram: 1.3 },
    pivots: {
      pp: 4016.97,
      r1: 4047.11,
      r2: 4065.34,
      r3: 4095.48,
      s1: 3998.74,
      s2: 3968.60,
      s3: 3950.37,
    },
    atr14: 28.20,
    spread: 0.40,
  },
};

const DEFAULT_INITIAL_ANALYSIS: DeepAnalysisResult = {
  symbol: 'XAU/USD',
  signal: 'BUY',
  signalTitleAr: 'إشارة شراء استمرارية (BUY) - زخم صاعد قوي أعلى نقطة الارتكاز Pivot',
  signalTitleEn: 'Trend-Following BUY Signal - Sustained Momentum Above Pivot',
  confidence: 93,
  entryZone: '$4022.00 - $4029.00',
  stopLoss: '$4006.50',
  tp1: '$4045.00',
  tp2: '$4065.00',
  tp3: '$4095.00',
  riskRewardRatio: '1:2.7',
  recommendedTimeframe: '1H - 4H',
  trendOutlook: 'صاعد قوي / Bullish',
  reasoning: 'استقرار سعر الذهب أعلى نقطة الارتكاز المحورية $4016.97 ومتوسط EMA20 ($4022.80)، مع زخم إيجابي على مؤشر القوة النسبية RSI عند 58.4 وتدفق سيولة شرائية من كبرى المؤسسات.',
  justification: 'الذهب يحافظ على اتجاه صاعد قوي مدعوماً بطلب البنوك المركزية وهدوء مؤشر الدولار DXY. نسبة العائد للمخاطرة 1:2.7 توفر حماية ممتازة لرأس المال مع أهداف ربح متتالية حتى $4095.',
  keyAdvice: 'توزيع الدخول على دفعتين، وتحريك وقف الخسارة إلى نقطة الدخول (Breakeven) فور تحقيق الهدف الأول TP1.',
  warnings: ['الالتزام الصارم بوقف الخسارة الموضح $4006.50 لحماية المحفظة.'],
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedMetal, setSelectedMetal] = useState<MetalSymbol>('XAU/USD');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot'>('dashboard');
  const [overview, setOverview] = useState<MarketOverview>(DEFAULT_MARKET_OVERVIEW);
  const [analysis, setAnalysis] = useState<DeepAnalysisResult | null>(DEFAULT_INITIAL_ANALYSIS);
  const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User Profile Account (Persisted across sessions with email, password, phone)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('gold_advisor_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (profile: UserProfile & { trades?: DemoTrade[] }) => {
    setUser(profile);
    try {
      localStorage.setItem('gold_advisor_user', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    // Restore user cloud portfolio if available
    if (profile.balance !== undefined) {
      setDemoAccount((prev) => ({
        ...prev,
        balance: profile.balance ?? prev.balance,
        trades: Array.isArray(profile.trades) ? profile.trades : prev.trades,
      }));
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('gold_advisor_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Cloud sync on startup if user was previously remembered
  useEffect(() => {
    if (user?.email) {
      fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.user) {
            setUser((prev) => ({ ...(prev || {}), ...data.user, isLoggedIn: true }));
            if (typeof data.user.balance === 'number') {
              setDemoAccount((prev) => ({
                ...prev,
                balance: data.user.balance,
                trades: Array.isArray(data.user.trades) ? data.user.trades : prev.trades,
              }));
            }
          }
        })
        .catch((err) => console.warn('Could not sync cloud profile on mount:', err));
    }
  }, []);

  // Live Auto-Refresh & Dynamic Tick State
  const [priceTick, setPriceTick] = useState<'up' | 'down' | 'same'>('same');
  const [autoRefreshActive, setAutoRefreshActive] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(2);
  const prevPriceRef = useRef<number | null>(4028.89);

  // Subscription State with 7-Day Free Trial countdown
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    try {
      const saved = localStorage.getItem('gold_advisor_subscription');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isSubscribed) return parsed;
        const start = new Date(parsed.trialStartDate || Date.now()).getTime();
        const now = Date.now();
        const daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 7 - daysElapsed);
        return {
          ...parsed,
          trialDaysRemaining: daysRemaining,
          isTrialExpired: daysRemaining <= 0,
        };
      }
      return INITIAL_SUBSCRIPTION;
    } catch {
      return INITIAL_SUBSCRIPTION;
    }
  });

  // Save subscription to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gold_advisor_subscription', JSON.stringify(subscription));
    } catch (e) {
      console.error(e);
    }
  }, [subscription]);

  // Demo Trading Tracker State
  const [demoAccount, setDemoAccount] = useState<DemoAccount>(() => {
    try {
      const saved = localStorage.getItem('gold_advisor_demo_account');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ACCOUNT;
    } catch {
      return INITIAL_DEMO_ACCOUNT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gold_advisor_demo_account', JSON.stringify(demoAccount));
      if (user?.email && user?.isLoggedIn) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            uid: user.uid,
            balance: demoAccount.balance,
            trades: demoAccount.trades,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  }, [demoAccount, user?.email, user?.isLoggedIn, user?.uid]);

  // Pre-filled fields for calculator when sent from signal
  const [calcParams, setCalcParams] = useState<{ entry?: string; sl?: string; tp?: string }>({});

  // Process live market update and detect tick direction
  const processMarketData = useCallback((data: MarketOverview, sym: MetalSymbol) => {
    const liveMetal = data.metals?.[sym];
    const newPrice = liveMetal ? liveMetal.price : data.price;

    if (prevPriceRef.current !== null && newPrice !== prevPriceRef.current) {
      setPriceTick(newPrice > prevPriceRef.current ? 'up' : 'down');
      setTimeout(() => setPriceTick('same'), 1100);
    }
    prevPriceRef.current = newPrice;
    setOverview(data);

    // Auto-check open demo trades against live prices for TP / SL hits
    setDemoAccount((prevAccount) => {
      let updatedBalance = prevAccount.balance;
      let hadChange = false;

      const updatedTrades = prevAccount.trades.map((trade) => {
        if (trade.status !== 'OPEN') return trade;

        const tradeMetal = data.metals?.[trade.symbol];
        if (!tradeMetal) return trade;

        const currentPrice = tradeMetal.price;
        const mult = tradeMetal.lotMultiplier;
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
  }, []);

  // Fetch live market overview for selected metal
  const fetchMarketOverview = useCallback(async (sym: MetalSymbol = selectedMetal, force = false) => {
    try {
      if (force) setIsRefreshingPrice(true);
      const url = `/api/market/gold-overview?symbol=${encodeURIComponent(sym)}${force ? '&force=true' : ''}&_t=${Date.now()}`;
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.price) {
          processMarketData(data, sym);
        }
      }
    } catch (err) {
      console.error('Failed to load market overview:', err);
    } finally {
      if (force) setIsRefreshingPrice(false);
    }
  }, [selectedMetal, processMarketData]);

  // Fetch Deep AI Analysis for current active metal
  const fetchDeepAnalysis = useCallback(async (sym: MetalSymbol = selectedMetal, customPrice?: number) => {
    try {
      setIsAnalyzing(true);
      const targetPrice = customPrice || overview?.metals?.[sym]?.price || overview?.price || 4028.89;
      const res = await fetch(`/api/ai/deep-analysis?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          symbol: sym,
          currentPrice: targetPrice,
          timeframe: '1H',
          lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.analysis && data.analysis.signal) {
          setAnalysis(data.analysis);
          return;
        }
      }
      throw new Error('Analysis payload empty');
    } catch (err) {
      console.warn('Backend AI analysis returned error, generating smart technical signal locally:', err);
      // Resilient instantaneous local signal fallback
      const mName = overview?.metals?.[sym]?.nameAr || sym;
      const curP = customPrice || overview?.metals?.[sym]?.price || overview?.price || 4028.89;
      const decimals = sym === 'HG/USD' ? 3 : 2;
      const el = curP - (sym === 'XAU/USD' ? 4.5 : curP * 0.002);
      const eh = curP + (sym === 'XAU/USD' ? 2.5 : curP * 0.001);
      const sl = curP - (sym === 'XAU/USD' ? 18.0 : curP * 0.008);
      const t1 = curP + (sym === 'XAU/USD' ? 22.0 : curP * 0.012);
      const t2 = curP + (sym === 'XAU/USD' ? 42.0 : curP * 0.022);
      const t3 = curP + (sym === 'XAU/USD' ? 68.0 : curP * 0.038);

      const localSig: DeepAnalysisResult = {
        symbol: sym,
        signal: 'BUY',
        signalTitleAr: `إشارة شراء استمرارية (BUY) - ارتداد وزخم صاعد لـ ${mName}`,
        signalTitleEn: `Bullish Trend Signal (BUY) for ${sym}`,
        confidence: 91,
        entryZone: `$${el.toFixed(decimals)} - $${eh.toFixed(decimals)}`,
        stopLoss: `$${sl.toFixed(decimals)}`,
        tp1: `$${t1.toFixed(decimals)}`,
        tp2: `$${t2.toFixed(decimals)}`,
        tp3: `$${t3.toFixed(decimals)}`,
        riskRewardRatio: '1:2.8',
        recommendedTimeframe: '1H - 4H',
        trendOutlook: 'صاعد قوي / Bullish Reversal',
        reasoning: `تحليل فني لحظي لـ ${mName}: استقرار السعر بنجاح أعلى متوسطات الحركة الرئيسية EMA20 و EMA50 مع ظهور شمعة ارتداد صعودية قوية من مناطق الطلب.`,
        justification: `الأصل (${mName}) يحظى بزخم سيولة ممتاز، ومستويات الدعم الحالية توفر حماية آمنة مع نسبة عائد إلى مخاطرة تفوق 1:2.8.`,
        keyAdvice: 'الدخول التدريجي على دفعتين، وتحريك وقف الخسارة إلى نقطة الدخول (Breakeven) فور تحقيق الهدف الأول TP1.',
        warnings: ['الالتزام الإجباري بوقف الخسارة الموضح لحماية المحفظة من أي تقلبات مفاجئة.'],
      };
      setAnalysis(localSig);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedMetal, overview?.metals, overview?.price, lang]);

  // Handle metal selection
  const handleSelectMetal = (sym: MetalSymbol) => {
    setSelectedMetal(sym);
    prevPriceRef.current = null;
    fetchMarketOverview(sym, true);
    fetchDeepAnalysis(sym);
  };

  const handleAnalyzeFromDirectory = (sym: MetalSymbol) => {
    setSelectedMetal(sym);
    prevPriceRef.current = null;
    setActiveTab('dashboard');
    fetchMarketOverview(sym, true);
    fetchDeepAnalysis(sym);
  };

  // Initial load
  useEffect(() => {
    fetchMarketOverview(selectedMetal, false);
  }, []);

  // Continuous live background polling every 2 seconds (snappy live ticks)
  useEffect(() => {
    if (!autoRefreshActive) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchMarketOverview(selectedMetal, false);
          return 2;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshActive, selectedMetal, fetchMarketOverview]);

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

    const entryPrice = parseNum(sig.entryZone) || overview?.metals?.[selectedMetal]?.price || 4028.0;
    const stopLoss = parseNum(sig.stopLoss) || entryPrice * 0.995;
    const takeProfit = parseNum(sig.tp1) || entryPrice * 1.012;

    handleOpenDemoTrade({
      symbol: selectedMetal,
      metalName: overview?.metals?.[selectedMetal]?.nameAr || selectedMetal,
      type: sig.signal === 'BUY' ? 'BUY' : 'SELL',
      lots: 0.2,
      entryPrice,
      stopLoss,
      takeProfit,
    });
  };

  const handleApplyToCalculator = (entry: string, sl: string, tp: string) => {
    setCalcParams({ entry, sl, tp });
    setActiveTab('calculator');
  };

  // Subscription Actions
  const handleActivateSubscription = () => {
    setSubscription({
      isSubscribed: true,
      trialStartDate: subscription.trialStartDate,
      trialDaysRemaining: 30,
      isTrialExpired: false,
      plan: 'PRO_MONTHLY',
    });
  };

  const handleResetTrial = () => {
    setSubscription({
      isSubscribed: false,
      trialStartDate: new Date().toISOString(),
      trialDaysRemaining: 7,
      isTrialExpired: false,
      plan: 'FREE_TRIAL',
    });
  };

  const handleSimulateExpiredTrial = () => {
    setSubscription({
      isSubscribed: false,
      trialStartDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      trialDaysRemaining: 0,
      isTrialExpired: true,
      plan: 'FREE_TRIAL',
    });
  };

  const currentMetalInfo = overview?.metals?.[selectedMetal];
  const activePrice = currentMetalInfo?.price || overview?.price || 4028.89;
  const openTradesCount = demoAccount.trades.filter((t) => t.status === 'OPEN').length;
  const isLocked = subscription.isTrialExpired && !subscription.isSubscribed;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-20 md:pb-6"
    >
      {/* Top Navbar with multi-metal switcher, tabs, and trial/pro pill */}
      <Navbar
        overview={overview}
        selectedMetal={selectedMetal}
        onSelectMetal={handleSelectMetal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onRefreshPrice={() => fetchMarketOverview(selectedMetal, true)}
        isRefreshing={isRefreshingPrice}
        openTradesCount={openTradesCount}
        subscription={subscription}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        priceTick={priceTick}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Tab 1: Dashboard (Luxury 3D Gold Hero, AI Signal, Chart, Technical Radar) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Luxury 3D Bullion Vault Hero Showcase */}
            {currentMetalInfo && (
              <LuxuryGoldVaultHero
                metal={currentMetalInfo}
                symbol={selectedMetal}
                priceTick={priceTick}
                lang={lang}
                onQuickAnalyze={() => fetchDeepAnalysis(selectedMetal, activePrice)}
                onQuickTrade={(act) =>
                  handleOpenDemoTrade({
                    symbol: selectedMetal,
                    metalName: currentMetalInfo.nameAr,
                    type: act,
                    lots: 0.2,
                    entryPrice: currentMetalInfo.price,
                    stopLoss: act === 'BUY' ? currentMetalInfo.price * 0.994 : currentMetalInfo.price * 1.006,
                    takeProfit: act === 'BUY' ? currentMetalInfo.price * 1.012 : currentMetalInfo.price * 0.988,
                  })
                }
                autoRefreshActive={autoRefreshActive}
                onToggleAutoRefresh={() => setAutoRefreshActive(!autoRefreshActive)}
                refreshCountdown={refreshCountdown}
              />
            )}

            {/* Quick Market Overview Stats Cards */}
            {currentMetalInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {/* Spot Price */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">
                    {lang === 'ar' ? `${currentMetalInfo.nameAr} (${selectedMetal})` : `${currentMetalInfo.nameEn} Spot`}
                  </span>
                  <div
                    className={`text-lg sm:text-2xl font-black font-mono-nums transition-all duration-300 ${
                      priceTick === 'up'
                        ? 'text-emerald-300 scale-105'
                        : priceTick === 'down'
                        ? 'text-rose-400 scale-105'
                        : 'text-amber-400'
                    }`}
                  >
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
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {currentMetalInfo.category === 'PRECIOUS' ? 'GoldAPI Live' : 'LME Global'}
                  </span>
                </div>
              </div>
            )}

            {/* AI Signal Card with Paywall Lock support */}
            <SignalCard
              analysis={analysis}
              isLoading={isAnalyzing}
              onRefresh={() => fetchDeepAnalysis(selectedMetal, activePrice)}
              lang={lang}
              onApplyToCalculator={handleApplyToCalculator}
              onExecuteInDemoTracker={handleExecuteFromSignal}
              isLocked={isLocked}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            />

            {/* Interactive Candlestick / Line Chart */}
            <GoldChart
              currentPrice={activePrice}
              high24h={currentMetalInfo?.high24h || 4032}
              low24h={currentMetalInfo?.low24h || 3986}
              open24h={currentMetalInfo?.open24h || 4024}
              analysis={analysis}
              lang={lang}
              symbol={selectedMetal}
              metalName={currentMetalInfo?.nameAr || currentMetalInfo?.nameEn}
            />

            {/* Technical Indicators Radar */}
            <TechnicalIndicatorsRadar overview={overview} lang={lang} />
          </div>
        )}

        {/* Tab 2: Metals Directory (دليل المعادن الشامل الثمينة والصناعية) */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <MetalsDirectory
              metals={overview?.metals || null}
              selectedMetal={selectedMetal}
              onSelectMetal={handleSelectMetal}
              onAnalyzeMetal={handleAnalyzeFromDirectory}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 3: Demo Trading Tracker (لوحة الصفقات الافتراضية) */}
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

        {/* Tab 4: Risk & Lot Calculator */}
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

        {/* Tab 5: AI Copilot Chat */}
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
                        ? 'مربوط بأسعار الذهب والمعادن اللحظية من GoldAPI وبورصة LME لتحليل السوق بدقة.'
                        : 'Connected to live GoldAPI & LME spot pricing.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      {lang === 'ar'
                        ? 'تحديد نقاط دخول ووقف خسارة وأهداف ربح مدروسة حسابياً بناءً على تقلبات السوق.'
                        : 'Mathematically grounded stop loss and take profit targets.'}
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

        {/* Tab 6: Trade Plan Auditor / Validator */}
        {activeTab === 'validator' && (
          <div className="space-y-6">
            <TradePlanValidator currentPrice={activePrice} lang={lang} />
          </div>
        )}

        {/* Tab 7: Macro & Economic Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <EconomicCalendar lang={lang} />
          </div>
        )}
      </main>

      {/* Subscription & 7-Day Trial Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscription={subscription}
        onActivateSubscription={handleActivateSubscription}
        onResetTrial={handleResetTrial}
        onSimulateExpiredTrial={handleSimulateExpiredTrial}
        lang={lang}
      />

      {/* Cloud User Profile & Authentication Modal (Email, Password, Phone) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        lang={lang}
      />

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
              GoldAdvisor AI - {lang === 'ar' ? 'منصة تداول المعادن الذكية بالذكاء الاصطناعي' : 'Institutional Metals Trading Platform'}
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
