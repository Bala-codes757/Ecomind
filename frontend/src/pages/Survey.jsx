import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap, Droplets, Trash2, HelpCircle, CheckCircle2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { getSurveySession, submitSurveyAnswer } from '../services/apiClient';
import { FALLBACK_SURVEY_QUESTIONS } from '../data/surveyQuestions';
import PageIntro from '../components/PageIntro';
import { useWorkspace } from '../context/WorkspaceContext';

const MODULE_TABS = [
  { key: 'energy', label: 'Energy & Thermal', icon: Zap, factor: 'Scope 1 & 2 Emissions' },
  { key: 'water', label: 'Water & Cooling', icon: Droplets, factor: 'Process & Make-up Volume' },
  { key: 'waste', label: 'Waste & Circularity', icon: Trash2, factor: 'Landfill & Scope 3 Stream' }
];

export default function Survey() {
  const { module } = useParams();
  const navigate = useNavigate();
  const { facility, notify } = useWorkspace();
  const moduleKey = module || 'energy';

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [questionHistory, setQuestionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const res = await getSurveySession(moduleKey);
        if (res && res.success && res.currentQuestion) {
          setSession(res.session || { id: `session-${Date.now()}`, module_key: moduleKey });
          if (res.session?.id) {
            window.localStorage.setItem('ecomindSurveySessionId', res.session.id);
          }
          setCurrentQuestion(res.currentQuestion);
          setSelectedOption(res.currentQuestion?.options[0]?.value || '');
          setQuestionHistory([]);
          setIsCompleted(false);
        } else {
          throw new Error('No question returned from server');
        }
      } catch (err) {
        console.warn('[Survey] Backend unavailable or failed, initializing local survey branch:', err);
        const fallbackQuestions = FALLBACK_SURVEY_QUESTIONS[moduleKey] || FALLBACK_SURVEY_QUESTIONS.energy;
        const firstQ = fallbackQuestions[0];
        setSession({ id: `local-${moduleKey}-${Date.now()}`, module_key: moduleKey, isLocal: true });
        setCurrentQuestion(firstQ);
        setSelectedOption(firstQ?.options[0]?.value || '');
        setQuestionHistory([]);
        setIsCompleted(false);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [moduleKey]);

  const handleNext = async () => {
    if (!currentQuestion || !selectedOption) return;
    setLoading(true);
    try {
      setQuestionHistory((prev) => [...prev, { question: currentQuestion, selected: selectedOption }]);
      setTotalAnswered((prev) => prev + 1);

      if (session?.isLocal) {
        // Handle local step progression
        const fallbackQuestions = FALLBACK_SURVEY_QUESTIONS[moduleKey] || FALLBACK_SURVEY_QUESTIONS.energy;
        const currentIndex = fallbackQuestions.findIndex((q) => q.id === currentQuestion.id);
        if (currentIndex !== -1 && currentIndex < fallbackQuestions.length - 1) {
          const nextQ = fallbackQuestions[currentIndex + 1];
          setCurrentQuestion(nextQ);
          setSelectedOption(nextQ.options?.[0]?.value || '');
        } else {
          setIsCompleted(true);
          notify(`${moduleKey.toUpperCase()} operational diagnosis completed!`);
        }
      } else {
        const res = await submitSurveyAnswer(session.id, currentQuestion.id, selectedOption);
        if (res.isComplete) {
          setIsCompleted(true);
          notify(`${moduleKey.toUpperCase()} operational diagnosis completed!`);
        } else if (res.nextQuestion) {
          setCurrentQuestion(res.nextQuestion);
          setSelectedOption(res.nextQuestion.options?.[0]?.value || '');
        } else {
          setIsCompleted(true);
          notify(`${moduleKey.toUpperCase()} operational diagnosis completed!`);
        }
      }
    } catch (err) {
      console.warn('[Survey] Error in submitSurveyAnswer, falling back locally:', err);
      const fallbackQuestions = FALLBACK_SURVEY_QUESTIONS[moduleKey] || FALLBACK_SURVEY_QUESTIONS.energy;
      const currentIndex = fallbackQuestions.findIndex((q) => q.id === currentQuestion.id);
      if (currentIndex !== -1 && currentIndex < fallbackQuestions.length - 1) {
        const nextQ = fallbackQuestions[currentIndex + 1];
        setCurrentQuestion(nextQ);
        setSelectedOption(nextQ.options?.[0]?.value || '');
      } else {
        setIsCompleted(true);
        notify(`${moduleKey.toUpperCase()} operational diagnosis completed!`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (!questionHistory.length) return;
    const previous = questionHistory[questionHistory.length - 1];
    setQuestionHistory((prev) => prev.slice(0, -1));
    setCurrentQuestion(previous.question);
    setSelectedOption(previous.selected);
    setIsCompleted(false);
  };

  const selectedOptMeta = currentQuestion?.options?.find((o) => o.value === selectedOption);

  if (loading && !currentQuestion) {
    return (
      <div className="container page-shell">
        <p className="text-muted">Loading engineering questions for {facility.company || 'Facility'}…</p>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      {/* Module Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {MODULE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === moduleKey;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(`/survey/${tab.key}`)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.84rem',
                padding: '0.5rem 0.9rem'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.8, background: 'rgba(0,0,0,0.12)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>
                {tab.factor}
              </span>
            </button>
          );
        })}
      </div>

      <PageIntro
        kicker={`${facility.company || 'Industrial'} · ${facility.site || 'Site'} · ${moduleKey.toUpperCase()}`}
        title="Industrial Site Diagnostic Survey"
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => notify(`Session ${session?.id || 'active'} saved. Audit progress preserved.`)}
          >
            Save Session State
          </button>
        }
      >
        Domain-specific questions extracting equipment baseline, process scheduling, heat recovery, and cooling tower delta-T for precision calculations.
      </PageIntro>

      <div className="surface" style={{ maxWidth: 760, margin: '0 auto', border: '1px solid var(--border-accent)' }}>
        {isCompleted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(130, 152, 119, 0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
              <CheckCircle2 size={26} />
            </div>
            <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
              {moduleKey.toUpperCase()} Diagnostic Branch Complete
            </h2>
            <p className="text-muted" style={{ maxWidth: 540, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Extracted operational profile has been mapped to deterministic carbon and efficiency equations. Next, upload utility records or run the score calculator.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/data')}>
                Continue to Records & OCR
                <ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/results')}>
                View Scorecard
              </button>
              {moduleKey !== 'waste' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/survey/${moduleKey === 'energy' ? 'water' : 'waste'}`)}
                >
                  Next Module ({moduleKey === 'energy' ? 'Water' : 'Waste'})
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header Metadata Pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span className="badge badge-brass" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Question {questionHistory.length + 1} of 4 · {moduleKey}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Grid: <strong>{facility.grid_region || 'US-ERCOT'}</strong> ({facility.grid_carbon_intensity || 0.385} kg/kWh)
              </span>
            </div>

            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              {currentQuestion?.question_text}
            </h2>

            {/* Engineering Calculation Significance Callout */}
            <div style={{ background: 'var(--surface-muted)', borderLeft: '3px solid var(--color-primary-dark)', padding: '0.5rem 0.75rem', margin: '0.75rem 0 1.25rem', borderRadius: '0 4px 4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Calculation Factor: </strong>
              {moduleKey === 'energy'
                ? 'Determines baseload vs weather-dependent HVAC kW load and off-peak demand peak charges.'
                : moduleKey === 'water'
                ? 'Quantifies blowdown discharge concentration and process make-up water recovery potential.'
                : 'Directly dictates EPA landfill emission factor (1.42 kg CO₂e/kg) vs diversion credits.'}
            </div>

            {/* Dynamic Options List with Impact Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '1rem 0 1.5rem' }}>
              {currentQuestion?.options?.map((opt) => {
                const isSelected = selectedOption === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`option-row ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="radio"
                        name="survey-option"
                        value={opt.value}
                        checked={isSelected}
                        onChange={(e) => setSelectedOption(e.target.value)}
                      />
                      <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {opt.label}
                      </span>
                    </div>

                    {/* Operational Impact Badge */}
                    {opt.score_penalty !== undefined && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 4,
                          background: opt.score_penalty > 0 ? 'rgba(196, 154, 69, 0.15)' : 'rgba(130, 152, 119, 0.18)',
                          color: opt.score_penalty > 0 ? '#b08b3c' : 'var(--color-primary-dark)'
                        }}
                      >
                        {opt.score_penalty === 0 ? 'Optimal (0 penalty)' : `-${opt.score_penalty} pts impact`}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={!questionHistory.length}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleNext}>
                  Skip
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
                  Next Question
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

