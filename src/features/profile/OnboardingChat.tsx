import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useProfileStore } from '../../store/profileStore';
import { saveProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import type { ChatMessage, AIProfileDraft, UserProfile, PayFrequency, FilingStatus, LifestyleTier, HousingType } from '../../types/index';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hey! 👋 I'm your Stackd financial buddy.\n\nI'm going to help you build a personalized money plan for your new job — it takes about 3 minutes and I promise it's worth it 💸\n\nFirst things first: where are you living or planning to move to? (City + state works!)",
};

const RERUN_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Welcome back! 👋 Let's refresh your financial plan.\n\nWhat's the biggest thing that's changed — new job, moving cities, new salary, or something else? Tell me what's new and we'll update everything 🔄",
};

function renderText(text: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? <strong key={i} className="font-semibold text-gray-900">{seg.slice(2, -2)}</strong>
      : seg
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 self-start w-16">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap gradient-brand text-white">
          {msg.content}
        </div>
      </div>
    );
  }

  const confirms: string[] = [];
  const questions: string[] = [];

  let remaining = msg.content.replace(/<confirm>([\s\S]*?)<\/confirm>/g, (_m, t: string) => {
    confirms.push(t.trim());
    return '';
  });
  remaining = remaining.replace(/<q>([\s\S]*?)<\/q>/g, (_m, t: string) => {
    questions.push(t.trim());
    return '';
  });
  const context = remaining.trim();

  return (
    <div className="flex flex-col gap-2 items-start max-w-[90%]">
      {/* Confirmation pills */}
      {confirms.map((text, i) => (
        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
          <span className="text-green-500 text-xs font-bold">✓</span>
          <span className="text-xs text-green-700 font-medium">{text}</span>
        </div>
      ))}

      {/* Context / info text */}
      {context && (
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-line bg-gray-100 text-gray-600">
          {renderText(context)}
        </div>
      )}

      {/* Question bubble — visually distinct */}
      {questions.map((text, i) => (
        <div key={i} className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-line bg-white border-2 border-green-200 text-gray-900 font-medium shadow-sm">
          {renderText(text)}
        </div>
      ))}

      {/* Fallback: no <q> tag — render as plain info bubble */}
      {!context && !questions.length && !confirms.length && (
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-line bg-gray-100 text-gray-800">
          {renderText(msg.content)}
        </div>
      )}
    </div>
  );
}

interface SummaryField {
  key: keyof AIProfileDraft;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  prefix?: string;
  suffix?: string;
}

const SUMMARY_FIELDS: SummaryField[] = [
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'Residence state', type: 'text' },
  { key: 'employerName', label: 'Employer', type: 'text' },
  { key: 'employerState', label: 'Employer state (payroll)', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'grossAnnualSalary', label: 'Gross annual salary', type: 'number', prefix: '$' },
  {
    key: 'payFrequency', label: 'Pay frequency', type: 'select', options: [
      { value: 'biweekly', label: 'Biweekly (26×/yr)' },
      { value: 'semi_monthly', label: 'Semi-monthly (24×/yr)' },
      { value: 'monthly', label: 'Monthly (12×/yr)' },
    ]
  },
  {
    key: 'filingStatus', label: 'Filing status', type: 'select', options: [
      { value: 'single', label: 'Single' },
      { value: 'married_filing_jointly', label: 'Married filing jointly' },
      { value: 'married_filing_separately', label: 'Married filing separately' },
      { value: 'head_of_household', label: 'Head of household' },
    ]
  },
  { key: 'contributionPct401k', label: '401(k) contribution', type: 'number', suffix: '%' },
  { key: 'employerMatchPct', label: 'Employer match rate', type: 'number', suffix: '%' },
  { key: 'employerMatchCapPct', label: 'Employer match cap', type: 'number', suffix: '% of salary' },
  { key: 'monthlyRent', label: 'Rent / mortgage', type: 'number', prefix: '$' },
  { key: 'monthlyFood', label: 'Food & dining', type: 'number', prefix: '$' },
  { key: 'monthlyUtilities', label: 'Utilities (electric, internet, etc.)', type: 'number', prefix: '$' },
  { key: 'monthlyCar', label: 'Car payment', type: 'number', prefix: '$' },
  { key: 'monthlyInsurance', label: 'Insurance (health, auto, etc.)', type: 'number', prefix: '$' },
  { key: 'monthlyFun', label: 'Fun & entertainment', type: 'number', prefix: '$' },
  { key: 'monthlyTravel', label: 'Travel & vacation', type: 'number', prefix: '$' },
  { key: 'monthlyStudentLoans', label: 'Student loan payments', type: 'number', prefix: '$' },
  { key: 'otherMonthlyExpenses', label: 'Other expenses', type: 'number', prefix: '$' },
  { key: 'currentInvestmentBalance', label: 'Current savings / investments', type: 'number', prefix: '$' },
  { key: 'expectedAnnualReturn', label: 'Expected annual return', type: 'number', suffix: '%' },
  { key: 'emergencyFundMonths', label: 'Emergency fund goal', type: 'number', suffix: ' months' },
];

