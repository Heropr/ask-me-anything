import { useState, useRef, useEffect } from 'react';
import './AskMeAnythingV4.css';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import aboutIcon from '../assets/icons/about.svg';
import dentistIcon from '../assets/icons/dentist.svg';
import costIcon from '../assets/icons/currency-dollar-circle.svg';
import calendarIcon from '../assets/icons/calendar-date.svg';
import policyIcon from '../assets/icons/certificate-02.svg';
import medicalIcon from '../assets/icons/medical-cross.svg';

const SIDEBAR_UPDATE_DELAY = 500;
const SIDEBAR_ANIMATION_DURATION = 350;
const COMPOSER_REVEAL_DELAY = SIDEBAR_ANIMATION_DURATION + 100; // After sidebar finishes animating

const dentists = [
  { id: 1, name: "Dr. Sarah Chen", distance: "0.8 mi", rating: 4.9, nextSlot: "Today 2:00 PM", address: "123 Main St, Austin TX" },
  { id: 2, name: "Dr. Michael Rodriguez", distance: "1.2 mi", rating: 4.7, nextSlot: "Today 4:30 PM", address: "456 Oak Ave, Austin TX" },
  { id: 3, name: "Dr. Emily Watson", distance: "2.1 mi", rating: 4.8, nextSlot: "Tomorrow 9:00 AM", address: "789 Elm Blvd, Austin TX" },
];

// Explore mode questions - mix of informational and tasks
const exploreQuestions = {
  initial: [
    { text: "What does Smirk cover?", isTask: false },
    { text: "How much does Smirk cost?", isTask: false },
    { text: "Book an appointment", isTask: true },
    { text: "Does Smirk cover braces?", isTask: false },
    { text: "File a claim", isTask: true },
    { text: "Can I add my family?", isTask: true },
    { text: "What's the deductible?", isTask: false },
    { text: "How do I use my card?", isTask: false },
  ],
  coverage: [
    { text: "What preventive care is covered?", isTask: false },
    { text: "Are crowns and root canals covered?", isTask: false },
    { text: "Does Smirk cover braces?", isTask: false },
    { text: "Book an appointment", isTask: true },
    { text: "Are there waiting periods?", isTask: false },
    { text: "What's my annual maximum?", isTask: false },
    { text: "Is emergency care covered?", isTask: false },
    { text: "File a claim", isTask: true },
  ],
  cost: [
    { text: "What's the monthly premium?", isTask: false },
    { text: "How much for a family plan?", isTask: false },
    { text: "What's my deductible?", isTask: false },
    { text: "Book an appointment", isTask: true },
    { text: "Are there copays?", isTask: false },
    { text: "What does a cleaning cost me?", isTask: false },
    { text: "How much for a crown?", isTask: false },
    { text: "Add a family member", isTask: true },
  ],
};

// Task mode contextual questions - sparse, focused on current step
const taskQuestions = {
  booking: {
    reason: [
      "What counts as a dental emergency?",
      "Can I see a specialist directly?",
      "What's covered in a routine visit?",
    ],
    severity: [
      "Should I go to urgent care instead?",
      "Is emergency care covered?",
      "How quickly can I be seen?",
    ],
    dentists: [
      "How do I know they're in-network?",
      "Can I see ratings and reviews?",
      "What if I want a different time?",
    ],
    confirm: [
      "Can I reschedule if needed?",
      "What should I bring?",
      "How early should I arrive?",
    ],
  },
  claim: {
    method: [
      "What info do I need from my receipt?",
      "How long do I have to submit?",
      "What file formats work?",
    ],
    processing: [
      "How long until I hear back?",
      "How do I check claim status?",
      "What if it's denied?",
    ],
  },
  family: {
    form: [
      "Who counts as a dependent?",
      "What's the age limit for children?",
      "How much does it cost to add someone?",
    ],
    processing: [
      "How long until they're covered?",
      "Do they get their own card?",
      "Do they have the same benefits?",
    ],
  },
};

// Actions that unlock after completing tasks
const unlockedActions = {
  booking: [
    { text: "Reschedule appointment", isTask: true },
    { text: "Cancel appointment", isTask: true },
  ],
  claim: [
    { text: "Check claim status", isTask: true },
  ],
  family: [
    { text: "View family member's card", isTask: true },
    { text: "Remove family member", isTask: true },
  ],
};

const exploreAnswers = {
  "What does Smirk cover?": "Smirk covers preventive care at 100%, basic procedures at 80%, and major work at 50-60%. This includes cleanings, fillings, crowns, root canals, and more.",
  "How much does Smirk cost?": "Plans start at $19.99/month for individuals and $39.99/month for families. Your exact price depends on coverage level.",
  "Are there dentists near me?": "Smirk partners with over 10,000 dentists across Texas. Enter your ZIP in the member portal to find in-network providers.",
  "How do I make a claim?": "For in-network visits, claims are filed automatically. For out-of-network, submit your receipt through the portal or app.",
  "Does Smirk cover braces?": "Yes! Up to $2,500 in lifetime orthodontic benefits for both children and adults, covering braces and clear aligners.",
  "Can I add my family?": "You can add your spouse and dependent children at any time. Family members get the same coverage and network access.",
  "What's the deductible?": "Individual deductibles start at $50/year, family at $150/year. Preventive care is not subject to the deductible.",
  "How do I use my card?": "Present your member card at any in-network dentist. They'll verify coverage and bill Smirk directly.",
  "What preventive care is covered?": "Two cleanings per year, annual X-rays, and one exam—all at 100% with no waiting period.",
  "Are crowns and root canals covered?": "Yes, major procedures are covered at 50-60% after your deductible, with a 6-month waiting period.",
  "What's not covered?": "Cosmetic procedures like whitening aren't covered. Implants may be partially covered if medically necessary.",
  "Are there waiting periods?": "No wait for preventive care. 30 days for basic procedures, 6 months for major work.",
  "What's my annual maximum?": "Most plans have a $1,500-$2,500 annual maximum per person. Unused benefits don't roll over.",
  "Is emergency care covered?": "Yes, emergency care is covered 24/7 with no waiting period, even out-of-network.",
  "What about cosmetic procedures?": "Basic cosmetic procedures aren't covered. Veneers and implants may be partially covered if medically necessary.",
  "What's the monthly premium?": "Individual plans start at $19.99/month. Enhanced coverage is $29.99/month with lower deductibles.",
  "How much for a family plan?": "Family plans start at $39.99/month, covering you, spouse, and children up to age 26.",
  "What's the out-of-pocket max?": "Your annual out-of-pocket maximum is $1,500 per person.",
  "Are there copays?": "Preventive visits have no copay. Other services have copays based on your plan and procedure type.",
  "Is there an annual discount?": "Yes! Save 10% by switching to annual billing instead of monthly.",
  "What does a cleaning cost me?": "Cleanings are covered at 100% for preventive visits—$0 out of pocket at in-network dentists.",
  "How much for a crown?": "Crowns are covered at 50-60% after deductible. You'd typically pay $300-$500 out of pocket.",
};

