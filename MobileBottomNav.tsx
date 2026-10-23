import React from 'react';
import { Language } from '../types';
import {
  BarChart2,
  Layers,
  Briefcase,
  Calculator,
  MessageSquare,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'directory' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot';
  setActiveTab: (tab: 'dashboard' | 'directory' | 'demo' | 'calculator' | 'validator' | 'calendar' | 'copilot') => void;
  lang: Language;
  openTradesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  lang,
  openTradesCount,
}) => {
  const items = [
    {
      id: 'dashboard' as const,
      labelAr: 'الإشارات',
      labelEn: 'Signals',
      icon: BarChart2,
    },
    {
      id: 'directory' as const,
      labelAr: 'المعادن',
      labelEn: 'Metals',
      icon: Layers,
    },
    {
      id: 'demo' as const,
      labelAr: 'التجريبي',
      labelEn: 'Demo',
      icon: Briefcase,
      badge: openTradesCount,
    },
    {
      id: 'calculator' as const,
      labelAr: 'اللوت',
      labelEn: 'Calc',
      icon: Calculator,
    },
    {
      id: 'copilot' as const,
      labelAr: 'المستشار',
      labelEn: 'AI Chat',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg px-2 py-2 pb-safe">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-emerald-500 text-slate-950 font-bold rounded-full text-[9px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {lang === 'ar' ? item.labelAr : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
