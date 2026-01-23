import { useState, useRef, useEffect } from 'react';
import './AskMeAnythingPage.css';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';

const suggestionQuestions = [
  "What is Smirk?",
  "How do I make a claim?",
  "Are there dentists near me?",
  "What's my Smirk price?",
  "Does Smirk cover braces?",
  "How do I use my card?",
  "Can I add my family?",
  "What's the cost for a crown?",
];

const mockAnswers = {
  "What is Smirk?": "Smirk is a modern dental insurance provider offering comprehensive coverage across Texas. With plans starting at $19.99/month, Smirk makes dental care accessible and affordable for individuals and families.",
  "How do I make a claim?": "To make a claim with Smirk, simply visit an in-network dentist and present your member card. The dentist's office will file the claim directly. For out-of-network visits, submit your receipt through the Smirk member portal or app.",
  "Are there dentists near me?": "Smirk partners with over 10,000 dentists across Texas. Enter your ZIP code in your member portal to find in-network providers near you, complete with ratings and availability.",
  "What's my Smirk price?": "Smirk plans start at just $19.99/month for individuals. Family plans are available starting at $39.99/month. Your exact price depends on the coverage level you choose and your location.",
  "Does Smirk cover braces?": "Yes! Smirk offers orthodontic coverage for both children and adults. Depending on your plan, you can receive up to $2,500 in lifetime orthodontic benefits, which can be applied to traditional braces or clear aligners.",
  "How do I use my card?": "Simply present your Smirk member card at any in-network dentist. Your card contains your member ID and group number. The dentist's office will verify your coverage and bill Smirk directly for covered services.",
  "Can I add my family?": "You can add your spouse and dependent children to your Smirk plan at any time. Family members get the same great coverage and access to our entire network of dentists.",
  "What's the cost for a crown?": "Crowns typically cost between $800-$1,500 without insurance. With Smirk, crowns are usually covered at 50-60% after your deductible, meaning you could pay as little as $300-$500 out of pocket.",
};

const followUpQuestions = {
  "What is Smirk?": [
    "What dental services does Smirk cover?",
    "How do I sign up for the $19.99/month plan?",
    "Is Smirk only available in Texas?",
    "What's the difference between individual and family plans?",
    "How does Smirk make dental care more affordable?",
    "Can I keep my current dentist with Smirk?",
    "What's the claims process like?",
    "Are there any waiting periods?",
  ],
  "How do I make a claim?": [
    "What counts as an in-network dentist?",
    "How do I access the member portal?",
    "How long does reimbursement take for out-of-network visits?",
    "What documents do I need for an out-of-network claim?",
    "What if the dentist's office can't file my claim?",
    "Is there a deadline to submit out-of-network receipts?",
    "How do I download the Smirk app?",
    "What happens if my claim is denied?",
  ],
  "Are there dentists near me?": [
    "How do I find my ZIP code's in-network providers?",
    "Where can I see dentist ratings?",
    "How do I access the member portal?",
    "Are specialists included in the 10,000 dentists?",
    "What if no in-network dentists are near me?",
    "Can I check availability before booking?",
    "What parts of Texas have the most coverage?",
    "Can I use an out-of-network dentist instead?",
  ],
  "What's my Smirk price?": [
    "What's included in the $19.99/month plan?",
    "How much more does the $39.99 family plan cover?",
    "What coverage levels are available?",
    "Does my location affect pricing?",
    "Are there any deductibles or copays?",
    "Can I upgrade my plan later?",
    "Is there a discount for paying annually?",
    "What's not covered under the basic plan?",
  ],
  "Does Smirk cover braces?": [
    "How do I use the $2,500 orthodontic benefit?",
    "What clear aligner brands are covered?",
    "Is there a waiting period for orthodontic coverage?",
    "Can adults and children both use the lifetime benefit?",
    "What happens after I use the $2,500 limit?",
    "Do I need pre-approval before getting braces?",
    "Which orthodontists are in-network?",
    "Are retainers covered after braces?",
  ],
  "How do I use my card?": [
    "Where do I find my member ID and group number?",
    "What if I lose my card?",
    "Is there a digital version of my card?",
    "What does 'bill Smirk directly' mean for me?",
    "What if the dentist isn't in-network?",
    "How does the dentist verify my coverage?",
    "Do I pay anything upfront at the visit?",
    "Can my family members use the same card?",
  ],
  "Can I add my family?": [
    "How much does adding a spouse cost?",
    "What age do dependent children age out?",
    "Do family members get their own cards?",
    "Is coverage the same for all family members?",
    "How quickly does their coverage start?",
    "Can I add a domestic partner?",
    "How do I find dentists in-network for my family?",
    "Can I remove a family member later?",
  ],
  "What's the cost for a crown?": [
    "What's my deductible before the 50-60% kicks in?",
    "How do I know if I'll pay $300 or $500?",
    "Is there a waiting period for crown coverage?",
    "Do I need pre-authorization for a crown?",
    "What types of crowns are covered?",
    "Can I get a crown at any in-network dentist?",
    "What's my annual maximum for major procedures?",
    "Are temporary crowns also covered?",
  ],
};