// Compute follow-ups with stability tracking
function computeFollowUpsWithState(previousList, newList) {
  const previousSet = new Set((previousList || []).map(item => typeof item === 'string' ? item : item.text));
  const result = [];
  for (const item of newList) {
    const text = typeof item === 'string' ? item : item.text;
    const isTask = typeof item === 'object' ? item.isTask : false;
    result.push({
      text,
      isTask,
      isStable: previousSet.has(text),
      isNew: !previousSet.has(text),
    });
  }
  return result;
}

const getTaskIcon = (text) => {
  const value = text.toLowerCase();

  if (value.includes('appointment') || value.includes('reschedule') || value.includes('cancel')) {
    return calendarIcon;
  }

  if (value.includes('claim') || value.includes('status')) {
    return policyIcon;
  }

  if (value.includes('family') || value.includes('dependent') || value.includes('member')) {
    return medicalIcon;
  }

  if (value.includes('dentist')) {
    return dentistIcon;
  }

  if (value.includes('cost') || value.includes('price') || value.includes('premium')) {
    return costIcon;
  }

  return aboutIcon;
};

function AskMeAnythingV5() {
  const [mode, setMode] = useState('explore'); // 'explore' or 'task'
  const [conversation, setConversation] = useState([]);
  const [currentTopic, setCurrentTopic] = useState('initial');
  const [taskState, setTaskState] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [activeEntry, setActiveEntry] = useState(0);

  // Streaming state
  const [streamingIndex, setStreamingIndex] = useState(null);
  const [displayedWords, setDisplayedWords] = useState(0);
  const streamInterval = useRef(null);
  const followUpDelayTimer = useRef(null);
  const composerDelayTimer = useRef(null);

  // Sidebar state
  const [askedQuestion, setAskedQuestion] = useState(null);
  const [previousFollowUps, setPreviousFollowUps] = useState(null);
  const [currentFollowUps, setCurrentFollowUps] = useState([]);

  // Paused task state (for returning to task after asking a question)
  const [pausedTask, setPausedTask] = useState(null);

  // Track completed tasks to unlock new actions
  const [completedTasks, setCompletedTasks] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarRevealDone, setSidebarRevealDone] = useState(false);
  const [sidebarLockedClosed, setSidebarLockedClosed] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const convRef = useRef(null);
  const activeRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (activeRef.current && convRef.current) {
      const container = convRef.current;
      const entry = activeRef.current;
      const containerHeight = container.clientHeight;
      const entryHeight = entry.offsetHeight;

      // Add padding to allow centering any entry
      const topPad = containerHeight / 2 - entryHeight / 2;
      container.style.paddingTop = `${Math.max(topPad, 40)}px`;
      container.style.paddingBottom = `${Math.max(topPad, 40)}px`;

      setTimeout(() => {
        const entryTop = entry.offsetTop;
        container.scrollTo({
          top: entryTop - containerHeight / 2 + entryHeight / 2,
          behavior: 'smooth'
        });
      }, 10);
    }
  }, [conversation, activeEntry, displayedWords]);

  // Streaming effect for answers
  useEffect(() => {
    if (streamingIndex === null) return;
    const entry = conversation[streamingIndex];
    if (!entry || entry.type !== 'qa') return;

    const words = entry.answer.split(' ');
    let current = 0;

    if (followUpDelayTimer.current) {
      clearTimeout(followUpDelayTimer.current);
      followUpDelayTimer.current = null;
    }
    if (composerDelayTimer.current) {
      clearTimeout(composerDelayTimer.current);
      composerDelayTimer.current = null;
    }
    setShowComposer(false);

    if (streamInterval.current) clearInterval(streamInterval.current);

    streamInterval.current = setInterval(() => {
      current++;
      if (current >= words.length) {
        clearInterval(streamInterval.current);
        setStreamingIndex(null);
        setDisplayedWords(0);

        // Compute new follow-ups with stability tracking
        const newFollowUps = getSidebarQuestions();
        const followUpsWithState = computeFollowUpsWithState(previousFollowUps, newFollowUps);
        if (followUpDelayTimer.current) clearTimeout(followUpDelayTimer.current);
        followUpDelayTimer.current = setTimeout(() => {
          setCurrentFollowUps(followUpsWithState);
          setPreviousFollowUps(null);
          if (composerDelayTimer.current) clearTimeout(composerDelayTimer.current);
          composerDelayTimer.current = setTimeout(() => {
            setShowComposer(true);
          }, COMPOSER_REVEAL_DELAY);
        }, SIDEBAR_UPDATE_DELAY);
      } else {
        setDisplayedWords(current);
      }
    }, 32); // 70% faster than original 105ms

    return () => {
      if (streamInterval.current) clearInterval(streamInterval.current);
    };
  }, [streamingIndex, previousFollowUps]);

  useEffect(() => {
    if (streamingIndex !== null) {
      if (followUpDelayTimer.current) {
        clearTimeout(followUpDelayTimer.current);
        followUpDelayTimer.current = null;
      }
      if (composerDelayTimer.current) {
        clearTimeout(composerDelayTimer.current);
        composerDelayTimer.current = null;
      }
      setShowComposer(false);
    }
  }, [streamingIndex]);

  useEffect(() => {
    // No conversation yet - don't show sidebar
    if (!conversation.length) {
      setShowSidebar(false);
      setSidebarRevealDone(false);
      return;
    }
    // User manually closed sidebar - respect that
    if (sidebarLockedClosed) {
      setShowSidebar(false);
      setSidebarRevealDone(false);
      return;
    }
    // Check if there are any questions to show (either follow-ups or sidebar questions)
    const sidebarQs = getSidebarQuestions();
    const hasQuestions = currentFollowUps.length > 0 || sidebarQs.length > 0;

    // No questions to show - collapse sidebar
    if (!hasQuestions && showSidebar) {
      setShowSidebar(false);
      setSidebarRevealDone(false);
      return;
    }
    if (!hasQuestions) return;
    // Already showing - keep it visible (don't hide during streaming)
    if (showSidebar) return;
    // First time showing - wait for streaming to complete, then reveal
    if (streamingIndex !== null) return;
    const timer = setTimeout(() => setShowSidebar(true), SIDEBAR_UPDATE_DELAY);
    return () => clearTimeout(timer);
  }, [conversation.length, streamingIndex, showSidebar, sidebarLockedClosed, currentFollowUps, mode, taskState, currentTopic, completedTasks]);

  useEffect(() => {
    if (!showSidebar) {
      setSidebarRevealDone(false);
      return;
    }
    setSidebarRevealDone(false);
    const timer = setTimeout(() => setSidebarRevealDone(true), 360);
    return () => clearTimeout(timer);
  }, [showSidebar]);

  const addEntry = (entry) => {
    setConversation(prev => {
      const next = [...prev, { ...entry, id: Date.now() }];
      setActiveEntry(next.length - 1);
      return next;
    });
  };

  // Get current sidebar questions
  const getSidebarQuestions = () => {
    if (mode === 'task' && taskState) {
      // If task is done, show unlocked actions for this task type
      if (taskState.step === 'done') {
        const actions = unlockedActions[taskState.type] || [];
        const stepQuestions = taskQuestions[taskState.type]?.confirm || taskQuestions[taskState.type]?.processing || [];
        return [
          ...actions,
          ...stepQuestions.map(q => ({ text: q, isTask: false }))
        ];
      }
      const stepQuestions = taskQuestions[taskState.type]?.[taskState.step];
      // Task questions are plain strings
      return (stepQuestions || taskQuestions[taskState.type]?.form || []).map(q => ({ text: q, isTask: false }));
    }
    // Explore questions are objects with text and isTask
    const baseQuestions = exploreQuestions[currentTopic] || exploreQuestions.initial;

    // Add unlocked actions based on completed tasks
    const newActions = completedTasks.flatMap(taskType => unlockedActions[taskType] || []);

    if (newActions.length > 0) {
      // Insert unlocked actions after the first few questions, before other tasks
      const questions = baseQuestions.filter(q => !q.isTask).slice(0, 3);
      const tasks = baseQuestions.filter(q => q.isTask);
      return [...questions, ...newActions, ...tasks].slice(0, 8);
    }

    return baseQuestions;
  };

  // Handle explore question
  const handleExploreQuestion = (question) => {
    // Don't reload if clicking the same question that's already selected
    if (question === askedQuestion) {
      return;
    }

    // Check if it's a task trigger
    if (question.includes("add my family")) {
      startTask('family');
      return;
    }
    if (question.includes("make a claim")) {
      startTask('claim');
      return;
    }
    if (question.includes("dentists near me")) {
      startTask('booking');
      return;
    }

    // Check if this question was already asked - if so, scroll to it
    const existingIndex = conversation.findIndex(
      entry => entry.type === 'qa' && entry.question === question
    );
    if (existingIndex !== -1) {
      setAskedQuestion(question);
      setActiveEntry(existingIndex);
      return;
    }

    // Set the pinned question
    setAskedQuestion(question);

    // Save current follow-ups before transitioning (for stability comparison)
    const prevFollowUps = currentFollowUps.length > 0
      ? currentFollowUps
      : getSidebarQuestions();
    setPreviousFollowUps(prevFollowUps);

    const answer = exploreAnswers[question] || "I can help you with that. What specific information do you need?";

    // Update topic for sidebar
    if (question.toLowerCase().includes('cover') || question.toLowerCase().includes('waiting')) {
      setCurrentTopic('coverage');
    } else if (question.toLowerCase().includes('cost') || question.toLowerCase().includes('price') || question.toLowerCase().includes('deductible')) {
      setCurrentTopic('cost');
    }

    // Add entry and start streaming
    setConversation(prev => {
      const next = [...prev, { type: 'qa', question, answer, id: Date.now() }];
      const newIndex = next.length - 1;
      setActiveEntry(newIndex);
      setStreamingIndex(newIndex);
      setDisplayedWords(0);
      return next;
    });
  };

  // Handle sidebar question click (works in both modes)
  const handleSidebarQuestion = (item) => {
    // Close mobile menu when a question is selected
    setMobileMenuOpen(false);

    // Don't reload if clicking the same question that's already selected
    if (item.text === askedQuestion) {
      return;
    }

    if (item.isTask) {
      // Task triggers - check unlocked actions first
      const text = item.text.toLowerCase();
      if (text.includes('reschedule')) {
        startUnlockedTask('reschedule', 'Reschedule appointment');
      } else if (text.includes('cancel appointment')) {
        startUnlockedTask('cancel', 'Cancel appointment');
      } else if (text.includes('check claim') || text.includes('claim status')) {
        startUnlockedTask('claimStatus', 'Check claim status');
      } else if (text.includes('view family') || text.includes("member's card")) {
        startUnlockedTask('viewCard', "View family member's card");
      } else if (text.includes('remove family')) {
        startUnlockedTask('removeFamily', 'Remove family member');
      } else if (text.includes('book')) {
        startTask('booking');
      } else if (text.includes('claim')) {
        startTask('claim');
      } else if (text.includes('family') || text.includes('add')) {
        startTask('family');
      }
      return;
    }

    if (mode === 'task') {
      // Check if this question was already asked - if so, scroll to it
      const existingIndex = conversation.findIndex(
        entry => entry.type === 'qa' && entry.question === item.text && entry.isTaskClarification
      );
      if (existingIndex !== -1) {
        setActiveEntry(existingIndex);
        return;
      }

      // In task mode, sidebar questions are informational - stay in task mode
      const answer = getTaskQuestionAnswer(item.text);
      addEntry({ type: 'qa', question: item.text, answer, isTaskClarification: true });
    } else {
      handleExploreQuestion(item.text);
    }
  };

  // Resume a paused task
  const resumeTask = () => {
    if (!pausedTask) return;

    setMode('task');
    setTaskState({
      type: pausedTask.type,
      step: pausedTask.step,
      data: pausedTask.data,
    });
    setAskedQuestion(taskDisplayNames[pausedTask.type]);
    updateTaskFollowUps(pausedTask.type, pausedTask.step);
    setPausedTask(null);
  };

  // Handle click on pinned asked question/task - scroll back to it
  const handleAskedClick = () => {
    if (mode === 'task') {
      // Find the last task-card entry that's interactive (choices, dentists, form, or confirmation)
      for (let i = conversation.length - 1; i >= 0; i--) {
        const entry = conversation[i];
        if (entry.type === 'task-card' && entry.cardType !== 'progress') {
          // Just scroll to it, don't truncate - user can see clarification questions below
          setActiveEntry(i);
          return;
        }
      }
    } else {
      // Find the entry with the matching question
      for (let i = conversation.length - 1; i >= 0; i--) {
        const entry = conversation[i];
        if (entry.type === 'qa' && entry.question === askedQuestion) {
          handleEntryClick(i);
          return;
        }
      }
    }
  };

  const getTaskQuestionAnswer = (question) => {
    // Simple answers for task clarification questions
    const answers = {
      "What counts as a dental emergency?": "Severe pain, swelling, knocked-out teeth, or broken teeth that cause pain are dental emergencies.",
      "Should I go to urgent care instead?": "For dental issues, a dentist is usually better equipped. But if you have severe swelling affecting breathing, go to the ER.",
      "How do I know they're in-network?": "All dentists shown here are in-network. You can also verify any dentist in your member portal.",
      "Can I reschedule if needed?": "Yes, you can reschedule up to 24 hours before your appointment at no charge.",
      "What info do I need from my receipt?": "Provider name, date of service, procedure codes, and amount paid. A clear photo usually captures all of this.",
      "Who counts as a dependent?": "Spouse, domestic partner, and children up to age 26 (or any age if disabled).",
    };
    return answers[question] || "That's a great question. The short answer is yes—Smirk is designed to be flexible. Want me to explain more?";
  };

  // Task display names for the "Asked" anchor
  const taskDisplayNames = {
    booking: 'Book an appointment',
    claim: 'File a claim',
    family: 'Add a family member',
  };

  // Update sidebar for task step
  const updateTaskFollowUps = (taskType, step, includeUnlocked = false) => {
    const questions = taskQuestions[taskType]?.[step] || [];
    const questionItems = questions.map(q => ({ text: q, isTask: false, isStable: false, isNew: true }));

    if (includeUnlocked) {
      // Add unlocked actions at the top when task is complete
      const actions = (unlockedActions[taskType] || []).map(a => ({ ...a, isStable: false, isNew: true }));
      setCurrentFollowUps([...actions, ...questionItems]);
    } else {
      setCurrentFollowUps(questionItems);
    }
  };

  // Start an unlocked task (follow-up actions)
  const startUnlockedTask = (actionId, displayName) => {
    setMode('task');
    setAskedQuestion(displayName);
    setCurrentFollowUps([]);

    if (actionId === 'reschedule') {
      setTaskState({ type: 'reschedule', step: 'confirm', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'choices',
        prompt: "When would you like to reschedule to?",
        choices: [
          { id: 'tomorrow', label: 'Tomorrow morning', icon: '🌅' },
          { id: 'thisWeek', label: 'Later this week', icon: '📅' },
          { id: 'nextWeek', label: 'Next week', icon: '📆' },
        ]
      });
    } else if (actionId === 'cancel') {
      setTaskState({ type: 'cancel', step: 'confirm', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'choices',
        prompt: "Are you sure you want to cancel your appointment?",
        choices: [
          { id: 'yes', label: 'Yes, cancel it', icon: '❌' },
          { id: 'no', label: 'No, keep it', icon: '✓' },
        ]
      });
    } else if (actionId === 'claimStatus') {
      setTaskState({ type: 'claimStatus', step: 'view', data: {} });
      runAgent([
        { label: 'Looking up claim...', detail: 'Finding records' },
        { label: 'Fetching status...', detail: 'Processing' },
      ], () => {
        setTaskState(p => ({ ...p, step: 'done' }));
        addEntry({
          type: 'task-card',
          cardType: 'confirmation',
          title: "Claim Status",
          details: [
            { label: 'Claim ID', value: 'CLM-XK72M9' },
            { label: 'Status', value: 'Approved' },
            { label: 'Amount', value: '$185.00' },
            { label: 'Payment', value: 'Sent to your bank' },
          ],
          actions: [{ id: 'details', label: 'View details' }]
        });
      });
    } else if (actionId === 'viewCard') {
      setTaskState({ type: 'viewCard', step: 'view', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'confirmation',
        title: "Family Member Card",
        subtitle: "Jane Doe",
        details: [
          { label: 'Member ID', value: 'SMK-7X92KL' },
          { label: 'Group', value: 'FAM-2024' },
          { label: 'Coverage', value: 'Active' },
        ],
        actions: [{ id: 'download', label: '📥 Download card' }]
      });
    } else if (actionId === 'removeFamily') {
      setTaskState({ type: 'removeFamily', step: 'confirm', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'choices',
        prompt: "Which family member would you like to remove?",
        choices: [
          { id: 'jane', label: 'Jane Doe (Spouse)', icon: '👤' },
          { id: 'tom', label: 'Tom Doe (Child)', icon: '👦' },
        ]
      });
    }
  };

  // Start a task
  const startTask = (taskId) => {
    setMode('task');

    // Set the task name as the "Asked" anchor
    setAskedQuestion(taskDisplayNames[taskId]);

    // Set initial task follow-ups
    const initialStep = taskId === 'booking' ? 'reason' : taskId === 'claim' ? 'method' : 'form';
    const questions = taskQuestions[taskId]?.[initialStep] || [];
    setCurrentFollowUps(questions.map(q => ({ text: q, isTask: false, isStable: false, isNew: true })));

    if (taskId === 'booking') {
      setTaskState({ type: 'booking', step: 'reason', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'choices',
        prompt: "What brings you in today?",
        choices: [
          { id: 'routine', label: 'Routine cleaning', icon: '🦷' },
          { id: 'pain', label: 'Pain or discomfort', icon: '😣' },
          { id: 'procedure', label: 'Specific procedure', icon: '📋' },
        ]
      });
    } else if (taskId === 'claim') {
      setTaskState({ type: 'claim', step: 'method', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'choices',
        prompt: "How would you like to submit your claim?",
        choices: [
          { id: 'photo', label: 'Take a photo', icon: '📷' },
          { id: 'upload', label: 'Upload file', icon: '📄' },
        ]
      });
    } else if (taskId === 'family') {
      setTaskState({ type: 'family', step: 'form', data: {} });
      addEntry({
        type: 'task-card',
        cardType: 'form',
        prompt: "Who would you like to add to your plan?",
        fields: [
          { id: 'name', label: 'Full name', placeholder: 'Jane Doe' },
          { id: 'relationship', label: 'Relationship', type: 'select', options: ['Spouse', 'Child', 'Domestic Partner'] },
          { id: 'dob', label: 'Date of birth', placeholder: 'MM/DD/YYYY' },
        ]
      });
    }
  };

  const handleChoice = (choice) => {
    if (taskState.type === 'booking') {
      if (taskState.step === 'reason') {
        const nextStep = choice.id === 'pain' ? 'severity' : 'dentists';
        setTaskState(p => ({ ...p, step: nextStep, data: { ...p.data, reason: choice.label } }));
        updateTaskFollowUps('booking', nextStep);
        if (choice.id === 'pain') {
          addEntry({
            type: 'task-card',
            cardType: 'choices',
            prompt: "How severe is the pain?",
            choices: [
              { id: 'mild', label: 'Mild discomfort', icon: '😐' },
              { id: 'moderate', label: 'Significant pain', icon: '😟' },
              { id: 'severe', label: "Can't eat or sleep", icon: '😫' },
            ]
          });
        } else {
          showDentists();
        }
      } else if (taskState.step === 'severity') {
        setTaskState(p => ({ ...p, step: 'dentists', data: { ...p.data, severity: choice.label } }));
        updateTaskFollowUps('booking', 'dentists');
        showDentists(choice.id === 'severe');
      }
    } else if (taskState.type === 'claim') {
      setTaskState(p => ({ ...p, step: 'processing', data: { ...p.data, method: choice.label } }));
      updateTaskFollowUps('claim', 'processing');
      runAgent([
        { label: 'Processing receipt...', detail: 'Reading document' },
        { label: 'Extracting info...', detail: 'Provider, date, amount' },
        { label: 'Submitting...', detail: 'To Smirk claims' },
      ], () => {
        setTaskState(p => ({ ...p, step: 'done' }));
        setCompletedTasks(prev => prev.includes('claim') ? prev : [...prev, 'claim']);
        updateTaskFollowUps('claim', 'processing', true); // Include unlocked actions
        addEntry({
          type: 'task-card',
          cardType: 'confirmation',
          title: "Claim Submitted ✓",
          details: [
            { label: 'Claim ID', value: 'CLM-' + Math.random().toString(36).substr(2, 6).toUpperCase() },
            { label: 'Amount', value: '$185.00' },
            { label: 'Status', value: 'Processing (5-7 days)' },
          ],
          actions: [{ id: 'track', label: 'Track status' }, { id: 'another', label: 'File another' }],
          nextSteps: [
            { text: "What if it's denied?", isTask: false },
            { text: "Book an appointment", isTask: true },
          ]
        });
      });
    } else if (taskState.type === 'reschedule') {
      // Handle reschedule choice
      setTaskState(p => ({ ...p, step: 'processing', data: { ...p.data, newTime: choice.label } }));
      runAgent([
        { label: 'Checking availability...', detail: choice.label },
        { label: 'Updating appointment...', detail: 'Dr. Michael Rodriguez' },
        { label: 'Sending confirmation...', detail: 'Email & SMS' },
      ], () => {
        setTaskState(p => ({ ...p, step: 'done' }));
        addEntry({
          type: 'task-card',
          cardType: 'confirmation',
          title: "Appointment Rescheduled ✓",
          subtitle: "Dr. Michael Rodriguez",
          details: [
            { label: 'New time', value: choice.id === 'tomorrow' ? 'Tomorrow 9:00 AM' : choice.id === 'thisWeek' ? 'Friday 2:00 PM' : 'Monday 10:30 AM' },
            { label: 'Location', value: '456 Oak Ave, Austin TX' },
            { label: 'Cost', value: '$0 (covered)' },
          ],
          actions: [
            { id: 'calendar', label: '📅 Update calendar' },
            { id: 'reminder', label: '💬 Text reminder' },
          ]
        });
      });
    } else if (taskState.type === 'cancel') {
      if (choice.id === 'yes') {
        // Confirm cancellation
        setTaskState(p => ({ ...p, step: 'processing', data: { ...p.data, confirmed: true } }));
        runAgent([
          { label: 'Cancelling appointment...', detail: 'Dr. Michael Rodriguez' },
          { label: 'Updating records...', detail: 'Removing from schedule' },
          { label: 'Sending notification...', detail: 'Confirmation email' },
        ], () => {
          setTaskState(p => ({ ...p, step: 'done' }));
          // Remove booking from completed tasks since it's cancelled
          setCompletedTasks(prev => prev.filter(t => t !== 'booking'));
          addEntry({
            type: 'task-card',
            cardType: 'confirmation',
            title: "Appointment Cancelled",
            details: [
              { label: 'Dentist', value: 'Dr. Michael Rodriguez' },
              { label: 'Status', value: 'Cancelled' },
              { label: 'Fee', value: '$0 (no charge)' },
            ],
            actions: [
              { id: 'rebook', label: '📅 Book new appointment' },
            ]
          });
        });
      } else {
        // Keep the appointment
        setTaskState(p => ({ ...p, step: 'done' }));
        addEntry({
          type: 'task-card',
          cardType: 'confirmation',
          title: "Appointment Kept ✓",
          subtitle: "Dr. Michael Rodriguez",
          details: [
            { label: 'When', value: 'Today 4:30 PM' },
            { label: 'Where', value: '456 Oak Ave, Austin TX' },
          ],
          actions: [
            { id: 'details', label: 'View details' },
          ]
        });
      }
    } else if (taskState.type === 'removeFamily') {
      // Handle remove family member
      setTaskState(p => ({ ...p, step: 'processing', data: { ...p.data, member: choice.label } }));
      runAgent([
        { label: 'Removing from plan...', detail: choice.label },
        { label: 'Updating coverage...', detail: 'Adjusting benefits' },
        { label: 'Processing refund...', detail: 'Prorated amount' },
      ], () => {
        setTaskState(p => ({ ...p, step: 'done' }));
        addEntry({
          type: 'task-card',
          cardType: 'confirmation',
          title: "Family Member Removed",
          details: [
            { label: 'Member', value: choice.label.split(' (')[0] },
            { label: 'Coverage ends', value: 'End of billing cycle' },
            { label: 'Refund', value: '$12.50 (prorated)' },
          ],
          actions: [
            { id: 'addAnother', label: 'Add another member' },
          ]
        });
      });
    }
  };

  const showDentists = (urgent) => {
    addEntry({ type: 'qa', question: null, answer: urgent ? "Finding who can see you right away..." : "Finding dentists near you..." });
    setTimeout(() => {
      setTaskState(p => ({ ...p, step: 'dentists' }));
      addEntry({
        type: 'task-card',
        cardType: 'dentists',
        prompt: "Here's who can see you:",
        dentists: urgent ? dentists.slice(0, 2) : dentists,
      });
    }, 500);
  };

  const handleBook = (dentist) => {
    setTaskState(p => ({ ...p, step: 'confirm', data: { ...p.data, dentist } }));
    updateTaskFollowUps('booking', 'confirm');
    runAgent([
      { label: 'Checking coverage...', detail: 'Verifying benefits' },
      { label: 'Confirming slot...', detail: dentist.nextSlot },
      { label: 'Reserving...', detail: dentist.name },
    ], () => {
      setTaskState(p => ({ ...p, step: 'done' }));
      setCompletedTasks(prev => prev.includes('booking') ? prev : [...prev, 'booking']);
      updateTaskFollowUps('booking', 'confirm', true); // Include unlocked actions
      addEntry({
        type: 'task-card',
        cardType: 'confirmation',
        title: "Appointment Confirmed ✓",
        subtitle: dentist.name,
        details: [
          { label: 'When', value: dentist.nextSlot },
          { label: 'Where', value: dentist.address },
          { label: 'Cost', value: '$0 (covered)' },
        ],
        actions: [
          { id: 'calendar', label: '📅 Add to calendar' },
          { id: 'reminder', label: '💬 Text reminder' },
        ],
        nextSteps: [
          { text: "What should I bring?", isTask: false },
          { text: "What's covered in a routine visit?", isTask: false },
        ]
      });
    });
  };

  const handleForm = (data) => {
    setTaskState(p => ({ ...p, step: 'processing', data: { ...p.data, ...data } }));
    updateTaskFollowUps('family', 'processing');
    runAgent([
      { label: 'Validating...', detail: 'Checking eligibility' },
      { label: 'Adding to plan...', detail: data.name },
      { label: 'Creating card...', detail: 'Member ID' },
    ], () => {
      setTaskState(p => ({ ...p, step: 'done' }));
      setCompletedTasks(prev => prev.includes('family') ? prev : [...prev, 'family']);
      updateTaskFollowUps('family', 'processing', true); // Include unlocked actions
      addEntry({
        type: 'task-card',
        cardType: 'confirmation',
        title: "Family Member Added ✓",
        details: [
          { label: 'Name', value: data.name },
          { label: 'Relationship', value: data.relationship },
          { label: 'Coverage starts', value: 'Immediately' },
          { label: 'Member ID', value: 'SMK-' + Math.random().toString(36).substr(2, 6).toUpperCase() },
        ],
        actions: [{ id: 'card', label: '💳 View their card' }],
        nextSteps: [
          { text: "Book an appointment", isTask: true },
          { text: "Do they have the same benefits?", isTask: false },
        ]
      });
    });
  };

  const runAgent = (steps, onDone) => {
    setIsWorking(true);
    addEntry({ type: 'task-card', cardType: 'progress', steps: steps.map((s, i) => ({ ...s, status: i === 0 ? 'working' : 'pending' })) });

    let i = 0;
    const tick = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(tick);
        setConversation(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last.cardType === 'progress') last.steps = last.steps.map(s => ({ ...s, status: 'done' }));
          return copy;
        });
        setIsWorking(false);
        setTimeout(onDone, 400);
      } else {
        setConversation(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last.cardType === 'progress') {
            last.steps = last.steps.map((s, idx) => ({ ...s, status: idx < i ? 'done' : idx === i ? 'working' : 'pending' }));
          }
          return copy;
        });
      }
    }, 900);
  };

  const handleAction = (action) => {
    if (action.id === 'another') {
      startTask('claim');
    } else if (action.id === 'rebook') {
      startTask('booking');
    } else if (action.id === 'addAnother') {
      startTask('family');
    } else if (action.id === 'reminder') {
      addEntry({ type: 'qa', question: null, answer: "Done! I'll text you 2 hours before. 📱" });
    } else if (action.id === 'calendar') {
      addEntry({ type: 'qa', question: null, answer: "Added to your calendar! 📅" });
    } else if (action.id === 'download') {
      addEntry({ type: 'qa', question: null, answer: "Card downloaded to your device! 💳" });
    } else {
      addEntry({ type: 'qa', question: null, answer: "Done! ✓" });
    }
  };

  const handleEntryClick = (index) => {
    const entry = conversation[index];

    // Reset to explore mode first if clicking on a regular Q&A entry
    if (entry?.type === 'qa' && !entry.isTaskClarification) {
      setMode('explore');
      setTaskState(null);
    }

    // Update pinned question to show the clicked entry
    if (entry?.type === 'qa' && entry.question) {
      setAskedQuestion(entry.question);

      // Determine topic based on the question
      let topic = 'initial';
      const q = entry.question.toLowerCase();
      if (q.includes('cover') || q.includes('waiting')) {
        topic = 'coverage';
      } else if (q.includes('cost') || q.includes('price') || q.includes('deductible')) {
        topic = 'cost';
      }
      setCurrentTopic(topic);

      // Update follow-ups based on the topic (all stable, no animation)
      const baseQuestions = exploreQuestions[topic] || exploreQuestions.initial;
      const newActions = completedTasks.flatMap(taskType => unlockedActions[taskType] || []);
      let followUps = baseQuestions;

      if (newActions.length > 0) {
        const questions = baseQuestions.filter(q => !q.isTask).slice(0, 3);
        const tasks = baseQuestions.filter(q => q.isTask);
        followUps = [...questions, ...newActions, ...tasks].slice(0, 8);
      }

      setCurrentFollowUps(followUps.map(item => ({
        text: typeof item === 'string' ? item : item.text,
        isTask: typeof item === 'object' ? item.isTask : false,
        isStable: true,
        isNew: false,
      })));
    }

    setActiveEntry(index);
    setConversation(prev => prev.slice(0, index + 1));
  };

  const restart = () => {
    // Already restarting - ignore
    if (isRestarting) return;

    // Trigger exit animations
    setIsRestarting(true);

    // Wait for animations to complete, then clear state
    setTimeout(() => {
      setConversation([]);
      setMode('explore');
      setTaskState(null);
      setCurrentTopic('initial');
      setActiveEntry(0);
      setStreamingIndex(null);
      setDisplayedWords(0);
      setAskedQuestion(null);
      setPreviousFollowUps(null);
      setCurrentFollowUps([]);
      setPausedTask(null);
      setShowSidebar(false);
      setSidebarLockedClosed(false);
      setShowComposer(false);
      setMobileMenuOpen(false);
      if (followUpDelayTimer.current) {
        clearTimeout(followUpDelayTimer.current);
        followUpDelayTimer.current = null;
      }
      if (composerDelayTimer.current) {
        clearTimeout(composerDelayTimer.current);
        composerDelayTimer.current = null;
      }
      // Keep completedTasks - unlocked actions persist across conversations
      if (streamInterval.current) clearInterval(streamInterval.current);

      // Reset restarting state after a brief moment
      setTimeout(() => setIsRestarting(false), 50);
    }, 400); // Match animation duration
  };

  const sidebarQuestions = getSidebarQuestions();
  const hasConversation = conversation.length > 0;
  const isSidebarOpen = showSidebar && !sidebarLockedClosed;

  // Mobile hamburger toggle
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Close mobile menu when clicking backdrop
  const handleBackdropClick = () => {
    setMobileMenuOpen(false);
  };

  const handleSidebarToggle = () => {
    if (isSidebarOpen) {
      setSidebarLockedClosed(true);
      setShowSidebar(false);
      setSidebarRevealDone(false);
      return;
    }
    setSidebarLockedClosed(false);
    if (hasConversation && streamingIndex === null) {
      setShowSidebar(true);
      setSidebarRevealDone(false);
    }
  };

  const handleSubmitQuestion = (event) => {
    event.preventDefault();
    const text = draftQuestion.trim();
    if (!text) return;
    setDraftQuestion('');
    handleExploreQuestion(text);
  };

  return (
    <div className="v5-page">
      <div className="v5-header">
        <h1>Ask Me <em>Anything</em></h1>
        <p>Ask questions or let me help you get things done</p>
      </div>

      <div className={`v5-card ${isSidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
        {/* Mobile hamburger button */}
        {hasConversation && (
          <button
            className={`v5-hamburger ${mobileMenuOpen ? 'is-open' : ''}`}
            onClick={handleMobileMenuToggle}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        {/* Mobile backdrop */}
        <div
          className={`v5-sidebar-backdrop ${mobileMenuOpen ? 'is-visible' : ''}`}
          onClick={handleBackdropClick}
        />

        <div className="v5-main">
          {!hasConversation ? (
            <div className="v5-empty">
              <h2>What can I help you with?</h2>
              <div className="v5-chips">
                {exploreQuestions.initial.map((item, i) => (
                  <button
                    key={i}
                    className={`chip chip--sm chip--stagger-${i + 1} v5-chip ${item.isTask ? 'chip--task is-task' : ''}`}
                    onClick={() => item.isTask ? handleSidebarQuestion(item) : handleExploreQuestion(item.text)}
                  >
                    {item.isTask && <img src={getTaskIcon(item.text)} alt="" className="task-icon" />}
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`v5-conversation ${isRestarting ? 'is-restarting' : ''}`} ref={convRef}>
              {conversation.map((entry, index) => (
                <div
                  key={entry.id}
                  ref={index === activeEntry ? activeRef : null}
                  className={`v5-entry ${index === activeEntry ? 'active' : ''}`}
                  onClick={() => handleEntryClick(index)}
                >
                  {entry.type === 'qa' && (
                    <>
                      {entry.question && (
                        <div className="v5-question">
                          <span className="v5-q-label">Question {index + 1}</span>
                          <span className="v5-q-text">{entry.question}</span>
                        </div>
                      )}
                      <div className={`v5-answer ${index === streamingIndex ? 'is-writing' : ''}`}>
                        {index === streamingIndex
                          ? entry.answer.split(' ').slice(0, displayedWords).join(' ')
                          : entry.answer
                        }
                        {index === streamingIndex && <span className="v5-cursor" />}
                      </div>
                    </>
                  )}
                  {entry.type === 'task-card' && (
                    <TaskCard
                      entry={entry}
                      onChoice={handleChoice}
                      onBook={handleBook}
                      onForm={handleForm}
                      onAction={handleAction}
                      onNextStep={handleSidebarQuestion}
                      disabled={isWorking || index !== activeEntry}
                    />
                  )}
                  <div className="v5-separator" />
                </div>
              ))}
            </div>
          )}
          {hasConversation && (
            <button className={`v5-restart ${showComposer ? 'has-composer' : ''} ${isRestarting ? 'is-restarting' : ''}`} onClick={restart}>
              <img src={refreshCwIcon} alt="" />
              <span>Restart conversation</span>
            </button>
          )}
          {hasConversation && (
            <form
              className={`v5-composer ${showComposer ? 'is-visible' : ''} ${isRestarting ? 'is-restarting' : ''}`}
              onSubmit={handleSubmitQuestion}
            >
              <input
                type="text"
                placeholder="Ask a question..."
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                aria-label="Ask a question"
              />
              <button type="submit">Send</button>
            </form>
          )}
        </div>

        {(isSidebarOpen || mobileMenuOpen) && hasConversation && (
          <div className={`v5-sidebar ${sidebarRevealDone ? '' : 'is-revealed'} ${mode === 'task' ? 'task-mode' : ''} ${mobileMenuOpen ? 'mobile-open' : ''} ${isRestarting ? 'is-restarting' : ''}`}>
            {hasConversation && (
              <>
                <div className="v5-sidebar-header">
                  <h3>{mode === 'task' ? 'Related questions' : 'Suggested questions'}</h3>
                </div>
                <div className="v5-sidebar-questions">
                  {/* Paused task: show option to continue */}
                  {pausedTask && (
                <button className="v5-paused-task" onClick={resumeTask}>
                  <span className="v5-paused-label">Continue</span>
                  <span className="v5-paused-text">{taskDisplayNames[pausedTask.type]}</span>
                </button>
              )}

              {/* Pinned: the question/task that was just triggered - clickable to navigate back */}
            {askedQuestion && hasConversation && (
              <button className="v5-asked-question" onClick={handleAskedClick}>
                <span className="v5-asked-label">{mode === 'task' ? 'Task' : 'Asked'}</span>
                <span className="v5-asked-text">
                  {mode === 'task' && <img src={getTaskIcon(askedQuestion)} alt="" className="task-icon is-pinned" />}
                  {askedQuestion}
                </span>
              </button>
            )}

              {currentFollowUps.length > 0 ? (
                // Show follow-ups - stays visible during streaming
                currentFollowUps
                  .filter(item => item.text !== askedQuestion)
                  .map((item) => (
                  <button
                    key={item.text}
                    className={`chip chip--borderless v5-sidebar-btn ${item.isTask ? 'chip--task is-task' : ''} ${item.isNew ? 'is-new' : 'is-stable'}`}
                    onClick={() => handleSidebarQuestion(item)}
                  >
                    {item.isTask && <img src={getTaskIcon(item.text)} alt="" className="task-icon" />}
                    {item.text}
                  </button>
                ))
              ) : (
                // Initial state: show sidebar questions directly
                sidebarQuestions.map((item, i) => (
                <button
                  key={i}
                  className={`chip chip--borderless v5-sidebar-btn ${item.isTask ? 'chip--task is-task' : ''}`}
                  onClick={() => handleSidebarQuestion(item)}
                >
                  {item.isTask && <img src={getTaskIcon(item.text)} alt="" className="task-icon" />}
                  {item.text}
                </button>
              ))
              )}
                </div>
              </>
            )}
          </div>
        )}
        {hasConversation && (
          <button
            className={`v5-rail-handle ${isSidebarOpen ? 'is-open' : 'is-closed'}`}
            onClick={handleSidebarToggle}
            aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <span className="v5-rail-arrow">{isSidebarOpen ? '›' : '‹'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function DentistCard({ dentist, onBook, disabled }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onBook(dentist);
  };

  return (
    <div className={`v5-dentist ${isLoading ? 'is-loading' : ''}`}>
      <div className="info">
        <div className="name">{dentist.name}</div>
        <div className="meta">⭐ {dentist.rating} · {dentist.distance}</div>
        <div className="slot">{dentist.nextSlot}</div>
      </div>
      <button onClick={handleClick} disabled={disabled || isLoading}>
        {isLoading ? <span className="spin" /> : 'Book'}
      </button>
    </div>
  );
}

function ChoiceButton({ choice, onChoice, disabled }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onChoice(choice);
  };

  return (
    <button
      className={`v5-choice ${isLoading ? 'is-loading' : ''}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="icon"><span className="spin" /></span>
      ) : (
        <span className="icon">{choice.icon}</span>
      )}
      <span>{choice.label}</span>
    </button>
  );
}

