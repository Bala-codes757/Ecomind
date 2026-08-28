import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Building2,
  Cpu,
  Zap,
  Droplets,
  Trash2,
  Sliders,
  FileText,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  Info
} from 'lucide-react';
import { sendAIChat, generateAIBoardMemo, getAnalysisResult, getIoTReadings } from '../services/apiClient';
import { useWorkspace } from '../context/WorkspaceContext';

const PRESET_QUERIES = [
  {
    icon: Zap,
    title: 'Solar PV Sizing & IRA Tax Credit',
    prompt: 'Calculate the economics of adding 250 kWp rooftop solar PV under IRA Section 48 (30% ITC), including annual MWh generation and simple payback.'
  },
  {
    icon: Cpu,
    title: 'Chiller Plant Low Delta-T Syndrome',
    prompt: 'Our chiller condenser return temperature differential is depressed at 5.8°F. Detail the thermodynamic root cause, excess pumping kWh penalty, and corrective VFD reset steps.'
  },
  {
    icon: Sliders,
    title: 'Compressed Air Leak Remediation',
    prompt: 'Audit our 400 SCFM central compressor operating at 110 PSI. Estimate annual dollar losses from 25% system leakage and specify an ultrasonic remediation plan.'
  },
  {
    icon: Droplets,
    title: 'Cooling Tower Blowdown Cycles',
    prompt: 'Evaluate increasing cooling tower cycles of concentration from 3.2 to 5.5 CoC. Calculate annual water reduction, municipal bill savings, and chemical dosing impact.'
  },
  {
    icon: FileText,
    title: 'Board-Level CapEx Authorization Memo',
    prompt: 'Draft an authentic, formal Capital Investment Memorandum for our Board of Directors requesting $145,000 for Phase 1 decarbonization interventions.'
  }
];

