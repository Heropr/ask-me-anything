import { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import './AskMeAnything.css';

import aboutIcon from '../assets/icons/about.svg';
import dentistIcon from '../assets/icons/dentist.svg';
import costIcon from '../assets/icons/currency-dollar-circle.svg';
import calendarIcon from '../assets/icons/calendar-date.svg';
import policyIcon from '../assets/icons/certificate-02.svg';
import medicalIcon from '../assets/icons/medical-cross.svg';

const facts = [
  "Smirk partners with over 10,000 dentists nationwide.",
  "Members save an average of 40% on dental procedures.",
  "Smirk offers same-day appointment booking in most areas.",
  "No waiting periods for preventive care with Smirk.",
  "Smirk covers orthodontics for both children and adults.",
  "24/7 customer support is available for all Smirk members.",
];

const questions = [
  { id: 1, label: 'About Smirk', icon: aboutIcon },
  { id: 2, label: 'Find a Dentist', icon: dentistIcon },
  { id: 3, label: 'What Is The Cost For Smirk', icon: costIcon },
  { id: 4, label: 'Book an Appointment', icon: calendarIcon },
  { id: 5, label: 'Policy Details', icon: policyIcon },
  { id: 6, label: 'Medical Advice', icon: medicalIcon },
];

function AskMeAnything() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (selectedQuestion) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedQuestion]);

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setIsLoading(true);
    setAnswer('');

    // Simulate AI response - Replace this with your actual AI API call
    try {
      // Example: const response = await fetch('/api/ask', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ question: question.label })
      // });
      // const data = await response.json();
      // setAnswer(data.answer);

      // Simulated response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAnswers = {
        1: "Smirk is a modern dental insurance provider that offers comprehensive coverage for all your dental needs. We partner with thousands of dentists nationwide to ensure you get the care you deserve at affordable prices.",
        2: "You can find a dentist in our network by using our online directory. Simply enter your zip code and we'll show you all participating dentists near you, along with their ratings and availability.",
        3: "Smirk offers flexible plans starting at $19.99/month for individuals. Our plans include preventive care, basic procedures, and major dental work with varying levels of coverage. Contact us for a personalized quote.",
        4: "Booking an appointment is easy! You can schedule directly through our app, call our member services line, or visit any participating dentist's office. Most appointments can be scheduled within 48 hours.",
        5: "Your policy includes preventive care (cleanings, X-rays), basic procedures (fillings, extractions), and major procedures (crowns, root canals). Annual maximum benefits and deductibles vary by plan tier.",
        6: "For medical advice, please consult with a licensed healthcare professional. Our dental network partners can provide guidance on oral health concerns. For emergencies, please contact your local emergency services."
      };
      setAnswer(mockAnswers[question.id] || "I'm here to help! Please ask me anything about our services.");
    } catch (error) {
      setAnswer("Sorry, I couldn't generate a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ask-me-anything">
      <h2 className="ama-title">What kind of question can I help you with today?</h2>

      <div className="questions-grid">
        {questions.map((question) => (
          <button
            key={question.id}
            className={`question-button ${selectedQuestion?.id === question.id ? 'selected' : ''}`}
            onClick={() => handleQuestionClick(question)}
          >
            <img src={question.icon} alt="" className="question-icon" />
            <span className="question-label">{question.label}</span>
          </button>
        ))}
      </div>

      <div className="answer-box">
        {selectedQuestion && (
          <>
            <p className="answer-question">{selectedQuestion.label}</p>
            <div className="answer-content">
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <CircularProgress sx={{ color: '#C0FF94' }} />
                </Box>
              ) : (
                <p className="answer-text">{answer}</p>
              )}
            </div>
          </>
        )}
        {!selectedQuestion && (
          <div className="facts-container">
            <p className="fact-label">Did you know?</p>
            <p className={`fact-text ${isTransitioning ? 'exit' : 'enter'}`}>
              {facts[currentFactIndex]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AskMeAnything;
