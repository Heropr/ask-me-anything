import { useState } from 'react';
import './AskMeAnythingLight.css';
import sendIcon from '../assets/icons/send-button.svg';
import refreshIcon from '../assets/icons/refresh.svg';

const suggestionQuestions = [
  "What does Smirk cover?",
  "How much is a cleaning?",
  "Are there dentists near me?",
  "What's my Smirk price?",
  "Does Smirk cover braces?",
  "How do I use my card?",
  "Can I add my family?",
  "What's the cost for a crown?",
];

const mockAnswers = {
  "What does Smirk cover?": "Smirk covers a wide range of dental services including preventive care like cleanings and X-rays, basic procedures such as fillings and extractions, and major work like crowns, bridges, and root canals. Most plans also include orthodontic coverage for both children and adults.",
  "How much is a cleaning?": "With Smirk, preventive cleanings are typically covered at 100% with no out-of-pocket cost when you visit an in-network dentist. Without insurance, cleanings usually range from $75-$200 depending on your location.",
  "Are there dentists near me?": "Yes. As long as you live in Texas, you can be covered in Dripping Springs. Smirk works statewide, and we'll show you in-network dentists near you when you search your ZIP code.",
  "What's my Smirk price?": "Smirk plans start at just $19.99/month for individuals. Family plans are available starting at $39.99/month. Your exact price depends on the coverage level you choose and your location.",
  "Does Smirk cover braces?": "Yes! Smirk offers orthodontic coverage for both children and adults. Depending on your plan, you can receive up to $2,500 in lifetime orthodontic benefits, which can be applied to traditional braces or clear aligners.",
  "How do I use my card?": "Simply present your Smirk member card at any in-network dentist. Your card contains your member ID and group number. The dentist's office will verify your coverage and bill Smirk directly for covered services.",
  "Can I add my family?": "You can add your spouse and dependent children to your Smirk plan at any time. Family members get the same great coverage and access to our entire network of dentists.",
  "What's the cost for a crown?": "Crowns typically cost between $800-$1,500 without insurance. With Smirk, crowns are usually covered at 50-60% after your deductible, meaning you could pay as little as $300-$500 out of pocket.",
};

const keywordAnswers = [
  { keywords: ["cover", "include", "plan"], answer: "Smirk covers preventive care like cleanings and X-rays, basic procedures such as fillings and extractions, and major work like crowns, bridges, and root canals. Orthodontic coverage is also available on most plans." },
  { keywords: ["cost", "price", "how much", "expensive", "pay", "afford"], answer: "Smirk plans start at $19.99/month for individuals and $39.99/month for families. Most preventive services are covered at 100%, basic procedures at 80%, and major work at 50-60% after your deductible." },
  { keywords: ["dentist", "doctor", "near", "find", "location", "network"], answer: "Smirk partners with over 10,000 dentists across Texas. Enter your ZIP code in your member portal to find in-network providers near you, complete with ratings and availability." },
  { keywords: ["braces", "orthodon", "align", "straight"], answer: "Smirk offers orthodontic coverage for both children and adults. Depending on your plan, you can receive up to $2,500 in lifetime orthodontic benefits for traditional braces or clear aligners." },
  { keywords: ["family", "spouse", "child", "kid", "dependent", "add"], answer: "You can add your spouse and dependent children to your Smirk plan at any time. Family members get the same coverage and network access. Family plans start at $39.99/month." },
  { keywords: ["card", "member", "id", "use"], answer: "Present your Smirk member card at any in-network dentist. Your card has your member ID and group number. The office will verify coverage and bill Smirk directly for covered services." },
  { keywords: ["clean", "hygiene", "checkup", "preventive"], answer: "Preventive cleanings are covered at 100% with no out-of-pocket cost at in-network dentists. Most plans include two cleanings per year along with annual X-rays and exams." },
  { keywords: ["crown", "root canal", "major", "bridge", "implant"], answer: "Major procedures like crowns, root canals, and bridges are covered at 50-60% after your deductible. With Smirk, you could save $500-$1,000 compared to paying out of pocket." },
  { keywords: ["appointment", "book", "schedule", "visit"], answer: "You can schedule appointments through your member portal, the Smirk app, or by calling any in-network dentist directly. Most appointments can be booked within 48 hours." },
  { keywords: ["cancel", "switch", "change"], answer: "You can modify or cancel your Smirk plan at any time from your member portal. Changes typically take effect at the start of your next billing cycle." },
  { keywords: ["wait", "period", "start", "begin", "when"], answer: "There are no waiting periods for preventive care with Smirk. Basic procedures have a 30-day waiting period, and major procedures have a 6-month waiting period on most plans." },
  { keywords: ["emergency", "urgent", "pain", "tooth"], answer: "For dental emergencies, visit any dentist—in or out of network. Smirk provides emergency coverage with reduced out-of-pocket costs. For life-threatening situations, call 911." },
];

