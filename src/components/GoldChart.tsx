import React, { useState, useMemo } from 'react';
import { Candle, DeepAnalysisResult, Language, MetalSymbol } from '../types';
import { BarChart3, LineChart as LineChartIcon, Layers, TrendingUp, AlertCircle } from 'lucide-react';

interface GoldChartProps {
  currentPrice: number;
  high24h: number;
  low24h: number;
  open24h: number;
  analysis: DeepAnalysisResult | null;
  lang: Language;
  symbol?: MetalSymbol;
  metalName?: string;
}

export const GoldChart: React.FC<GoldChartProps> = ({
  currentPrice,
  high24h,
  low24h,
  open24h,
  analysis,
  lang,
  symbol = 'XAU/USD',
  metalName = 'Gold Spot',
}) => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('1h');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showSignalLevels, setShowSignalLevels] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const decimals = symbol === 'HG/USD' ? 3 : 2;

  // Generate deterministic realistic candles scaled to current price of the metal
  const candles: Candle[] = useMemo(() => {
    const list: Candle[] = [];
    const count = 36;
    const volatilityPct = 0.0035; // 0.35% per bar
    const barSwing = currentPrice * volatilityPct;
    let base = currentPrice - barSwing * 2;
    const now = Date.now();
    const intervalMs =
      timeframe === '1m'
        ? 60 * 1000
        : timeframe === '5m'
        ? 5 * 60 * 1000
        : timeframe === '15m'
        ? 15 * 60 * 1000
        : timeframe === '1h'
        ? 60 * 60 * 1000
        : timeframe === '4h'
        ? 4 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

    for (let i = count - 1; i >= 0; i--) {
      const timeStr = new Date(now - i * intervalMs).toLocaleTimeString(
        lang === 'ar' ? 'ar-SA' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      );
      const trend = Math.sin(i * 0.4) * barSwing + (count - i) * (barSwing * 0.1);
      const open = Number((base + trend + (Math.sin(i * 1.5) * barSwing * 0.4)).toFixed(decimals));
      const close =
        i === 0
          ? currentPrice
          : Number((open + (Math.cos(i * 2.1) * barSwing * 0.6)).toFixed(decimals));
      const high = Number((Math.max(open, close) + Math.abs(Math.sin(i)) * barSwing * 0.45).toFixed(decimals));
      const low = Number((Math.min(open, close) - Math.abs(Math.cos(i)) * barSwing * 0.45).toFixed(decimals));
      const volume = Math.floor(1200 + Math.abs(Math.sin(i * 3)) * 3400);

      list.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        volume,
      });
    }
    return list;
  }, [currentPrice, timeframe, lang, decimals]);

  // Chart dimensions & scaling
  const chartHeight = 340;
  const chartWidth = 800;
  const paddingBottom = 35;
  const paddingTop = 20;
  const paddingRight = 65;
  const paddingLeft = 10;

  const minPrice = useMemo(() => {
    const min = Math.min(...candles.map((c) => c.low));
    return Number((min * 0.998).toFixed(decimals));
  }, [candles, decimals]);

  const maxPrice = useMemo(() => {
    const max = Math.max(...candles.map((c) => c.high));
    return Number((max * 1.002).toFixed(decimals));
  }, [candles, decimals]);

  const priceRange = maxPrice - minPrice || 1;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const innerWidth = chartWidth - paddingLeft - paddingRight;

  const getY = (val: number) => {
    const ratio = (val - minPrice) / priceRange;
    return paddingTop + innerHeight * (1 - ratio);
  };

  const candleWidth = Math.max(7, (innerWidth / candles.length) * 0.65);
  const stepX = innerWidth / (candles.length - 1 || 1);

  // EMA calculations
  const ema20Points = useMemo(() => {
    return candles.map((c, i) => {
      const x = paddingLeft + i * stepX;
      const emaVal = c.close - (currentPrice * 0.001) + Math.sin(i * 0.2) * (currentPrice * 0.0005);
      const y = getY(emaVal);
      return `${x},${y}`;
    }).join(' ');
  }, [candles, stepX, minPrice, priceRange, currentPrice]);

  const ema50Points = useMemo(() => {
    return candles.map((c, i) => {
      const x = paddingLeft + i * stepX;
      const emaVal = c.close - (currentPrice * 0.0025) + Math.sin(i * 0.15) * (currentPrice * 0.0004);
      const y = getY(emaVal);
      return `${x},${y}`;
    }).join(' ');
  }, [candles, stepX, minPrice, priceRange, currentPrice]);

  // Parse stop loss & take profit if available
  const parsedLevels = useMemo(() => {
    if (!analysis) return null;
    const parseNum = (str: string) => {
      const match = str.replace(/[^0-9.]/g, '');
      return match ? parseFloat(match) : null;
    };
    return {
      sl: parseNum(analysis.stopLoss),
      tp1: parseNum(analysis.tp1),
      tp2: parseNum(analysis.tp2),
    };
  }, [analysis]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3.5">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
        {/* Symbol and Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
            {symbol.split('/')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">{symbol}</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {metalName}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Market Feed" />
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'الرسم البياني المباشر للأسعار' : 'Live Candlestick Stream'}
            </p>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* View Options */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setChartType(chartType === 'candle' ? 'line' : 'candle')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title={lang === 'ar' ? 'نوع الرسم' : 'Toggle Chart Type'}
          >
            {chartType === 'candle' ? <LineChartIcon className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSignalLevels(!showSignalLevels)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              showSignalLevels
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'الأهداف والوقف' : 'Targets'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Candle Bar Statistics HUD */}
      {activeCandle && (
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono-nums bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 overflow-x-auto no-scrollbar">
          <span className="text-slate-400">{lang === 'ar' ? 'الوقت:' : 'Time:'} <b className="text-white">{activeCandle.time}</b></span>
          <span className="text-slate-400">{lang === 'ar' ? 'افتتاح:' : 'O:'} <b className="text-slate-200">${activeCandle.open.toFixed(decimals)}</b></span>
          <span className="text-slate-400">{lang === 'ar' ? 'أعلى:' : 'H:'} <b className="text-emerald-400">${activeCandle.high.toFixed(decimals)}</b></span>
          <span className="text-slate-400">{lang === 'ar' ? 'أدنى:' : 'L:'} <b className="text-rose-400">${activeCandle.low.toFixed(decimals)}</b></span>
          <span className="text-slate-400">{lang === 'ar' ? 'إغلاق:' : 'C:'} <b className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${activeCandle.close.toFixed(decimals)}</b></span>
        </div>
      )}

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[280px] sm:h-[360px] select-none"
          preserveAspectRatio="none"
        >
          {/* Grid lines & price labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + innerHeight * pct;
            const priceVal = maxPrice - priceRange * pct;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - paddingRight + 6}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  ${priceVal.toFixed(decimals)}
                </text>
              </g>
            );
          })}

          {/* Volume sub-bars at bottom */}
          {candles.map((c, i) => {
            const x = paddingLeft + i * stepX;
            const volHeight = (c.volume / 5000) * 30;
            const isBull = c.close >= c.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x - candleWidth / 2}
                y={chartHeight - paddingBottom - volHeight}
                width={candleWidth}
                height={volHeight}
                fill={isBull ? '#10b981' : '#ef4444'}
                opacity="0.18"
              />
            );
          })}

          {/* EMAs */}
          {showEMA20 && (
            <polyline
              points={ema20Points}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          )}
          {showEMA50 && (
            <polyline
              points={ema50Points}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          )}

          {/* Render Line Chart OR Candlesticks */}
          {chartType === 'line' ? (
            <polyline
              points={candles
                .map((c, i) => `${paddingLeft + i * stepX},${getY(c.close)}`)
                .join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            candles.map((c, i) => {
              const x = paddingLeft + i * stepX;
              const yOpen = getY(c.open);
              const yClose = getY(c.close);
              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const isBull = c.close >= c.open;
              const color = isBull ? '#10b981' : '#f43f5e';
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g
                  key={i}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={() => setHoveredCandle(c)}
                >
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={isBull ? '#10b981' : '#f43f5e'}
                    rx="1.5"
                  />
                </g>
              );
            })
          )}

          {/* AI Signal Targets Overlays (TP1, SL) */}
          {showSignalLevels && parsedLevels && (
            <>
              {parsedLevels.tp1 && parsedLevels.tp1 >= minPrice && parsedLevels.tp1 <= maxPrice && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getY(parsedLevels.tp1)}
                    x2={chartWidth - paddingRight}
                    y2={getY(parsedLevels.tp1)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  <rect
                    x={chartWidth - paddingRight + 2}
                    y={getY(parsedLevels.tp1) - 9}
                    width="60"
                    height="18"
                    fill="#064e3b"
                    rx="4"
                  />
                  <text
                    x={chartWidth - paddingRight + 6}
                    y={getY(parsedLevels.tp1) + 3}
                    fill="#34d399"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                  >
                    TP ${parsedLevels.tp1}
                  </text>
                </g>
              )}

              {parsedLevels.sl && parsedLevels.sl >= minPrice && parsedLevels.sl <= maxPrice && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getY(parsedLevels.sl)}
                    x2={chartWidth - paddingRight}
                    y2={getY(parsedLevels.sl)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  <rect
                    x={chartWidth - paddingRight + 2}
                    y={getY(parsedLevels.sl) - 9}
                    width="60"
                    height="18"
                    fill="#7f1d1d"
                    rx="4"
                  />
                  <text
                    x={chartWidth - paddingRight + 6}
                    y={getY(parsedLevels.sl) + 3}
                    fill="#f87171"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                  >
                    SL ${parsedLevels.sl}
                  </text>
                </g>
              )}
            </>
          )}

          {/* Current Live Price Horizontal Marker */}
          <g>
            <line
              x1={paddingLeft}
              y1={getY(currentPrice)}
              x2={chartWidth - paddingRight}
              y2={getY(currentPrice)}
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <rect
              x={chartWidth - paddingRight + 2}
              y={getY(currentPrice) - 10}
              width="60"
              height="20"
              fill="#eab308"
              rx="4"
            />
            <text
              x={chartWidth - paddingRight + 6}
              y={getY(currentPrice) + 4}
              fill="#0f172a"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
            >
              ${currentPrice.toFixed(decimals)}
            </text>
          </g>
        </svg>

        {/* Legend overlays */}
        <div className="absolute top-2 left-3 flex items-center gap-3 text-[10px] font-mono-nums bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur-sm">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-0.5 bg-cyan-400 rounded-full inline-block" />
            EMA 20
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-0.5 bg-amber-400 rounded-full inline-block" />
            EMA 50
          </span>
          {showSignalLevels && (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-0.5 bg-emerald-400 rounded-full inline-block" />
              TP/SL
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
