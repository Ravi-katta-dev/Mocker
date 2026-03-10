import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Play, CheckCircle, XCircle, FileText, Upload, 
  ChevronRight, ChevronLeft, Flag, List, RefreshCw, BarChart 
} from 'lucide-react';

// --- PRE-LOADED SAMPLE DATA (Extracted from your snippets) ---
const SAMPLE_TESTS = {
  1: {
    title: "Set 1: Foundations & Basics (Sample)",
    duration: 1200, // 20 mins
    questions: [
      { id: 1, topic: "Architecture of Computers", question: "The ALU (Arithmetic Logic Unit) in a CPU is responsible for:", options: { A: "Performing arithmetic and logical operations", B: "Storing data permanently", C: "Managing input/output devices", D: "Controlling instruction flow" }, correctOption: "A", difficulty: "Easy", explanation: "ALU executes arithmetic (+, −, ×, ÷) and logical (AND, OR, NOT) operations." },
      { id: 2, topic: "Architecture of Computers", question: "Which part of the CPU is called the 'Brain of the Computer'?", options: { A: "ALU", B: "Control Unit", C: "Register", D: "Cache" }, correctOption: "B", difficulty: "Easy", explanation: "The Control Unit (CU) directs the operations of all other components — hence 'brain'." },
      { id: 3, topic: "Architecture of Computers", question: "The speed of a processor is measured in:", options: { A: "Bytes", B: "Hertz (Hz) / GHz", C: "Watts", D: "Pixels" }, correctOption: "B", difficulty: "Easy", explanation: "Processor clock speed is measured in Hertz (Hz). Modern CPUs run at GHz (billions of cycles per second)." },
      { id: 4, topic: "Architecture of Computers", question: "Which of the following is a 64-bit operating system requirement?", options: { A: "At least 2 GB RAM", B: "A 64-bit processor", C: "A GPU", D: "A touchscreen" }, correctOption: "B", difficulty: "Medium", explanation: "64-bit OS requires a 64-bit capable processor architecture." },
      { id: 26, topic: "Storage Devices", question: "Which of the following storage devices uses laser light to read/write data?", options: { A: "HDD", B: "SSD", C: "Optical Disc (CD/DVD)", D: "USB Pen Drive" }, correctOption: "C", difficulty: "Medium", explanation: "Optical discs (CD, DVD, Blu-ray) use laser technology to read/write data." },
      { id: 27, topic: "Networking", question: "Which protocol assigns IP addresses automatically to devices on a network?", options: { A: "FTP", B: "DHCP", C: "SMTP", D: "DNS" }, correctOption: "B", difficulty: "Medium", explanation: "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses to network devices." },
      { id: 28, topic: "Data Representation", question: "How many bits make one byte?", options: { A: "4", B: "8", C: "16", D: "32" }, correctOption: "B", difficulty: "Easy", explanation: "1 Byte = 8 bits. This is the fundamental unit of digital information storage." },
      { id: 29, topic: "Operating Systems", question: "Which scheduling algorithm gives priority to the shortest job first?", options: { A: "FCFS", B: "Round Robin", C: "SJF (Shortest Job First)", D: "Priority Scheduling" }, correctOption: "C", difficulty: "Medium", explanation: "SJF executes the process with the smallest burst time next, minimizing average waiting time." },
      { id: 30, topic: "Internet and Email", question: "The full form of ISP is:", options: { A: "Internet Security Protocol", B: "Internet Service Provider", C: "Internal System Processor", D: "Integrated Signal Path" }, correctOption: "B", difficulty: "Easy", explanation: "ISP = Internet Service Provider — a company that provides internet access to customers." }
    ]
  },
  2: {
    title: "Set 2: Intermediate Concepts (Sample)",
    duration: 1200,
    questions: [
      { id: 1, topic: "Architecture of Computers", question: "The 'fetch-decode-execute' cycle is performed by which CPU component?", options: { A: "ALU", B: "Control Unit", C: "Cache Memory", D: "Register File" }, correctOption: "B", difficulty: "Medium", explanation: "The Control Unit fetches instructions from memory, decodes them, and coordinates execution." },
      { id: 2, topic: "Architecture of Computers", question: "Which memory is directly accessible by the CPU and faster than RAM?", options: { A: "Hard Disk", B: "SSD", C: "Cache Memory", D: "CD-ROM" }, correctOption: "C", difficulty: "Medium", explanation: "Cache memory (L1/L2/L3) is SRAM-based and much faster than DRAM-based RAM." },
      { id: 3, topic: "Architecture of Computers", question: "What is the function of a register in a CPU?", options: { A: "Stores the operating system", B: "Temporarily holds data being processed", C: "Manages network connections", D: "Controls display output" }, correctOption: "B", difficulty: "Medium", explanation: "Registers are the fastest, smallest memory inside the CPU used to hold active data/instructions." },
      { id: 4, topic: "Architecture of Computers", question: "Von Neumann architecture is based on which concept?", options: { A: "Parallel processing", B: "Stored program concept", C: "Separate memories for data/instructions", D: "Quantum bits" }, correctOption: "B", difficulty: "Medium", explanation: "Stored program concept means data and instructions reside in the same memory space." },
      { id: 26, topic: "Architecture of Computers", question: "Which bus carries data between the CPU and memory?", options: { A: "Control Bus", B: "Address Bus", C: "Data Bus", D: "Power Bus" }, correctOption: "C", difficulty: "Medium", explanation: "The Data Bus carries actual data. The Address Bus carries memory addresses. The Control Bus carries control signals." },
      { id: 28, topic: "Networking", question: "Which protocol translates domain names (like google.com) to IP addresses?", options: { A: "FTP", B: "SMTP", C: "DNS", D: "HTTP" }, correctOption: "C", difficulty: "Medium", explanation: "DNS (Domain Name System) resolves human-readable domain names to machine-readable IP addresses." }
    ]
  }
};