const SUMMARY_SECTIONS: { title: string; fields: (keyof AIProfileDraft)[]; cols: string }[] = [
  {
    title: 'Basics',
    fields: ['age', 'city', 'state', 'employerName', 'employerState'],
    cols: 'grid-cols-2 md:grid-cols-5',
  },
  {
    title: 'Income and taxes',
    fields: ['grossAnnualSalary', 'payFrequency', 'filingStatus'],
    cols: 'grid-cols-3',
  },
  {
    title: '401(k)',
    fields: ['contributionPct401k', 'employerMatchPct', 'employerMatchCapPct'],
    cols: 'grid-cols-1 md:grid-cols-3',
  },
  {
    title: 'Monthly expenses',
    fields: [
      'monthlyRent',
      'monthlyFood',
      'monthlyUtilities',
      'monthlyCar',
      'monthlyInsurance',
      'monthlyFun',
      'monthlyTravel',
      'monthlyStudentLoans',
      'otherMonthlyExpenses',
    ],
    cols: 'grid-cols-2 md:grid-cols-3',
  },
  {
    title: 'Goals',
    fields: ['currentInvestmentBalance', 'expectedAnnualReturn', 'emergencyFundMonths'],
    cols: 'grid-cols-3',
  },
];

const SUMMARY_FIELD_MAP = new Map(SUMMARY_FIELDS.map((field) => [field.key, field]));