const keywordAnswers = [
  { keywords: ["sign up", "enroll", "join", "get started", "register"], answer: "You can sign up for Smirk online at smirk.com or through the Smirk app. The process takes just a few minutes—choose your plan, enter your information, and your coverage can start as soon as the next day." },
  { keywords: ["cover", "include", "service", "what's included", "benefit"], answer: "Smirk covers preventive care like cleanings and X-rays at 100%, basic procedures such as fillings and extractions at 80%, and major work like crowns, bridges, and root canals at 50-60% after your deductible." },
  { keywords: ["cost", "price", "how much", "expensive", "pay", "afford", "fee"], answer: "Smirk plans start at $19.99/month for individuals and $39.99/month for families. Most preventive services are covered at 100%, basic procedures at 80%, and major work at 50-60% after your deductible." },
  { keywords: ["dentist", "doctor", "near", "find", "location", "network", "provider", "in-network"], answer: "Smirk partners with over 10,000 dentists across Texas. Enter your ZIP code in your member portal to find in-network providers near you, complete with ratings and availability." },
  { keywords: ["braces", "orthodon", "align", "straight", "retainer"], answer: "Smirk offers orthodontic coverage for both children and adults with up to $2,500 in lifetime benefits. This applies to traditional braces, clear aligners, and retainers after treatment." },
  { keywords: ["family", "spouse", "child", "kid", "dependent", "add member"], answer: "You can add family members at any time. Spouses, domestic partners, and dependent children up to age 26 are eligible. Each member gets their own card and full access to the Smirk network." },
  { keywords: ["card", "member id", "digital", "lost", "replace"], answer: "Your Smirk member card is available both physically and digitally through the app. If you lose your card, you can request a replacement instantly online or use the digital version on your phone." },
  { keywords: ["claim", "submit", "file", "reimburs", "receipt"], answer: "For in-network visits, claims are filed automatically by your dentist. For out-of-network visits, submit your receipt through the member portal or app. Claims are typically processed within 5-10 business days." },
  { keywords: ["wait", "period", "eligible", "start", "begin"], answer: "There are no waiting periods for preventive care. Basic procedures have a 30-day waiting period, and major procedures have a 6-month waiting period. Some plans offer reduced or waived waiting periods." },
  { keywords: ["portal", "app", "online", "account", "login", "download"], answer: "The Smirk member portal and app give you access to your digital ID card, claims history, provider search, and plan details. The app is available on both iOS and Android." },
  { keywords: ["deductible", "copay", "out-of-pocket", "maximum"], answer: "Individual deductibles start at $50/year and family deductibles at $150/year. The annual out-of-pocket maximum is $1,500 per person. Preventive care is not subject to the deductible." },
  { keywords: ["cancel", "switch", "change", "upgrade", "downgrade"], answer: "You can modify or cancel your Smirk plan at any time from your member portal. Plan upgrades take effect immediately, while downgrades apply at the start of your next billing cycle." },
  { keywords: ["emergency", "urgent", "pain", "after hours"], answer: "For dental emergencies, visit any dentist—in or out of network. Smirk provides emergency coverage 24/7 with reduced out-of-pocket costs. Emergency visits have no waiting period." },
  { keywords: ["cosmetic", "whitening", "veneer", "implant"], answer: "Basic cosmetic procedures like teeth whitening are not covered under standard plans. However, veneers and implants may be partially covered if deemed medically necessary by your dentist." },
  { keywords: ["pre-auth", "pre-approval", "authorization", "approve"], answer: "Pre-authorization is recommended for procedures over $500. Submit a request through your portal and you'll receive a response within 48 hours with your estimated coverage and out-of-pocket costs." },
  { keywords: ["annual", "maximum", "limit", "roll over", "unused"], answer: "Most Smirk plans have an annual maximum benefit of $1,500-$2,500 per person. Unfortunately, unused benefits do not roll over to the next year, so it's best to use your coverage annually." },
  { keywords: ["specialist", "referral", "oral surgeon", "endodont", "periodont"], answer: "You don't need a referral to see a specialist with Smirk. Oral surgeons, endodontists, periodontists, and orthodontists are all included in the network. Search for specialists in your member portal." },
  { keywords: ["payment", "billing", "monthly", "annual", "discount"], answer: "Smirk bills monthly by default, but you can save 10% by switching to annual billing. We accept all major credit cards, debit cards, and bank transfers. You can update payment methods anytime in your portal." },
  { keywords: ["texas", "state", "where", "available", "location"], answer: "Smirk currently operates exclusively in Texas with over 10,000 in-network dentists statewide. We cover all major cities and most rural areas. We're planning expansion to neighboring states soon." },
  { keywords: ["document", "paperwork", "information", "need", "require"], answer: "To sign up, you'll need a valid ID, your address in Texas, and a payment method. For claims, keep your receipts and any treatment documentation. Your dentist's office handles most paperwork for in-network visits." },
  { keywords: ["different", "compare", "vs", "better", "unique"], answer: "Smirk stands out with no waiting periods on preventive care, a large Texas network of 10,000+ dentists, an easy-to-use app, and transparent pricing starting at $19.99/month with no hidden fees." },
  { keywords: ["newborn", "baby", "infant", "birth"], answer: "Newborns are covered automatically for the first 30 days after birth under the parent's plan. After that, you'll need to officially add them as a dependent, which you can do through your member portal." },
  { keywords: ["travel", "out of state", "vacation", "moving"], answer: "Smirk coverage is primarily for Texas residents. If you need dental care while traveling, emergency services are covered out-of-network. If you're moving out of Texas, you'll need to find a new plan." },
  { keywords: ["secure", "privacy", "data", "information", "safe"], answer: "Smirk uses bank-level encryption to protect your personal and health information. We're fully HIPAA compliant and never share your data with third parties without your consent." },
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

const keywordFollowUps = [
  { keywords: ["deadline", "late", "time", "when"], questions: [
    "What happens if I miss the deadline?",
    "Can I still submit a late request?",
    "How do I know the exact deadline?",
    "Is the deadline different for in-network vs. out-of-network?",
    "Do emergency visits have a different deadline?",
    "Can I edit my submission after it's sent?",
    "What if my dentist sends it late?",
    "Do I need to keep my receipts until it's processed?",
    "Can I set reminders so I don't miss the deadline?",
  ]},
  { keywords: ["cost", "price", "pay", "afford", "expensive", "much"], questions: [
    "Are there payment plans available?",
    "What's my annual out-of-pocket maximum?",
    "Do costs vary by dentist location?",
    "Are there any hidden fees I should know about?",
    "How do deductibles work with Smirk?",
    "Can I estimate my costs before a visit?",
    "What if I can't afford my portion?",
    "Does Smirk offer any financial assistance?",
  ]},
  { keywords: ["network", "in-network", "out-of-network", "dentist", "provider"], questions: [
    "How do I verify if my dentist is in-network?",
    "What's the cost difference for out-of-network visits?",
    "Can I switch to an in-network dentist anytime?",
    "How large is the Smirk network?",
    "Are specialists considered in-network?",
    "What if I'm traveling and need a dentist?",
    "How often does the network change?",
    "Can I request a dentist be added to the network?",
  ]},
  { keywords: ["portal", "app", "online", "account", "login", "access"], questions: [
    "How do I create my member account?",
    "What can I do in the member portal?",
    "Is the app available on iOS and Android?",
    "How do I reset my password?",
    "Can I view my claims history online?",
    "Is my information secure in the portal?",
    "Can I manage my family's accounts too?",
    "How do I update my contact information?",
  ]},
  { keywords: ["wait", "period", "start", "begin", "eligible"], questions: [
    "How long is the waiting period?",
    "Does the waiting period apply to all services?",
    "Can I get preventive care during the waiting period?",
    "Is there a way to waive the waiting period?",
    "When does my coverage officially start?",
    "What counts toward the waiting period?",
    "Are there plans without waiting periods?",
    "Can I use another insurance during the wait?",
  ]},
  { keywords: ["family", "spouse", "child", "dependent", "add", "member"], questions: [
    "What counts as a dependent?",
    "Can stepchildren be added?",
    "Is there a maximum number of family members?",
    "Do family members share the same deductible?",
    "Can each family member choose their own dentist?",
    "What if a family member moves out of state?",
    "How do I update family member information?",
    "Are newborns automatically covered?",
  ]},
  { keywords: ["cover", "benefit", "include", "eligible", "plan"], questions: [
    "What services are not covered?",
    "Are cosmetic procedures covered?",
    "How do I check if a procedure is covered?",
    "What's my annual maximum benefit?",
    "Do unused benefits roll over?",
    "Can I upgrade my coverage level?",
    "Are second opinions covered?",
    "Does coverage vary by procedure type?",
  ]},
  { keywords: ["claim", "submit", "file", "reimburs", "receipt"], questions: [
    "How long does claim processing take?",
    "Can I check my claim status online?",
    "What if my claim is partially denied?",
    "Do I need to submit claims for in-network visits?",
    "What format should receipts be in?",
    "Can I appeal a denied claim?",
    "Is there a limit on claims per year?",
    "How do I get an explanation of benefits?",
  ]},
  { keywords: ["card", "id", "number", "digital", "lost", "replace"], questions: [
    "How quickly can I get a replacement card?",
    "Can I use my phone to show my card?",
    "What information is on my card?",
    "Do I need my card for every visit?",
    "Can I print a temporary card?",
    "How do I activate my new card?",
    "Is my card linked to my account?",
    "What should I do if my card is stolen?",
  ]},
];

function getFollowUps(question) {
  if (followUpQuestions[question]) return followUpQuestions[question];

  const lower = question.toLowerCase();
  for (const entry of keywordFollowUps) {
    if (entry.keywords.some(keyword => lower.includes(keyword))) {
      return entry.questions;
    }
  }

  return [
    "Can you tell me more about this?",
    "How does this affect my coverage?",
    "What are my other options?",
    "Who can I contact for help?",
    "Is there a waiting period for this?",
    "How do I get started?",
    "What documents do I need?",
    "Can I make changes later?",
  ];
}

function AskMeAnythingPage() {
  const [conversation, setConversation] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [streamingIndex, setStreamingIndex] = useState(null);
  const [displayedWords, setDisplayedWords] = useState(0);
  const activeEntryRef = useRef(null);
  const conversationRef = useRef(null);
  const streamInterval = useRef(null);

  const handleRestart = () => {
    setConversation([]);
    setActiveIndex(0);
    setStreamingIndex(null);
    setDisplayedWords(0);
    if (streamInterval.current) clearInterval(streamInterval.current);
  };

  const handleQuestionClick = (question) => {
    const answer = getAnswer(question);
    setConversation(prev => {
      const next = [...prev, { question, answer }];
      const newIndex = next.length - 1;
      setActiveIndex(newIndex);
      setStreamingIndex(newIndex);
      setDisplayedWords(0);
      return next;
    });
  };

  useEffect(() => {
    if (streamingIndex === null) return;
    const entry = conversation[streamingIndex];
    if (!entry) return;

    const words = entry.answer.split(' ');
    let current = 0;

    if (streamInterval.current) clearInterval(streamInterval.current);

    streamInterval.current = setInterval(() => {
      current++;
      if (current >= words.length) {
        clearInterval(streamInterval.current);
        setStreamingIndex(null);
        setDisplayedWords(0);
      } else {
        setDisplayedWords(current);
      }
    }, 50);

    return () => {
      if (streamInterval.current) clearInterval(streamInterval.current);
    };
  }, [streamingIndex]);

  const handleEntryClick = (index) => {
    setConversation(prev => prev.slice(0, index + 1));
    setActiveIndex(index);
  };

  useEffect(() => {
    if (activeEntryRef.current && conversationRef.current) {
      const container = conversationRef.current;
      const entry = activeEntryRef.current;
      const containerHeight = container.clientHeight;
      const entryTop = entry.offsetTop;
      const entryHeight = entry.offsetHeight;
      const scrollTarget = entryTop - (containerHeight / 2) + (entryHeight / 2);

      // Update top/bottom padding to allow centering any entry
      const topPad = containerHeight / 2 - entryHeight / 2;
      container.style.paddingTop = `${Math.max(topPad, 0)}px`;
      container.style.paddingBottom = `${Math.max(topPad, 0)}px`;

      setTimeout(() => {
        const newEntryTop = entry.offsetTop;
        const newScrollTarget = newEntryTop - (containerHeight / 2) + (entryHeight / 2);
        container.scrollTo({ top: newScrollTarget, behavior: 'smooth' });
      }, 10);
    }
  }, [conversation, activeIndex]);

  const hasConversation = conversation.length > 0;
  const activeQuestion = hasConversation ? conversation[activeIndex]?.question : null;

  return (
    <div className="ama-page">
      <div className="ama-page-header">
        <h1 className="ama-page-title">
          Ask Me <em>Anything</em>
        </h1>
        <p className="ama-page-subtitle">
          Ask Ailene anything you'd like to know about Smirk
        </p>
      </div>

      <div className="ama-page-card">
        <div className="ama-page-main">
          {!hasConversation && (
            <div className="ama-page-prompt">
              <h2 className="ama-page-prompt-text">What can I help you with?</h2>
              <div className="ama-page-chips">
                {suggestionQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="ama-page-chip"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasConversation && (
            <div className="ama-page-conversation" ref={conversationRef}>
              {conversation.map((entry, index) => (
                <div
                  key={index}
                  className={`ama-page-conversation-entry ${index === activeIndex ? 'active' : ''}`}
                  ref={index === activeIndex ? activeEntryRef : null}
                  onClick={() => handleEntryClick(index)}
                >
                  <div className="ama-page-question-group">
                    <div className="ama-page-question-label">Question {index + 1}</div>
                    <div className="ama-page-question-bubble">{entry.question}</div>
                  </div>
                  <div className="ama-page-answer">
                    {index === streamingIndex
                      ? entry.answer.split(' ').slice(0, displayedWords).join(' ')
                      : entry.answer
                    }
                    {index === streamingIndex && <span className="ama-page-cursor" />}
                  </div>
                  <div className="ama-page-separator" />
                </div>
              ))}
            </div>
          )}

          {hasConversation && (
            <button className="ama-page-restart-btn" onClick={handleRestart}>
              <img src={refreshCwIcon} alt="" />
              <span>Restart conversation</span>
            </button>
          )}
        </div>

        <div className="ama-page-sidebar">
          <div className="ama-page-sidebar-header">
            <h3 className="ama-page-sidebar-title">Suggested questions</h3>
          </div>
          {hasConversation && (
            <div className="ama-page-sidebar-questions" key={activeIndex}>
              {streamingIndex !== null ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="ama-page-followup-skeleton">
                    <div className="ama-page-skeleton-line" />
                    {index % 2 === 0 && <div className="ama-page-skeleton-line short" />}
                  </div>
                ))
              ) : (
                getFollowUps(activeQuestion).map((question, index) => (
                  <button
                    key={index}
                    className="ama-page-followup-btn"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AskMeAnythingPage;
