import React, { useState, useEffect } from 'react';
import { getInterviewQuestionsApi, evaluateMockAnswerApi, startInterviewSessionApi } from '../services/api';
import { Video, Mic, Send, CheckCircle2, Award, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function MockInterviewPage() {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    initMockSession();
  }, []);

  const initMockSession = async () => {
    try {
      const sessionRes = await startInterviewSessionApi('Software Engineer');
      setSession(sessionRes.data);
      const qRes = await getInterviewQuestionsApi({ role: 'Software Engineer', count: 4 });
      setQuestions(qRes.data || []);
      setCurrentIdx(0);
      setEvaluations([]);
      setIsFinished(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setEvaluating(true);
    const currentQ = questions[currentIdx];

    try {
      const res = await evaluateMockAnswerApi({
        session_id: session?.id,
        question_id: currentQ.id,
        question: currentQ.question,
        category: currentQ.category,
        user_answer: userAnswer
      });

      setEvaluations([...evaluations, res.data]);
      setUserAnswer('');

      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setIsFinished(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = questions[currentIdx];

  const overallSessionScore = evaluations.length > 0
    ? roundScore(evaluations.reduce((acc, curr) => acc + curr.overall_score, 0) / evaluations.length)
    : 0.0;

  function roundScore(val) {
    return Math.round(val * 10) / 10;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-emerald-400" />
            <span>AI Mock Interview Studio</span>
          </h1>
          <p className="text-xs text-slate-400">Practice live technical Q&A with instant AI feedback on technical correctness, clarity, and relevance.</p>
        </div>

        <button
          onClick={initMockSession}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restart Session</span>
        </button>
      </div>

      {!isFinished && currentQ ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question & Answer Input */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Question {currentIdx + 1} of {questions.length}</span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30">{currentQ.category}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white leading-relaxed">{currentQ.question}</h2>
              <p className="text-xs text-slate-400">Speak or type your response clearly. Focus on explaining implementation details and architectural choices.</p>
            </div>

            <form onSubmit={handleNextSubmit} className="space-y-4">
              <textarea
                rows={6}
                required
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your interview answer here..."
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500 leading-relaxed"
              />

              <button
                type="submit"
                disabled={evaluating || !userAnswer.trim()}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {evaluating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Evaluate Answer</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Real-time Progress & Guidance */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base">Key Evaluation Heuristics</h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                <span className="font-bold text-brand-400">1. Technical Accuracy</span>
                <p>Correct usage of domain concepts, framework methods, and time complexity.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">2. Clarity & Structure</span>
                <p>Logical flow of explanation without unnecessary hesitation.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400">3. Relevance</span>
                <p>Directly answering the specific question asked by the interviewer.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Evaluation Summary Report */
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white">Mock Interview Evaluation Report</h2>
            <p className="text-xs text-slate-400">Session completed! Here is your AI interview performance breakdown.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Session Score</span>
            <div className="text-5xl font-black text-emerald-400 mt-1">{overallSessionScore}%</div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-white text-base">Detailed Question-by-Question Evaluation</h3>
            {evaluations.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase">Q{idx + 1}: {item.category}</span>
                    <h4 className="text-sm font-bold text-white leading-snug">{item.question}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs shrink-0">
                    {item.overall_score}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  "Your Answer: {item.user_answer}"
                </p>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Clarity</span>
                    <div className="font-bold text-white">{item.clarity_score}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Relevance</span>
                    <div className="font-bold text-white">{item.relevance_score}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Accuracy</span>
                    <div className="font-bold text-white">{item.technical_accuracy_score}%</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-amber-400">AI Feedback:</span>
                  <p className="text-slate-400 leading-relaxed">{item.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