export function OnboardingChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRerun = searchParams.get('rerun') === 'true';
  const { user } = useAuth();
  const setProfile = useProfileStore((s) => s.setProfile);

  const [messages, setMessages] = useState<ChatMessage[]>([isRerun ? RERUN_MESSAGE : INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<AIProfileDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, draft]);

  useEffect(() => {
    if (!isLoading && !draft) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading, currentChoices, draft]);

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    if (!overrideText) setInput('');
    setCurrentChoices([]);

    const updated: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: { messages: updated },
      });

      if (error) throw new Error(String(error));

      const rawContent = (data as { content: string }).content;

      const profileMatch = rawContent.match(/<profile_complete>([\s\S]*?)<\/profile_complete>/);
      const choicesMatch = rawContent.match(/<choices>([\s\S]*?)<\/choices>/);

      const cleanContent = rawContent
        .replace(/<profile_complete>[\s\S]*?<\/profile_complete>/, '')
        .replace(/<choices>[\s\S]*?<\/choices>/, '')
        .trim();

      if (profileMatch) {
        const extracted = JSON.parse(profileMatch[1].trim()) as AIProfileDraft;
        setDraft(extracted);
      }

      if (choicesMatch && !profileMatch) {
        try {
          const parsed = JSON.parse(choicesMatch[1].trim()) as string[];
          setCurrentChoices(parsed);
        } catch { /* ignore malformed choices */ }
      }

      setMessages([...updated, { role: 'assistant', content: cleanContent }]);
    } catch {
      setMessages([
        ...updated,
        { role: 'assistant', content: "Hmm, something went wrong on my end 😅 Mind trying that again?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(key: keyof AIProfileDraft, value: string | number | boolean | null) {
    setDraft((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function renderSummaryField(field: SummaryField) {
    if (!draft) return null;

    const rawVal = draft[field.key];
    const val = rawVal === null || rawVal === undefined ? '' : String(rawVal);

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.key} className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[10px] text-gray-400 font-semibold truncate">
            {field.label}
          </label>
          <select
            value={val}
            className="w-full min-w-0 bg-gray-50 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
            onChange={(e) => updateDraft(field.key, e.target.value)}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.key} className="flex flex-col gap-1.5 min-w-0">
        <label className="text-[10px] text-gray-400 font-semibold truncate">
          {field.label}
        </label>
        <div className="relative flex items-center min-w-0">
          {field.prefix && (
            <span className="absolute left-3 text-gray-400 text-sm font-mono select-none">{field.prefix}</span>
          )}
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={val}
            className={`w-full min-w-0 bg-gray-50 border border-black/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 ${field.prefix ? 'pl-7' : ''} ${field.suffix ? 'pr-16' : ''}`}
            onChange={(e) => updateDraft(
              field.key,
              field.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value
            )}
          />
          {field.suffix && (
            <span className="absolute right-3 text-gray-400 text-[11px] font-mono select-none truncate max-w-14">{field.suffix}</span>
          )}
        </div>
      </div>
    );
  }

  async function handleSave() {
    if (!user || !draft) return;
    setSaving(true);
    setSaveError('');

    const profile: UserProfile = {
      id: user.id,
      age: Number(draft.age) || 22,
      state: draft.state,
      city: draft.city,
      employerName: draft.employerName || undefined,
      employerState: draft.employerState || undefined,
      isRemote: draft.isRemote,
      lifestyleTier: draft.lifestyleTier as LifestyleTier,
      housingType: draft.housingType as HousingType,
      grossAnnualSalary: Number(draft.grossAnnualSalary) || 0,
      payFrequency: draft.payFrequency as PayFrequency,
      filingStatus: draft.filingStatus as FilingStatus,
      contributionPct401k: Number(draft.contributionPct401k) || 0,
      employerMatchPct: Number(draft.employerMatchPct) || 0,
      employerMatchCapPct: Number(draft.employerMatchCapPct) || 0,
      monthlyRent: Number(draft.monthlyRent) || 0,
      monthlyCar: Number(draft.monthlyCar) || 0,
      monthlyInsurance: Number(draft.monthlyInsurance) || 0,
      monthlyStudentLoans: Number(draft.monthlyStudentLoans) || 0,
      monthlyFood: Number(draft.monthlyFood) || 0,
      monthlyUtilities: Number(draft.monthlyUtilities) || 0,
      monthlyFun: Number(draft.monthlyFun) || 0,
      monthlyTravel: Number(draft.monthlyTravel) || 0,
      otherMonthlyExpenses: Number(draft.otherMonthlyExpenses) || 0,
      emergencyFundMonths: Number(draft.emergencyFundMonths) || 6,
      currentInvestmentBalance: Number(draft.currentInvestmentBalance) || 0,
      expectedAnnualReturn: Number(draft.expectedAnnualReturn) || 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error } = await saveProfile(profile);
    if (error) {
      setSaveError(error);
    } else {
      setProfile(profile);
      navigate('/dashboard');
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-black/[0.06] px-5 py-4 flex items-center justify-between">
        <span className="text-base font-bold tracking-tight gradient-text">Stackd</span>
        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">AI Advisor</span>
      </header>

      {/* Chat */}
      <div ref={chatRef} className={`flex-1 overflow-y-auto px-4 py-6 mx-auto w-full ${draft ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}

          {/* Profile summary card — appears after profile_complete */}
          {draft && (
            <div className="mt-4">
              <div className="rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* Summary header */}
                <div className="bg-gray-950 px-5 py-4 md:flex md:items-center md:justify-between md:gap-4">
                  <p className="text-white font-bold text-base">🎉 Here's your financial profile</p>
                  <p className="text-white/60 text-xs mt-1">Compact review. Edit anything before saving.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                      {draft.city}, {draft.state}
                    </span>
                    <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-gray-950">
                      ${Number(draft.grossAnnualSalary || 0).toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                {/* Tax note if present */}
                {draft.taxNote && (
                  <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-bold">⚠️ Tax heads-up: </span>{draft.taxNote}
                    </p>
                  </div>
                )}

                {/* Editable fields */}
                <div className="p-5 grid gap-4">
                  {SUMMARY_SECTIONS.map((section) => (
                    <section key={section.title} className="rounded-xl border border-black/[0.06] bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                        <span className="text-[10px] font-semibold text-gray-400">{section.fields.length} fields</span>
                      </div>
                      <div className={`grid ${section.cols} gap-3`}>
                        {section.fields.map((key) => {
                          const field = SUMMARY_FIELD_MAP.get(key);
                          return field ? renderSummaryField(field) : null;
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Save button */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-black/[0.06] px-5 py-4">
                  {saveError && (
                    <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>
                  )}
                  <button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="w-full py-4 rounded-xl text-base font-bold text-white gradient-brand shadow-[0_4px_16px_rgba(34,197,94,0.35)] hover:shadow-[0_4px_24px_rgba(34,197,94,0.5)] active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save my plan 🚀'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick-choice buttons */}
      {currentChoices.length > 0 && !draft && (
        <div className="sticky bottom-[72px] bg-white/90 backdrop-blur-sm border-t border-black/[0.04] px-4 pt-3 pb-2">
          <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {currentChoices.map((choice) => {
              const isRecommended = choice.startsWith('✅');
              return (
                <button
                  key={choice}
                  onClick={() => void sendMessage(choice)}
                  disabled={isLoading}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold active:scale-95 transition-all whitespace-nowrap disabled:opacity-40 ${
                    isRecommended
                      ? 'gradient-brand text-white shadow-[0_2px_8px_rgba(34,197,94,0.35)]'
                      : 'bg-white border-2 border-green-200 text-green-700 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input bar — only show while conversation is active (no draft yet) */}
      {!draft && (
        <div className="sticky bottom-0 bg-white border-t border-black/[0.06] px-4 py-3 pb-safe">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              placeholder="Type your answer..."
              className="flex-1 bg-gray-50 border border-black/10 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl gradient-brand text-white flex items-center justify-center shadow-[0_2px_8px_rgba(34,197,94,0.3)] disabled:opacity-40 active:scale-95 transition-all"
              aria-label="Send"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-2">Press Enter to send</p>
        </div>
      )}
    </div>
  );
}
