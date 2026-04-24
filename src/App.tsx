/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Calendar, 
  MessageSquare, 
  Info, 
  Vote, 
  ShieldCheck, 
  MapPin, 
  ExternalLink,
  Send,
  Loader2,
  X,
  User,
  Bot,
  HelpCircle,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

// Types
interface Step {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  action?: string;
  link?: string;
}

interface TimelineEvent {
  id: number;
  month: string;
  day: string;
  title: string;
  description: string;
  type: 'registration' | 'primary' | 'general' | 'administrative';
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// Data
const STEPS: Step[] = [
  {
    id: 1,
    title: "Registration",
    description: "Check your status or register to vote.",
    longDescription: "Voter registration is the first step. Requirements vary by state, but generally you must be a U.S. citizen, 18 years old by election day, and a resident of your state.",
    icon: <ShieldCheck className="w-6 h-6 text-civic-blue" />,
    action: "Check Registration Status",
    link: "https://vote.gov"
  },
  {
    id: 2,
    title: "Research",
    description: "Learn about candidates and ballot measures.",
    longDescription: "Informed voters make for a stronger democracy. Look up non-partisan summaries of candidates, their platforms, and any local ballot initiatives or amendments.",
    icon: <Info className="w-6 h-6 text-civic-blue" />,
    action: "View Ballot Samples",
    link: "https://ballotpedia.org"
  },
  {
    id: 3,
    title: "Find Polling Place",
    description: "Locate where to cast your ballot.",
    longDescription: "Know where you're going before Election Day. Many states also offer early voting locations or 'vote centers' where any registered voter in the county can go.",
    icon: <MapPin className="w-6 h-6 text-civic-blue" />,
    action: "Find My Polling Place",
    link: "https://www.vote.org/polling-place-locator/"
  },
  {
    id: 4,
    title: "Cast Your Vote",
    description: "Make your voice heard at the polls.",
    longDescription: "Whether by mail, early in person, or on Election Day—ensure you follow instructions carefully, bring required ID if necessary, and submit your ballot on time.",
    icon: <Vote className="w-6 h-6 text-civic-blue" />,
    action: "Voting Rules by State",
    link: "https://usa.gov/how-to-vote"
  }
];

const TIMELINE: TimelineEvent[] = [
  { id: 1, month: "JAN", day: "15", title: "Caucus & Primary Season Begins", description: "State-level contests to select presidential nominees begin across the nation.", type: 'primary' },
  { id: 2, month: "MAR", day: "05", title: "Super Tuesday", description: "The largest day of primary voting with over a dozen states holding contests simultaneously.", type: 'primary' },
  { id: 3, month: "JUL", day: "15", title: "National Party Conventions", description: "Parties formally nominate their candidates for President and Vice President.", type: 'administrative' },
  { id: 4, month: "SEP", day: "20", title: "Early Voting Opens", description: "In many states, the first general election ballots begin to be cast via mail or in person.", type: 'general' },
  { id: 5, month: "NOV", day: "05", title: "General Election Day", description: "The final day to cast your ballot in the general election.", type: 'general' },
  { id: 6, month: "JAN", day: "20", title: "Inauguration Day", description: "The President-elect is sworn into office.", type: 'administrative' }
];

export default function App() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI Setup
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: userInput }] }
        ],
        config: {
          systemInstruction: "You are an expert Election Process Consultant called 'Pulse'. Your goal is to help US voters understand the election process, registration, timelines, and how to vote. Be non-partisan, accurate, and encouraging. If a user asks about specific state laws, remind them that rules vary by state and they should check official sources. Keep responses concise and use markdown formatting for clarity."
        }
      });

      const botMessage: ChatMessage = { 
        role: 'bot', 
        content: response.text || "I'm sorry, I couldn't process that. Please try again." 
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages(prev => [...prev, { role: 'bot', content: "An error occurred while connecting to the consultant. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-civic-blue p-1.5 rounded-lg text-white">
            <Vote size={20} />
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-civic-blue">CIVICPULSE</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500 uppercase tracking-widest">
          <a href="#roadmap" className="hover:text-civic-blue transition-colors">Roadmap</a>
          <a href="#timeline" className="hover:text-civic-blue transition-colors">Timeline</a>
          <a href="#resources" className="hover:text-civic-blue transition-colors">Resources</a>
        </div>
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="md:hidden">
          <Menu size={24} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold text-civic-red uppercase tracking-[0.2em] mb-4 block">Defend Democracy</span>
            <h1 className="text-5xl md:text-7xl font-black text-civic-blue leading-[0.9] mb-6">
              Your Voice, <br />
              <span className="italic text-civic-red font-serif">Simplified.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg mb-8">
              Navigating the election process shouldn't be a hurdle. CivicPulse provides a clear, interactive roadmap for your path to the polls.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#roadmap" className="bg-civic-blue text-white px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all flex items-center gap-2">
                Start My Roadmap <ChevronRight size={18} />
              </a>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-white border border-slate-200 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                Ask a Question <MessageSquare size={18} />
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1540910419892-f39aefe24aa2?auto=format&fit=crop&q=80&w=1200" 
                alt="Election and Democracy" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-civic-blue/40 to-transparent" />
            </div>
            {/* Floating Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block max-w-xs"
            >
              <div className="flex gap-4 items-start">
                <div className="bg-green-100 text-green-600 p-2 rounded-full">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Ready to vote?</h4>
                  <p className="text-xs text-slate-500 mt-1">Join 150M+ Americans casting their ballots this cycle.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Roadmap */}
      <section id="roadmap" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-civic-blue mb-4 leading-tight">Voter Roadmap</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Click through the steps below to prepare for your journey to the ballot box.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Step Selection List */}
            <div className="lg:col-span-5 space-y-4">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 flex items-center gap-6 group relative overflow-hidden ${
                    activeStep === step.id 
                      ? 'bg-white shadow-xl border-l-4 border-civic-blue pl-8' 
                      : 'hover:bg-slate-200/50 grayscale hover:grayscale-0 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${
                    activeStep === step.id ? 'bg-civic-blue text-white' : 'bg-white text-slate-400 group-hover:text-civic-blue'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold leading-none mb-1 transition-colors ${
                      activeStep === step.id ? 'text-civic-blue' : 'text-slate-600'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">{step.description}</p>
                  </div>
                  {activeStep === step.id && (
                    <motion.div 
                      layoutId="arrow" 
                      className="ml-auto text-civic-blue"
                    >
                      <ChevronRight size={24} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Step Details Panel */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 min-h-[400px] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="bg-slate-100 text-slate-500 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Step 0{activeStep}
                      </span>
                      <HelpCircle size={20} className="text-slate-300" />
                    </div>
                    <h2 className="text-4xl text-civic-blue mb-6">{STEPS[activeStep - 1].title}</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                      {STEPS[activeStep - 1].longDescription}
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-slate-50">
                    <a 
                      href={STEPS[activeStep - 1].link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-paper px-8 py-4 rounded-xl text-civic-blue font-bold hover:bg-slate-100 transition-colors"
                    >
                      {STEPS[activeStep - 1].action}
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black text-civic-blue mb-4 leading-tight">Election Cycle Timeline</h2>
            <p className="text-slate-500">Key dates and milestones for the current election cycle. Stay informed and mark your calendar.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Primary
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> General
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="timeline-line hidden md:block" />
          <div className="space-y-12 md:space-y-0">
            {TIMELINE.map((event, idx) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                  <div className={`max-w-sm p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative ${
                    idx % 2 === 0 ? 'md:text-right' : 'md:text-left'
                  } bg-white`}>
                    <div className={`inline-block mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                      event.type === 'primary' ? 'bg-blue-100 text-blue-600' :
                      event.type === 'general' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {event.type}
                    </div>
                    <h3 className="text-2xl text-civic-blue mb-2 leading-tight">{event.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{event.description}</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-serif text-white shadow-lg ${
                    event.type === 'primary' ? 'bg-blue-500' :
                    event.type === 'general' ? 'bg-red-500' :
                    'bg-slate-700'
                  }`}>
                    <span className="text-[10px] font-black tracking-widest opacity-80">{event.month}</span>
                    <span className="text-3xl font-black leading-none">{event.day}</span>
                  </div>
                </div>

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant FAB and Drawer */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-civic-blue text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden flex items-center gap-3 pr-6"
        >
          <div className="bg-white/20 p-1 rounded-full">
            <MessageSquare size={24} />
          </div>
          <span className="font-bold">Pulse Consultant</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-28 right-8 w-[400px] max-w-[calc(100vw-4rem)] max-h-[600px] glass-panel z-[100] rounded-3xl overflow-hidden flex flex-col shadow-2xl border-civic-blue/20"
          >
            {/* Chat Header */}
            <div className="bg-civic-blue p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">Pulse</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Always Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-paper/50">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Vote size={32} />
                  </div>
                  <h4 className="font-bold text-slate-700">How can I help?</h4>
                  <p className="text-sm text-slate-400 mt-2">Ask me about voter registration, important dates, or general election procedures.</p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {["Am I registered?", "When is the next election?", "How to vote by mail?"].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setUserInput(q); }}
                        className="text-[11px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-civic-blue hover:text-civic-blue transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-civic-red text-white' : 'bg-civic-blue text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-civic-red text-white rounded-tr-none shadow-md shadow-civic-red/20' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-civic-blue text-white flex-shrink-0 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-civic-blue" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Pulse is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-2xl focus-within:border-civic-blue transition-colors group bg-slate-50"
              >
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={isTyping || !userInput.trim()}
                  className="bg-civic-blue text-white p-2.5 rounded-xl disabled:opacity-50 disabled:grayscale hover:bg-opacity-90 transition-all flex items-center justify-center shadow-lg shadow-civic-blue/20"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-[9px] text-center text-slate-400 uppercase tracking-widest mt-3 font-bold">
                Consultant Pulse by CivicPulse • Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 mt-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-civic-blue p-1.5 rounded-lg text-white">
                <Vote size={20} />
              </div>
              <span className="font-serif font-black text-2xl tracking-tight text-civic-blue">CIVICPULSE</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              CivicPulse is a non-partisan educational initiative designed to clarify the democratic process. We believe informed participation is the bedrock of a healthy society.
            </p>
            <div className="text-xs font-black text-slate-300 uppercase tracking-widest">
              © 2024 CivicPulse Initiative • All Rights Reserved
            </div>
          </div>
          <div>
            <h4 className="font-serif text-lg text-civic-blue mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a href="#" className="hover:text-civic-blue">Voter ID Requirements</a></li>
              <li><a href="#" className="hover:text-civic-blue">Absentee Ballots</a></li>
              <li><a href="#" className="hover:text-civic-blue">Election Security</a></li>
              <li><a href="#" className="hover:text-civic-blue">Poll Worker Info</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg text-civic-blue mb-6">Connect</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a href="#" className="hover:text-civic-blue">Contact Us</a></li>
              <li><a href="#" className="hover:text-civic-blue">Media Kit</a></li>
              <li><a href="#" className="hover:text-civic-blue">Accessibility</a></li>
              <li><a href="#" className="hover:text-civic-blue">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
