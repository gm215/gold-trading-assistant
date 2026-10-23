import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Dynamic realistic base prices for precious & industrial metals
const metalsState = {
  'XAU/USD': {
    symbol: 'XAU/USD' as const,
    nameEn: 'Gold Spot',
    nameAr: 'الذهب الفوري',
    unit: 'USD / oz',
    price: 2738.45,
    high24h: 2748.80,
    low24h: 2724.10,
    open24h: 2731.20,
    lotMultiplier: 100, // 1 std lot = 100 oz ($1 move = $100)
    pipSize: 0.1,
  },
  'XAG/USD': {
    symbol: 'XAG/USD' as const,
    nameEn: 'Silver Spot',
    nameAr: 'الفضة الفورية',
    unit: 'USD / oz',
    price: 33.25,
    high24h: 33.65,
    low24h: 32.85,
    open24h: 33.10,
    lotMultiplier: 5000, // 1 std lot = 5,000 oz ($1 move = $5,000)
    pipSize: 0.01,
  },
  'XPT/USD': {
    symbol: 'XPT/USD' as const,
    nameEn: 'Platinum',
    nameAr: 'البلاتين',
    unit: 'USD / oz',
    price: 1024.80,
    high24h: 1038.50,
    low24h: 1012.00,
    open24h: 1018.00,
    lotMultiplier: 50,
    pipSize: 0.1,
  },
  'XPD/USD': {
    symbol: 'XPD/USD' as const,
    nameEn: 'Palladium',
    nameAr: 'البلاديوم',
    unit: 'USD / oz',
    price: 1048.20,
    high24h: 1065.00,
    low24h: 1032.00,
    open24h: 1040.00,
    lotMultiplier: 100,
    pipSize: 0.1,
  },
  'HG/USD': {
    symbol: 'HG/USD' as const,
    nameEn: 'Copper Futures',
    nameAr: 'عقود النحاس',
    unit: 'USD / lb',
    price: 4.385,
    high24h: 4.450,
    low24h: 4.310,
    open24h: 4.340,
    lotMultiplier: 25000,
    pipSize: 0.001,
  },
};

// Economic Calendar items affecting Gold & Metals
const economicEvents = [
  {
    id: 'fomc-1',
    eventEn: 'FOMC Interest Rate Decision & Powell Press Conference',
    eventAr: 'قرار الفائدة الفيدرالية والمؤتمر الصحفي لباول',
    country: 'USD',
    impact: 'HIGH',
    date: 'Wednesday 18:00 GMT',
    forecast: '4.50%',
    previous: '4.75%',
    goldEffect: 'خفض الفائدة يدعم صعود الذهب والمعادن بقوة، بينما اللهجة التشددية تضغط عليها هبوطاً.',
  },
  {
    id: 'cpi-1',
    eventEn: 'US Consumer Price Index (CPI YoY)',
    eventAr: 'مؤشر أسعار المستهلك الأمريكي (التضخم السنوي)',
    country: 'USD',
    impact: 'HIGH',
    date: 'Thursday 12:30 GMT',
    forecast: '2.6%',
    previous: '2.8%',
    goldEffect: 'تضخم أقل من المتوقع يضعف الدولار ويرفع الذهب والفضة فورياً.',
  },
  {
    id: 'nfp-1',
    eventEn: 'Non-Farm Payrolls (NFP) & Unemployment',
    eventAr: 'تقرير التوظيف بغير القطاع الزراعي ومعدل البطالة',
    country: 'USD',
    impact: 'HIGH',
    date: 'Friday 12:30 GMT',
    forecast: '160K',
    previous: '185K',
    goldEffect: 'بيانات وظائف ضعيفة = صعود قوي للذهب والفضة، وبيانات قوية = ضغط بيعي.',
  },
  {
    id: 'dxy-1',
    eventEn: 'US Dollar Index (DXY) & Treasury Yields Movement',
    eventAr: 'حركة مؤشر الدولار DXY وعوائد السندات لأجل 10 سنوات',
    country: 'GLOBAL',
    impact: 'MEDIUM',
    date: 'Daily Monitor',
    forecast: '103.20',
    previous: '103.80',
    goldEffect: 'علاقة عكسية تاريخية: هبوط مؤشر الدولار يمنح المعادن الثمينة زخماً صعودياً فورياً.',
  },
];