function getAnswer(question) {
  if (mockAnswers[question]) return mockAnswers[question];

  const lower = question.toLowerCase();
  for (const entry of keywordAnswers) {
    if (entry.keywords.some(keyword => lower.includes(keyword))) {
      return entry.answer;
    }
  }

  return "Smirk offers comprehensive dental coverage across Texas with plans starting at $19.99/month. You can find in-network dentists, book appointments, and manage your coverage all through your member account. For specific details about your plan, check your member portal or reach out to our support team.";
}

function AskMeAnythingLight() {
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState('');

  const streamAnswer = (answer) => {
    setIsStreaming(true);
    setDisplayedAnswer('');

    const words = answer.split(' ');
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedAnswer(prev => prev + (currentIndex === 0 ? '' : ' ') + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setCurrentAnswer(answer);
      }
    }, 50);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isStreaming) {
      const question = inputValue.trim();
      const answer = getAnswer(question);

      setCurrentQuestion(question);
      setCurrentAnswer('');
      setInputValue('');

      setTimeout(() => {
        streamAnswer(answer);
      }, 300);
    }
  };

  const handleSuggestionClick = (question) => {
    if (isStreaming) return;

    const answer = getAnswer(question);

    setCurrentQuestion(question);
    setCurrentAnswer('');

    setTimeout(() => {
      streamAnswer(answer);
    }, 300);
  };

  const hasConversation = currentQuestion !== null;

  const handleRefresh = () => {
    setCurrentQuestion(null);
    setCurrentAnswer('');
    setDisplayedAnswer('');
    setIsStreaming(false);
  };

  return (
    <div className="ama-light">
      <div className="ama-light-content">
        <div className={`ama-light-main ${hasConversation ? 'has-conversation' : ''}`}>
          <div className="ama-light-header">
            <h1 className="ama-light-title">
              Ask Me <em>Anything</em>
            </h1>
            <p className="ama-light-subtitle">
              Ask Ailene anything you'd like to know about Smirk
            </p>
          </div>

          {!hasConversation && (
            <div className="ama-light-suggestions">
              {suggestionQuestions.map((question, index) => (
                <button
                  key={index}
                  className="ama-light-suggestion-btn"
                  onClick={() => handleSuggestionClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {hasConversation && (
            <div className="ama-light-conversation">
              <div className="ama-light-message-group">
                <div className="ama-light-question-row">
                  <div className="ama-light-question-bubble">
                    {currentQuestion}
                  </div>
                </div>
                <div className="ama-light-answer">
                  {isStreaming ? displayedAnswer : currentAnswer}
                  {isStreaming && (
                    <span className="ama-light-cursor">|</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ama-light-bottom">
          <div className="ama-light-input-wrapper">
            {hasConversation && (
              <button type="button" className="ama-light-refresh-btn" onClick={handleRefresh}>
                <img src={refreshIcon} alt="" />
                <span>Refresh</span>
              </button>
            )}

            <form className="ama-light-input-container" onSubmit={handleSubmit}>
              <textarea
                className="ama-light-input"
                placeholder="Ask anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={3}
              />
              <button
                type="submit"
                className="ama-light-submit-btn"
                disabled={!inputValue.trim() || isStreaming}
              >
                <img src={sendIcon} alt="Send" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskMeAnythingLight;