function ActionButton({ action, onAction }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onAction(action);
  };

  return (
    <button
      className={isLoading ? 'is-loading' : ''}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? <span className="spin" /> : action.label}
    </button>
  );
}

function NextStepChip({ step, onNextStep, getTaskIcon }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onNextStep(step);
  };

  return (
    <button
      className={`v5-next-chip ${step.isTask ? 'is-task' : ''} ${isLoading ? 'is-loading' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="spin" />
      ) : (
        <>
          {step.isTask && <img src={getTaskIcon(step.text)} alt="" className="task-icon" />}
          {step.text}
        </>
      )}
    </button>
  );
}

function FormSubmitButton({ onSubmit, disabled, children }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onSubmit();
  };

  return (
    <button
      className={`submit ${isLoading ? 'is-loading' : ''}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <span className="spin" /> : children}
    </button>
  );
}

function TaskCard({ entry, onChoice, onBook, onForm, onAction, onNextStep, disabled }) {
  const [formData, setFormData] = useState({});

  if (entry.cardType === 'choices') {
    return (
      <div className="v5-task-card">
        <div className="v5-task-prompt">{entry.prompt}</div>
        <div className="v5-choices">
          {entry.choices.map(c => (
            <ChoiceButton key={c.id} choice={c} onChoice={onChoice} disabled={disabled} />
          ))}
        </div>
      </div>
    );
  }

  if (entry.cardType === 'dentists') {
    return (
      <div className="v5-task-card">
        <div className="v5-task-prompt">{entry.prompt}</div>
        <div className="v5-dentists">
          {entry.dentists.map(d => (
            <DentistCard key={d.id} dentist={d} onBook={onBook} disabled={disabled} />
          ))}
        </div>
      </div>
    );
  }

  if (entry.cardType === 'progress') {
    return (
      <div className="v5-task-card v5-progress-card">
        {entry.steps.map((s, i) => (
          <div key={i} className={`v5-step ${s.status}`}>
            <span className="icon">
              {s.status === 'done' ? '✓' : s.status === 'working' ? <span className="spin" /> : '○'}
            </span>
            <span className="text">{s.label}<br /><small>{s.detail}</small></span>
          </div>
        ))}
      </div>
    );
  }

  if (entry.cardType === 'confirmation') {
    return (
      <div className="v5-task-card v5-confirm-card">
        <div className="title">{entry.title}</div>
        {entry.subtitle && <div className="subtitle">{entry.subtitle}</div>}
        <div className="details">
          {entry.details.map((d, i) => (
            <div key={i} className="row">
              <span>{d.label}</span>
              <span>{d.value}</span>
            </div>
          ))}
        </div>
        <div className="actions">
          {entry.actions.map(a => (
            <ActionButton key={a.id} action={a} onAction={onAction} />
          ))}
        </div>
        {entry.nextSteps && entry.nextSteps.length > 0 && (
          <div className="v5-next-steps">
            <span className="v5-next-label">What's next?</span>
            <div className="v5-next-chips">
              {entry.nextSteps.map((step, i) => (
                <NextStepChip key={i} step={step} onNextStep={onNextStep} getTaskIcon={getTaskIcon} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (entry.cardType === 'form') {
    const ready = entry.fields.every(f => formData[f.id]);
    return (
      <div className="v5-task-card">
        <div className="v5-task-prompt">{entry.prompt}</div>
        <div className="v5-form">
          {entry.fields.map(f => (
            <div key={f.id} className="field">
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={formData[f.id] || ''}
                  onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))}
                  disabled={disabled}
                >
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  placeholder={f.placeholder}
                  value={formData[f.id] || ''}
                  onChange={e => setFormData(p => ({ ...p, [f.id]: e.target.value }))}
                  disabled={disabled}
                />
              )}
            </div>
          ))}
          <FormSubmitButton onSubmit={() => onForm(formData)} disabled={disabled || !ready}>
            Add to plan
          </FormSubmitButton>
        </div>
      </div>
    );
  }

  return null;
}

export default AskMeAnythingV5;