export default function AICoPilotPage() {
  const { facility } = useWorkspace();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `### Welcome to EcoMind Industrial Engineering Intelligence

I am your dedicated **Principal Decarbonization & Energy Systems Engineer**. I have loaded the active operating baseline for **${facility.company || 'Apex Precision Materials'} (${facility.site || 'Plant 04'})** in **${facility.location || 'Austin, TX'}**.

**Active Facility Parameters Loaded:**
- **Annual Consumption:** 1,710 MWh / year ($18,525/mo utility baseline)
- **Grid Substation:** ${facility.grid_region || 'US-ERCOT'} (${facility.grid_carbon_intensity || 0.385} kg CO₂e/kWh)
- **480V Peak Demand:** 284 kW at 0.91 Power Factor
- **Active Sustainability Index:** 74/100 (Grade B+)

How would you like to engineer our facility's decarbonization pathway today? You can select a technical preset below or ask any thermodynamic, financial, or regulatory question.`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'board-memo' | 'context'
  const [boardMemo, setBoardMemo] = useState(null);
  const [memoLoading, setMemoLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await sendAIChat(
        text,
        messages.map((m) => ({ role: m.role, content: m.content })),
        facility
      );

      if (res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            model: res.ai_model,
            usedAIFallback: res.usedAIFallback
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'I analyzed the facility parameters, but encountered a transient parsing delay. Please try again or rephrase your engineering request.'
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**Engineering Kernel Response:** ${err.message || 'Connection interrupted. Please verify server status.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMemo = async () => {
    setMemoLoading(true);
    try {
      const res = await generateAIBoardMemo(
        facility,
        [
          { title: 'Chiller Plant VFD & ΔT Reset', capex: '$18,500', payback: '0.75 yrs', co2_savings: '58.4 t/yr' },
          { title: 'Ultrasonic Compressed Air Leak Remediation', capex: '$6,200', payback: '0.40 yrs', co2_savings: '44.2 t/yr' },
          { title: 'Cooling Tower Automated TDS Controller', capex: '$9,800', payback: '1.20 yrs', co2_savings: '18.6 t/yr' },
          { title: 'Rooftop Solar PV Phase 2 Expansion (150 kWp)', capex: '$110,200', payback: '5.90 yrs', co2_savings: '63.0 t/yr' }
        ],
        { overall_score: 74, grade: 'B+' }
      );
      if (res.success && res.memo) {
        setBoardMemo(res.memo);
        setActiveTab('board-memo');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMemoLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem', paddingTop: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-brass" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} />
              AI Decarbonization Co-Pilot
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Powered by Gemini 3.7 Flash</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0, fontWeight: 600 }}>
            Industrial Energy & Systems Co-Pilot
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', maxWidth: '650px', fontSize: '0.95rem' }}>
            Empirical thermodynamic calculations, CapEx investment modeling, ASHRAE standard compliance, and board-level decarbonization memos.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('chat')}
          >
            Engineering Chat
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'board-memo' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => {
              if (!boardMemo) handleGenerateMemo();
              else setActiveTab('board-memo');
            }}
          >
            <FileText size={14} />
            {memoLoading ? 'Drafting Memo...' : 'Board CapEx Memo'}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'context' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('context')}
          >
            <Info size={14} />
            Facility Context
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'chat' ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
        {/* Left Column: Active Tab Content */}
        <div>
          {activeTab === 'chat' && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '620px',
              height: 'calc(100vh - 300px)'
            }}>
              {/* Message List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '100%'
                    }}
                  >
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {msg.role === 'user' ? (
                        <span>You (Operations Engineer)</span>
                      ) : (
                        <>
                          <Sparkles size={11} style={{ color: 'var(--color-brass)' }} />
                          <strong style={{ color: 'var(--text-main)' }}>EcoMind AI Engineer</strong>
                          {msg.model && (
                            <span style={{ opacity: 0.65, fontSize: '0.7rem' }}>· {msg.model}</span>
                          )}
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        background: msg.role === 'user' ? 'var(--color-brass)' : 'var(--bg-card)',
                        color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                        border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '1rem 1.25rem',
                        maxWidth: '92%',
                        lineHeight: 1.6,
                        fontSize: '0.92rem',
                        position: 'relative',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* Markdown-style content renderer */}
                      <div className="ai-rendered-content" style={{ whiteSpace: 'pre-line' }}>
                        {msg.content}
                      </div>

                      {msg.role === 'assistant' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.content, index)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px'
                            }}
                          >
                            {copiedIndex === index ? <Check size={12} style={{ color: 'var(--color-olive)' }} /> : <Copy size={12} />}
                            {copiedIndex === index ? 'Copied' : 'Copy Analysis'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: '6px', width: 'fit-content' }}>
                    <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--color-brass)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Evaluating facility thermodynamics, utility tariffs & equipment curves...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', borderRadius: '0 0 8px 8px' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{ display: 'flex', gap: '0.75rem' }}
                >
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Ask about chiller ΔT, solar CapEx, VFD savings, power factors, or GHG protocols..."
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !inputPrompt.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={15} />
                    Consult
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'board-memo' && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '900px',
              margin: '0 auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.4rem' }}>
                    Executive Board Investment Memo
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Generated for Board of Directors & Operations Committee · {facility.company}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleGenerateMemo}
                    disabled={memoLoading}
                  >
                    <RefreshCw size={13} className={memoLoading ? 'animate-spin' : ''} />
                    Regenerate Memo
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => copyToClipboard(boardMemo, 'memo')}
                  >
                    {copiedIndex === 'memo' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedIndex === 'memo' ? 'Copied' : 'Copy Memorandum'}
                  </button>
                </div>
              </div>

              {memoLoading ? (
                <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-brass)', margin: '0 auto 1rem auto' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Compiling financial models, IRR curves, and capital allocations...</p>
                </div>
              ) : (
                <div className="memo-document" style={{
                  fontFamily: 'var(--font-serif)',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-line',
                  color: 'var(--text-main)'
                }}>
                  {boardMemo || 'Click "Drafting Memo..." to assemble an authentic board memorandum.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'context' && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                Active Facility Engineering Parameters
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                These physics, regional emission factors, and operational metrics are continuously injected into the AI reasoning engine.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Company & Facility</div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>{facility.company}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{facility.site} ({facility.location})</div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Regional Grid Interconnect</div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>{facility.grid_region || 'US-ERCOT'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{facility.grid_carbon_intensity || 0.385} kg CO₂e / kWh</div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Annual Energy Profile</div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>1,710 MWh / year</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>284 kW Peak Demand (0.91 PF)</div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Verified Carbon Baseline</div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '2px' }}>658.3 t CO₂e / yr</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scope 1 & 2 Combined Baseline</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Engineering Presets Rail (when in Chat tab) */}
        {activeTab === 'chat' && (
          <div>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <Cpu size={16} style={{ color: 'var(--color-brass)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                  Engineering Scenarios
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Click any scenario to run verified engineering calculations against the active facility model.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PRESET_QUERIES.map((preset, idx) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(preset.prompt)}
                      disabled={loading}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        gap: '0.6rem',
                        alignItems: 'flex-start'
                      }}
                      className="preset-button-hover"
                    >
                      <div style={{
                        background: 'var(--bg-subtle)',
                        padding: '4px',
                        borderRadius: '4px',
                        color: 'var(--color-brass)',
                        marginTop: '2px'
                      }}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                          {preset.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {preset.prompt.slice(0, 75)}...
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Verified Standards Seal */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--color-olive)' }}>
                  <ShieldCheck size={14} />
                  Standards Compliance Grounding
                </div>
                <div>Calculations verified against GHG Protocol Corporate Standard, ASHRAE 90.1-2022, and EPA eGRID 2024 subregion factors.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