// Helper to compute dynamic technical indicators for any metal
function getIndicators(price: number, dayOpen: number, dayHigh: number, dayLow: number) {
  const priceChange = price - dayOpen;
  const rsi = Math.min(85, Math.max(25, 54.0 + (priceChange / price) * 120));
  const spreadDelta = price * 0.0015;
  const ema20 = price - spreadDelta;
  const ema50 = price - spreadDelta * 2.4;
  const ema200 = price - spreadDelta * 6.5;
  const macdHistogram = (price - ema20) * 0.45;
  const pivot = (dayHigh + dayLow + price) / 3;
  const r1 = 2 * pivot - dayLow;
  const r2 = pivot + (dayHigh - dayLow);
  const r3 = dayHigh + 2 * (pivot - dayLow);
  const s1 = 2 * pivot - dayHigh;
  const s2 = pivot - (dayHigh - dayLow);
  const s3 = dayLow - 2 * (dayHigh - pivot);

  return {
    rsi: Number(rsi.toFixed(1)),
    ema20: Number(ema20.toFixed(2)),
    ema50: Number(ema50.toFixed(2)),
    ema200: Number(ema200.toFixed(2)),
    macd: {
      line: Number(((price - ema20) * 0.8).toFixed(2)),
      signal: Number(((price - ema50) * 0.5).toFixed(2)),
      histogram: Number(macdHistogram.toFixed(2)),
    },
    pivots: {
      pp: Number(pivot.toFixed(2)),
      r1: Number(r1.toFixed(2)),
      r2: Number(r2.toFixed(2)),
      r3: Number(r3.toFixed(2)),
      s1: Number(s1.toFixed(2)),
      s2: Number(s2.toFixed(2)),
      s3: Number(s3.toFixed(2)),
    },
    atr14: Number((price * 0.007).toFixed(2)),
    spread: Number((price * 0.0001).toFixed(2)) || 0.25,
  };
}

// API: Get market overview for metals
app.get('/api/market/gold-overview', (req, res) => {
  const requestedSymbol = (req.query.symbol as keyof typeof metalsState) || 'XAU/USD';
  const activeMetal = metalsState[requestedSymbol] || metalsState['XAU/USD'];

  // Realistic micro jitter
  const jitterRate = activeMetal.price * 0.00015;
  const jitter = (Math.random() - 0.49) * jitterRate;
  activeMetal.price = Number((activeMetal.price + jitter).toFixed(activeMetal.symbol === 'HG/USD' ? 3 : 2));
  if (activeMetal.price > activeMetal.high24h) activeMetal.high24h = activeMetal.price;
  if (activeMetal.price < activeMetal.low24h) activeMetal.low24h = activeMetal.price;

  const change = Number((activeMetal.price - activeMetal.open24h).toFixed(2));
  const changePercent = Number(((change / activeMetal.open24h) * 100).toFixed(2));

  const indicators = getIndicators(
    activeMetal.price,
    activeMetal.open24h,
    activeMetal.high24h,
    activeMetal.low24h
  );

  // Snapshot of all metals
  const metalsSnapshot: any = {};
  for (const [key, m] of Object.entries(metalsState)) {
    const mChange = Number((m.price - m.open24h).toFixed(2));
    const mPct = Number(((mChange / m.open24h) * 100).toFixed(2));
    metalsSnapshot[key] = {
      symbol: m.symbol,
      nameEn: m.nameEn,
      nameAr: m.nameAr,
      unit: m.unit,
      price: m.price,
      change: mChange,
      changePercent: mPct,
      high24h: m.high24h,
      low24h: m.low24h,
      lotMultiplier: m.lotMultiplier,
      pipSize: m.pipSize,
    };
  }

  res.json({
    symbol: activeMetal.symbol,
    name: activeMetal.nameEn,
    price: activeMetal.price,
    bid: Number((activeMetal.price - activeMetal.price * 0.00008).toFixed(2)),
    ask: Number((activeMetal.price + activeMetal.price * 0.00008).toFixed(2)),
    change,
    changePercent,
    high24h: activeMetal.high24h,
    low24h: activeMetal.low24h,
    open24h: activeMetal.open24h,
    volumeOz: activeMetal.symbol === 'XAU/USD' ? '184,250 oz' : '450,000 oz',
    timestamp: new Date().toISOString(),
    metals: metalsSnapshot,
    correlated: {
      dxy: { name: 'US Dollar Index', value: 103.42, change: -0.28 },
      us10y: { name: 'US 10Y Yield', value: '4.18%', change: -0.04 },
      silver: { name: 'Silver (XAG/USD)', value: metalsState['XAG/USD'].price, change: +0.42 },
      oil: { name: 'Crude Oil (WTI)', value: 71.80, change: -0.65 },
    },
    indicators,
  });
});

// API: Economic Calendar
app.get('/api/market/economic-calendar', (req, res) => {
  res.json({ events: economicEvents });
});

