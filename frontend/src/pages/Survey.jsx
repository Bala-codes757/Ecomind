import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getSurveySession, submitSurveyAnswer } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Survey() {
  const { module } = useParams();
  const navigate = useNavigate();
  const { notify } = useWorkspace();
  const moduleKey = module || 'energy';

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [questionHistory, setQuestionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const res = await getSurveySession(moduleKey);
        if (res.success) {
          setSession(res.session);
          window.localStorage.setItem('ecomindSurveySessionId', res.session.id);
          setCurrentQuestion(res.currentQuestion);
          setSelectedOption(res.currentQuestion?.options[0]?.value || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [moduleKey]);

  const handleNext = async () => {
    if (!session || !currentQuestion || !selectedOption) return;
    setLoading(true);
    try {
      setQuestionHistory((prev) => [...prev, { question: currentQuestion, selected: selectedOption }]);
      const res = await submitSurveyAnswer(session.id, currentQuestion.id, selectedOption);
      if (res.isComplete) setIsCompleted(true);
      else if (res.nextQuestion) {
        setCurrentQuestion(res.nextQuestion);
        setSelectedOption(res.nextQuestion.options?.[0]?.value || '');
      }
    } catch (err) {
      console.error(err);
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

  if (loading && !currentQuestion) {
    return (
      <div className="container page-shell">
        <p className="text-muted">Loading questions…</p>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      <PageIntro
        kicker={moduleKey}
        title="Site questions"
        actions={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => notify(`Session ${session?.id} is stored. You can leave and come back.`)}>
            Save for later
          </button>
        }
      >
        A short branch of questions so the scorecard knows how this site actually runs.
      </PageIntro>

      <div className="surface" style={{ maxWidth: 720, margin: '0 auto' }}>
        {isCompleted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <h2 className="section-title">That’s enough context</h2>
            <p className="text-muted" style={{ marginBottom: '1.25rem' }}>
              Next, drop in a bill so the numbers can be checked against what you just described.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/data')}>
              Continue to records
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="page-kicker" style={{ marginBottom: '0.75rem' }}>Question {questionHistory.length + 1}</p>
            <h2 className="section-title">{currentQuestion?.question_text}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1.25rem 0 1.5rem' }}>
              {currentQuestion?.options?.map((opt) => (
                <label key={opt.value} className={`option-row ${selectedOption === opt.value ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="survey-option"
                    value={opt.value}
                    checked={selectedOption === opt.value}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={handleBack} disabled={!questionHistory.length}>
                <ArrowLeft size={16} />
                Back
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={handleNext}>Skip</button>
                <button className="btn btn-primary" onClick={handleNext} disabled={loading}>
                  Next
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
