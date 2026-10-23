export type Language = 'ar' | 'en';

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export type MetalCategory = 'PRECIOUS' | 'INDUSTRIAL';

export type MetalSymbol =
  | 'XAU/USD' // Gold
  | 'XAG/USD' // Silver
  | 'XPT/USD' // Platinum
  | 'XPD/USD' // Palladium
  | 'HG/USD'  // Copper
  | 'AL/USD'  // Aluminum
  | 'NI/USD'  // Nickel
  | 'ZN/USD';  // Zinc

export interface MetalInfo {
  symbol: MetalSymbol;
  nameEn: string;
  nameAr: string;
  category: MetalCategory;
  unit: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  open24h: number;
  bid?: number;
  ask?: number;
  lotMultiplier: number;
  pipSize: number;
  exchange?: string;
  industrialUseAr?: string;
  industrialUseEn?: string;
  karats?: {
    k24: number;
    k22: number;
    k21: number;
    k18: number;
  };
}

export interface MarketOverview {
  symbol: MetalSymbol;
  name: string;
  category?: MetalCategory;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  open24h: number;
  volumeOz: string;
  timestamp: string;
  provider: string;
  isLiveAPI: boolean;
  lastLiveSync: string;
  metals: Record<MetalSymbol, MetalInfo>;
  correlated: {
    dxy: { name: string; value: number; change: number };
    us10y: { name: string; value: string; change: number };
    silver: { name: string; value: number; change: number };
    oil: { name: string; value: number; change: number };
  };
  indicators: {
    rsi: number;
    ema20: number;
    ema50: number;
    ema200: number;
    macd: {
      line: number;
      signal: number;
      histogram: number;
    };
    pivots: {
      pp: number;
      r1: number;
      r2: number;
      r3: number;
      s1: number;
      s2: number;
      s3: number;
    };
    atr14: number;
    spread: number;
  };
}

export interface DeepAnalysisResult {
  symbol: MetalSymbol;
  signal: SignalType;
  signalTitleAr: string;
  signalTitleEn: string;
  confidence: number;
  entryZone: string;
  stopLoss: string;
  tp1: string;
  tp2: string;
  tp3: string;
  riskRewardRatio: string;
  recommendedTimeframe: string;
  trendOutlook: string;
  reasoning: string;
  justification: string;
  keyAdvice: string;
  warnings?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EconomicEvent {
  id: string;
  eventEn: string;
  eventAr: string;
  country: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  forecast: string;
  previous: string;
  goldEffect: string;
}

export interface TradeValidation {
  score: number;
  status: 'APPROVED' | 'WARNING' | 'REJECTED';
  summaryAr: string;
  summaryEn: string;
  pros: string[];
  cons: string[];
  improvedStopLoss?: string;
  improvedTakeProfit?: string;
  recommendedLot?: string;
  riskVerdict: string;
}

// Demo Trading Tracker Types
export interface DemoTrade {
  id: string;
  symbol: MetalSymbol;
  metalName: string;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
  pnlDollar: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED';
  closePrice?: number;
  closeTime?: string;
  closeReason?: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS';
}

export interface DemoAccount {
  balance: number;
  initialDeposit: number;
  trades: DemoTrade[];
}

// Subscription & 7-Day Trial State
export interface SubscriptionState {
  isSubscribed: boolean;
  trialStartDate: string;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  plan: 'FREE_TRIAL' | 'PRO_MONTHLY';
}

// User Profile for Email, Password & Phone Authentication
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  createdAt?: string;
  balance?: number;
}