// API: Deep AI Market Analysis for Gold & Metals (BUY / SELL / HOLD)
app.post('/api/ai/deep-analysis', async (req, res) => {
  try {
    const { symbol = 'XAU/USD', currentPrice, timeframe = '1H', lang = 'ar' } = req.body;
    const metal = metalsState[symbol as keyof typeof metalsState] || metalsState['XAU/USD'];
    const priceToAnalyze = currentPrice || metal.price;
    const indicators = getIndicators(priceToAnalyze, metal.open24h, metal.high24h, metal.low24h);

    const prompt = `أنت "مساعد تداول ذكي (AI Trading Assistant)" معتمد وكبير محللي الأسواق المالية والمعادن الثمينة (Chief Precious Metals Strategist).
المهمة: قم بإجراء تحليل فني وأساسي مباشر لـ ${metal.nameAr} (${symbol}) لتقديم توصية تداول دقيقة واحترافية.

البيانات الفنية اللحظية الحالية:
- الأصل: ${symbol} (${metal.nameAr} - ${metal.nameEn})
- السعر اللحظي: $${priceToAnalyze}
- الإطار الزمني: ${timeframe}
- مؤشر القوة النسبية RSI(14): ${indicators.rsi}
- المتوسطات المتحركة: EMA20: ${indicators.ema20} | EMA50: ${indicators.ema50} | EMA200: ${indicators.ema200}
- نقطة الارتكاز Pivot: $${indicators.pivots.pp}
- مستويات المقاومة: R1: $${indicators.pivots.r1} | R2: $${indicators.pivots.r2} | R3: $${indicators.pivots.r3}
- مستويات الدعم: S1: $${indicators.pivots.s1} | S2: $${indicators.pivots.s2} | S3: $${indicators.pivots.s3}
- المدى السعري اليومي: أدنى ${metal.low24h} - أعلى ${metal.high24h}

الشروط والقواعد الصارمة:
1. اتخذ قراراً واضحاً وصريحاً للإشارة حصراً من هذه الخيارات الثلاثة: ("BUY" للشراء، أو "SELL" للبيع، أو "HOLD" للانتظار وترقب الفرصة).
2. حدد نطاق سعر الدخول بدقة بالدولار (Entry Zone).
3. حدد سعر وقف الخسارة (Stop Loss) لحماية الحساب من أي تقلبات مفاجئة.
4. حدد 3 أهداف واقعية لجني الأرباح (Take Profit 1, Take Profit 2, Take Profit 3).
5. وضّح "سبب التحليل" (Reasoning) بدقة: شرح فني كسر الترند أو مناطق السيولة أو مؤشر RSI والمتوسطات.
6. وضّح "تبرير القرار" (Justification): لماذا اتخذنا قرار (شراء / بيع / انتظار) وما هي الدوافع الأساسية (الدولار، التضخم، الفيدرالي).
7. حدد نسبة العائد إلى المخاطرة (Risk:Reward) ونسبة الثقة (Confidence %) من 100.

أعد الإجابة بصيغة JSON تطابق الحقول التالية تماماً:
{
  "symbol": "${symbol}",
  "signal": "BUY" | "SELL" | "HOLD",
  "signalTitleAr": "عنوان التوصية بالعربية مثل: إشارة شراء نموذجية إثر ارتداد من الدعم",
  "signalTitleEn": "High-probability Buy Signal on Trend Support",
  "confidence": 89,
  "entryZone": "$...",
  "stopLoss": "$...",
  "tp1": "$...",
  "tp2": "$...",
  "tp3": "$...",
  "riskRewardRatio": "1:2.6",
  "recommendedTimeframe": "1H - 4H",
  "trendOutlook": "صاعد / Bullish",
  "reasoning": "سبب التحليل الفني بالتفصيل (البرايس أكشن، مستويات فيبوناتشي، التشبع، كسر الدعم والمقاومة)...",
  "justification": "تبرير القرار الحاسم للشراء/البيع/الانتظار وتأثير مؤشر الدولار والبيانات الاقتصادية...",
  "keyAdvice": "نصيحة إدارة المخاطر الخاصة بالصفقة...",
  "warnings": ["تحذير 1 إن وجد", "تحذير 2 إن وجد"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    res.json({
      success: true,
      analysis: parsedData,
      analyzedAt: new Date().toISOString(),
      currentPrice: priceToAnalyze,
    });
  } catch (error: any) {
    console.error('Error generating deep analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI analysis',
    });
  }
});

// API: AI Trading Copilot Chat (Live conversational advice)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, symbol = 'XAU/USD', currentPrice, lang = 'ar' } = req.body;
    const metal = metalsState[symbol as keyof typeof metalsState] || metalsState['XAU/USD'];
    const price = currentPrice || metal.price;
    const indicators = getIndicators(price, metal.open24h, metal.high24h, metal.low24h);

    const systemPrompt = `أنت "مساعد التداول الذكي للذهب والمعادن" (AI Trading Assistant for Metals & Gold).
أنت مستشار استثماري وفني خبير متخصص في تداول الذهب (XAU/USD)، الفضة (XAG/USD)، البلاتين، والبلاديوم.

الأصل الحالي: ${symbol} (${metal.nameAr})
السعر اللحظي: $${price}
أعلى سعر اليوم: $${metal.high24h} | أدنى سعر: $${metal.low24h}
مؤشر RSI: ${indicators.rsi} | نقطة الارتكاز Pivot: $${indicators.pivots.pp}

إرشادات تقديم الإجابات:
1. قدّم نصائح دقيقة ومباشرة للمتداول مع ذكر مستويات الدخول، الستوب، والهدف عند السؤال عن صفقة.
2. فسّر دائماً سبب التحليل الفني والأساسي (حركة مؤشر الدولار DXY، السندات، تقارير التضخم CPI، وقرارات الفيدرالي).
3. انصح دائماً بإدارة مخاطر صارمة (عدم المخاطرة بأكثر من 1-2% من رصيد الحساب).
4. أجب باللغة المناسبة للمستخدم (العربية الفصحى مع المصطلحات الفنية العالمية).`;

    const contents: any[] = [];
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    });

    const reply = response.text || 'عذراً، لم أتمكن من استخراج التوصية في الوقت الحالي.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({
      error: error.message || 'Chat generation failed',
    });
  }
});

// API: Trade Plan Risk & Quality Evaluator
app.post('/api/ai/evaluate-trade-plan', async (req, res) => {
  try {
    const { action, entry, stopLoss, takeProfit, balance, riskPercent, symbol = 'XAU/USD' } = req.body;
    const metal = metalsState[symbol as keyof typeof metalsState] || metalsState['XAU/USD'];

    const entryNum = parseFloat(entry);
    const slNum = parseFloat(stopLoss);
    const tpNum = parseFloat(takeProfit);
    const balNum = parseFloat(balance) || 5000;
    const riskPct = parseFloat(riskPercent) || 2;

    const riskPoints = Math.abs(entryNum - slNum);
    const rewardPoints = Math.abs(tpNum - entryNum);
    const riskRewardRatio = riskPoints > 0 ? (rewardPoints / riskPoints).toFixed(2) : '0';

    const maxRiskDollars = (balNum * riskPct) / 100;
    const dollarRiskPerLot = riskPoints * metal.lotMultiplier;
    const recommendedLots = dollarRiskPerLot > 0 ? (maxRiskDollars / dollarRiskPerLot).toFixed(2) : '0.01';

    const prompt = `أنت رئيس إدارة مخاطر التداول (Chief Trading Risk Officer).
المطلوب تقييم خطة الصفقة التالية على ${symbol} (${metal.nameAr}):
- نوع الصفقة: ${action === 'BUY' ? 'شراء (BUY)' : 'بيع (SELL)'}
- سعر الدخول: $${entryNum}
- وقف الخسارة: $${slNum}
- جني الأرباح: $${tpNum}
- نسبة العائد إلى المخاطرة (R:R): 1:${riskRewardRatio}
- رصيد الحساب: $${balNum} | نسبة المخاطرة: ${riskPct}% ($${maxRiskDollars.toFixed(2)})
- حجم اللوت المقترح: ${recommendedLots} لوت
- السعر اللحظي الآن: $${metal.price}

أجب بتنسيق JSON:
{
  "score": 85,
  "status": "APPROVED" | "WARNING" | "REJECTED",
  "summaryAr": "تقييم موجز للصفقة بالعربية",
  "summaryEn": "Short summary in English",
  "pros": ["نقطة إيجابية 1", "نقطة إيجابية 2"],
  "cons": ["نقطة سلبية أو خطر 1", "نقطة سلبية 2"],
  "improvedStopLoss": "$...",
  "improvedTakeProfit": "$...",
  "recommendedLot": "${recommendedLots}",
  "riskVerdict": "حكم نهائي صريح على ملاءمة الصفقة"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : {};
    }

    res.json({
      success: true,
      evaluation: data,
      math: {
        riskDollars: maxRiskDollars,
        riskPoints,
        rewardPoints,
        riskRewardRatio: `1:${riskRewardRatio}`,
        recommendedLots,
      },
    });
  } catch (error: any) {
    console.error('Error evaluating trade plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Production static serving & Vite Dev Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`GoldAdvisor AI Server running on port ${port}`);
  });
}

startServer();