export default function App() {
  // State: 'DASHBOARD', 'TEST_RUNNING', 'TEST_RESULTS'
  const [appState, setAppState] = useState('DASHBOARD');
  
  // Test Data State
  const [activeTestTitle, setActiveTestTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState(1200); 
  const [customDuration, setCustomDuration] = useState(20); // Added for user-defined timer
  
  // In-Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Custom Modal States (Replacing alert/confirm)
  const [errorMsg, setErrorMsg] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (appState === 'TEST_RUNNING') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState]);

  // CSV Parser
  const parseCSVTest = (csvText, filename) => {
    try {
      const rows = [];
      let row = [];
      let inQuotes = false;
      let currentVal = '';
      
      for (let i = 0; i < csvText.length; i++) {
        let char = csvText[i];
        if (char === '"') {
          if (inQuotes && csvText[i+1] === '"') { currentVal += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.trim()); currentVal = '';
        } else if (char === '\n' && !inQuotes) {
          row.push(currentVal.trim()); rows.push(row); row = []; currentVal = '';
        } else if (char !== '\r') {
          currentVal += char;
        }
      }
      if (row.length > 0 || currentVal) { row.push(currentVal.trim()); rows.push(row); }

      const parsedQuestions = [];
      rows.forEach(r => {
        // Check if row starts with a valid Question Number
        if (r.length >= 10 && !isNaN(parseInt(r[0]))) {
          const correctAnsRaw = r[7] || "";
          const match = correctAnsRaw.match(/^\(?([A-D])\)?/i);
          const correctOption = match ? match[1].toUpperCase() : 'A';

          parsedQuestions.push({
            id: parseInt(r[0]),
            topic: r[1],
            question: r[2],
            options: { A: r[3], B: r[4], C: r[5], D: r[6] },
            correctOption: correctOption,
            difficulty: r[8],
            explanation: r[9]
          });
        }
      });

      if (parsedQuestions.length > 0) {
        startTest(`Uploaded: ${filename.replace('.csv', '')}`, parsedQuestions, customDuration * 60);
      } else {
        setErrorMsg("Could not find valid questions in this CSV. Please ensure it matches the correct format.");
      }
    } catch (error) {
      setErrorMsg("Error parsing the CSV file. Please check the file contents.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      parseCSVTest(evt.target.result, file.name);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  const startTest = (title, qList, timeSeconds) => {
    setActiveTestTitle(title);
    setQuestions(qList);
    setDuration(timeSeconds);
    setTimeLeft(timeSeconds);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setAppState('TEST_RUNNING');
  };

  const submitTest = () => {
    setShowSubmitModal(false);
    setAppState('TEST_RESULTS');
  };

  const handleOptionSelect = (optionKey) => {
    setAnswers({ ...answers, [currentIndex]: optionKey });
  };

  const clearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentIndex];
    setAnswers(newAnswers);
  };

  const toggleMarkForReview = () => {
    setMarkedForReview({ 
      ...markedForReview, 
      [currentIndex]: !markedForReview[currentIndex] 
    });
  };

  // Format Time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Compute Results
  const results = useMemo(() => {
    if (appState !== 'TEST_RESULTS') return null;
    let correct = 0, wrong = 0, unattempted = 0;
    questions.forEach((q, idx) => {
      if (!answers[idx]) unattempted++;
      else if (answers[idx] === q.correctOption) correct++;
      else wrong++;
    });
    const score = correct; 
    const maxScore = questions.length;
    const percentage = ((correct / maxScore) * 100).toFixed(1);
    
    return { correct, wrong, unattempted, score, maxScore, percentage };
  }, [appState, questions, answers]);


  // --- VIEWS ---

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="text-center mb-8 sm:mb-10 mt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">RRB Computer Science</h1>
        <p className="text-base sm:text-lg text-slate-600">Mock Test Simulator for Technician Grade-1 / Group-D / JE CBT-1</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* Preloaded Tests Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 flex items-center">
            <FileText className="mr-2 text-blue-600" />
            Sample Tests
          </h2>
          <p className="text-sm text-slate-500 mb-6">These tests contain a sample of extracted questions to try the platform instantly.</p>
          
          <div className="space-y-4">
            {Object.keys(SAMPLE_TESTS).map(key => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{SAMPLE_TESTS[key].title}</h3>
                  <div className="flex space-x-4 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center"><List size={14} className="mr-1"/> {SAMPLE_TESTS[key].questions.length} Qs</span>
                    <span className="flex items-center"><Clock size={14} className="mr-1"/> 20 Mins</span>
                  </div>
                </div>
                <button 
                  onClick={() => startTest(SAMPLE_TESTS[key].title, SAMPLE_TESTS[key].questions, SAMPLE_TESTS[key].duration)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Play size={16} className="mr-1" /> Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-inner">
            <Upload size={28} className="sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Take the Full Exam</h2>
          <p className="text-slate-600 mb-6 max-w-sm text-sm sm:text-base">
            Upload your full <strong className="text-slate-800">Set 1.csv</strong> to <strong className="text-slate-800">Set 5.csv</strong> files.
          </p>
          
          {/* Timer Setting Input */}
          <div className="flex items-center space-x-3 mb-6 bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm w-full max-w-[260px] justify-center">
            <Clock size={18} className="text-blue-500 shrink-0" />
            <label className="text-slate-700 font-medium text-sm">Test Duration:</label>
            <div className="flex items-center">
              <input 
                type="number" 
                min="1" 
                max="180" 
                value={customDuration} 
                onChange={(e) => setCustomDuration(Number(e.target.value))} 
                className="w-14 px-1 py-1 text-center font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-slate-500 text-sm ml-1.5">mins</span>
            </div>
          </div>
          
          <label className="cursor-pointer flex items-center justify-center px-6 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all hover:-translate-y-0.5 w-full max-w-[260px]">
            <Upload className="mr-2" size={20} />
            Upload CSV & Start
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderTestRunning = () => {
    const currentQ = questions[currentIndex];
    
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-4 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
          <div className="flex items-center overflow-hidden mr-2">
            <button className="md:hidden mr-2 p-1.5 text-slate-500 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <List size={22} />
            </button>
            <h1 className="font-bold text-slate-800 text-sm sm:text-lg truncate">{activeTestTitle}</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className={`flex items-center font-mono text-sm sm:text-lg font-bold px-2.5 sm:px-3 py-1.5 rounded-md ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'}`}>
              <Clock size={16} className="mr-1.5 sm:mr-2" />
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm"
            >
              Submit
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Question Area */}
          <main className="flex-1 flex flex-col h-full overflow-y-auto">
            <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full pb-28 sm:pb-8">
              
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4 sm:mb-6">
                <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Q {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full truncate max-w-[200px] sm:max-w-none">
                  {currentQ.topic}
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8 mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-slate-800 mb-6 sm:mb-8 leading-relaxed">
                  {currentQ.question}
                </h2>
                
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div 
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={`flex items-start p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${
                        answers[currentIndex] === opt 
                          ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center h-6 mr-3 sm:mr-4 shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          answers[currentIndex] === opt ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                        }`}>
                          {answers[currentIndex] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span className="text-slate-700 text-sm sm:text-base flex-1 pt-0.5 select-none">
                        <strong className="mr-1.5 sm:mr-2 text-slate-500">{opt}.</strong> {currentQ.options[opt]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

    {/* Bottom Navigation Bar (Mobile Adaptive) */}
            <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 fixed sm:static bottom-0 left-0 right-0 z-10 md:z-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:shadow-none pb-safe">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Secondary Actions (Mark/Clear) */}
                <div className="flex space-x-2 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
                  <button 
                    onClick={toggleMarkForReview}
                    className={`flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                      markedForReview[currentIndex] 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Flag size={14} className={`mr-1.5 sm:mr-2 ${markedForReview[currentIndex] ? 'fill-purple-700' : ''}`} />
                    {markedForReview[currentIndex] ? 'Marked' : 'Mark for Review'}
                  </button>
                  <button 
                    onClick={clearResponse}
                    disabled={!answers[currentIndex]}
                    className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={14} className="mr-1.5 sm:mr-2" />
                    Clear
                  </button>
                </div>

                {/* Primary Actions (Prev/Next) */}
                <div className="flex space-x-2 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
                  <button 
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-5 py-2.5 bg-slate-100 text-slate-700 text-sm sm:text-base font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} className="mr-1" /> Prev
                  </button>
                  <button 
                    onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-5 py-2.5 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next <ChevronRight size={18} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar / Question Palette (Mobile Adaptive Overlay) */}
          <aside className={`
            absolute md:static top-0 right-0 h-full bg-white border-l border-slate-200 w-72 max-w-[80vw] shadow-2xl md:shadow-none transition-transform duration-300 z-30 flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-700">Question Palette</h3>
              <button className="md:hidden text-slate-500 hover:text-slate-800 p-1" onClick={() => setIsSidebarOpen(false)}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto pb-20 md:pb-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  let btnClass = "border-slate-300 text-slate-600 bg-white"; // default
                  if (answers[idx]) btnClass = "border-emerald-500 bg-emerald-500 text-white"; // answered
                  if (markedForReview[idx]) btnClass = "border-purple-500 bg-purple-100 text-purple-800"; // marked
                  if (answers[idx] && markedForReview[idx]) btnClass = "border-purple-600 bg-purple-600 text-white"; // answered & marked
                  if (idx === currentIndex) btnClass += " ring-2 ring-offset-2 ring-blue-400"; // active

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        if(window.innerWidth < 768) setIsSidebarOpen(false); // auto-close on mobile
                      }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border font-semibold text-sm transition-all flex justify-center items-center ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-8 space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center"><div className="w-4 h-4 rounded bg-emerald-500 mr-3 shrink-0"></div> Answered</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded border border-slate-300 bg-white mr-3 shrink-0"></div> Not Answered</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded bg-purple-100 border border-purple-500 mr-3 shrink-0"></div> Marked for Review</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded bg-purple-600 mr-3 shrink-0"></div> Answered & Marked</div>
              </div>
            </div>
          </aside>
          
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="absolute inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-sm" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Test Completed</h1>
            <p className="text-slate-500 mb-8">{activeTestTitle}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">{results.score} <span className="text-lg text-slate-400">/ {results.maxScore}</span></div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Score</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{results.percentage}%</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-3xl font-bold text-emerald-500 mb-1">{results.correct}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Correct</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-3xl font-bold text-rose-500 mb-1">{results.wrong}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incorrect</div>
              </div>
            </div>

            <button 
              onClick={() => setAppState('DASHBOARD')}
              className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-sm transition-colors"
            >
              Return to Dashboard
            </button>
          </div>

          {/* Detailed Solutions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <BarChart className="mr-3 text-blue-600" />
              Detailed Solutions
            </h2>
            
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns === q.correctOption;
                const isAttempted = !!userAns;

                return (
                  <div key={idx} className={`p-5 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50/30' : (!isAttempted ? 'border-slate-200 bg-slate-50' : 'border-rose-200 bg-rose-50/30')}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 bg-white border border-slate-200 rounded-md">
                          {q.topic} • {q.difficulty}
                        </span>
                      </div>
                      {isCorrect ? (
                        <span className="flex items-center text-emerald-600 font-semibold text-sm bg-emerald-100 px-3 py-1 rounded-full"><CheckCircle size={16} className="mr-1"/> Correct</span>
                      ) : (
                        isAttempted ? 
                        <span className="flex items-center text-rose-600 font-semibold text-sm bg-rose-100 px-3 py-1 rounded-full"><XCircle size={16} className="mr-1"/> Incorrect</span> :
                        <span className="flex items-center text-slate-500 font-semibold text-sm bg-slate-200 px-3 py-1 rounded-full">Unattempted</span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-slate-800 mb-4 ml-11">{q.question}</h3>
                    
                    <div className="ml-11 grid md:grid-cols-2 gap-3 mb-4">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        let optClass = "border-slate-200 bg-white text-slate-600";
                        if (opt === q.correctOption) {
                          optClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium ring-1 ring-emerald-500";
                        } else if (opt === userAns && !isCorrect) {
                          optClass = "border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-500";
                        }

                        return (
                          <div key={opt} className={`p-3 rounded-lg border flex items-start text-sm ${optClass}`}>
                            <strong className="mr-2">{opt}.</strong> {q.options[opt]}
                          </div>
                        )
                      })}
                    </div>

                    <div className="ml-11 p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-slate-700">
                      <strong className="text-blue-800 block mb-1">Explanation:</strong>
                      {q.explanation}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-100">
      
      {appState === 'DASHBOARD' && renderDashboard()}
      {appState === 'TEST_RUNNING' && renderTestRunning()}
      {appState === 'TEST_RESULTS' && renderResults()}

      {/* --- CUSTOM ERROR MODAL --- */}
      {errorMsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Failed</h3>
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <button 
              onClick={() => setErrorMsg("")} 
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* --- CUSTOM SUBMIT CONFIRMATION MODAL --- */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-center">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Submit Exam?</h3>
             <p className="text-slate-600 mb-6">Are you sure you want to end your test? You cannot change your answers after submitting.</p>
             <div className="flex space-x-3">
               <button 
                onClick={() => setShowSubmitModal(false)} 
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
               >
                 Go Back
               </button>
               <button 
                onClick={submitTest} 
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
               >
                 Yes, Submit
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
