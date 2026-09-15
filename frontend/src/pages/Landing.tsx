import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ArrowRight, Brain, Zap, Shield, Search, Database, Wrench, Menu, X, CheckCircle, Clock, Users, Building, Activity, Code2, Server, Cpu } from 'lucide-react';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* 1. Fixed Navbar */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Bug className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">BugLens.ai</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#technology" className="text-sm text-slate-300 hover:text-white transition-colors">Technology</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/login" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors">Get Started</Link>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 hover:text-white">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-white/10"
            >
              <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
                <a href="#features" className="block px-3 py-2 text-base text-slate-300 hover:text-white hover:bg-white/5 rounded-md">Features</a>
                <a href="#how-it-works" className="block px-3 py-2 text-base text-slate-300 hover:text-white hover:bg-white/5 rounded-md">How It Works</a>
                <a href="#technology" className="block px-3 py-2 text-base text-slate-300 hover:text-white hover:bg-white/5 rounded-md">Technology</a>
                <Link to="/login" className="block px-3 py-2 text-base text-slate-300 hover:text-white hover:bg-white/5 rounded-md">Sign In</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div {...fadeIn}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="block text-white">Intelligent Bug</span>
              <span className="block bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Diagnosis Platform</span>
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-slate-400 mx-auto mb-10">
              AI-powered multi-agent analysis with RAG-based fix recommendations for enterprise teams. Resolve issues faster, smarter, and with higher confidence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-base font-medium rounded-lg text-white bg-white/5 hover:bg-white/10 md:text-lg transition-all backdrop-blur-sm">
                Live Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Platform Features</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400 mx-auto">Everything you need to analyze, diagnose, and fix bugs at scale.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "Multi-Agent AI Pipeline", desc: "Collaborative autonomous agents working together to triage and solve issues." },
              { icon: Zap, title: "Smart Triage", desc: "Automatically categorize severity, priority, and assign to the right team." },
              { icon: Search, title: "Stack Trace Analysis", desc: "Deep parsing of logs and stack traces to pinpoint the exact failure point." },
              { icon: Shield, title: "Duplicate Detection", desc: "Semantic search prevents duplicate work by linking related bug reports." },
              { icon: Database, title: "RAG Knowledge Base", desc: "Retrieval-Augmented Generation using your company's historical bug data." },
              { icon: Wrench, title: "Auto-Remediation", desc: "Generate immediate code fixes and long-term architectural recommendations." }
            ].map((feature, i) => (
              <motion.div key={i} {...fadeIn} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 hover:bg-slate-800 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400 mx-auto">A seamless pipeline from bug report to resolution.</p>
          </motion.div>
          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-500/20 via-cyan-500/50 to-teal-500/20" />
            <div className="grid lg:grid-cols-5 gap-8 relative z-10">
              {[
                { step: "01", title: "Submit Bug", desc: "Paste logs, stack trace, or description." },
                { step: "02", title: "AI Triage", desc: "Categorization & priority assignment." },
                { step: "03", title: "Log Analysis", desc: "Anomaly detection in stack traces." },
                { step: "04", title: "Root Cause (RAG)", desc: "Compare with historical knowledge." },
                { step: "05", title: "Fix Recommendation", desc: "Actionable code snippets provided." }
              ].map((item, i) => (
                <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="relative text-center">
                  <div className="w-24 h-24 mx-auto bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center text-2xl font-bold text-blue-400 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Agents Section */}
      <section className="py-24 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Meet Your AI Agents</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-400 mx-auto">Specialized LLM agents working in parallel to accelerate diagnosis.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "Triage Agent", desc: "Determines severity and priority", conf: "98% Confidence" },
              { name: "Log Analysis Agent", desc: "Extracts context from noise", conf: "95% Confidence" },
              { name: "Root Cause Agent", desc: "Pinpoints the exact code failure", conf: "92% Confidence" },
              { name: "Duplicate Detection Agent", desc: "Finds semantic similarities", conf: "99% Confidence" },
              { name: "Remediation Agent", desc: "Generates code fixes", conf: "89% Confidence" }
            ].map((agent, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Brain className="w-16 h-16 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">{agent.name}</h3>
                <p className="text-slate-400 text-sm mb-4 h-10">{agent.desc}</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> {agent.conf}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/5 text-center">
            {[
              { value: "10,000+", label: "Bugs Analyzed", icon: Activity },
              { value: "95%", label: "Accuracy", icon: CheckCircle },
              { value: "50%", label: "Faster Resolution", icon: Clock },
              { value: "100+", label: "Organizations", icon: Building }
            ].map((stat, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                <stat.icon className="w-8 h-8 text-cyan-400 mb-4 opacity-80" />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Technology Stack Section */}
      <section id="technology" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-12">Powered By Enterprise Tech</h2>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
              <div className="flex items-center gap-2 text-xl font-semibold"><Code2 className="text-blue-500"/> React</div>
              <div className="flex items-center gap-2 text-xl font-semibold text-blue-400">TypeScript</div>
              <div className="flex items-center gap-2 text-xl font-semibold"><Server className="text-teal-500"/> FastAPI</div>
              <div className="flex items-center gap-2 text-xl font-semibold text-yellow-400">Python</div>
              <div className="flex items-center gap-2 text-xl font-semibold text-orange-400">SQLAlchemy</div>
              <div className="flex items-center gap-2 text-xl font-semibold"><Database className="text-blue-300"/> FAISS</div>
              <div className="flex items-center gap-2 text-xl font-semibold"><Cpu className="text-purple-500"/> LangChain</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white">Trusted by Engineering Teams</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "BugLens reduced our mean-time-to-resolution by half. The RAG-based root cause analysis is like having our best senior engineer on call 24/7.", author: "Sarah Jenkins", role: "CTO, TechCorp" },
              { quote: "The duplicate detection alone saved us hundreds of hours. It instantly links new tickets to existing knowledge base articles.", author: "David Chen", role: "VP Engineering, StartupX" },
              { quote: "Multi-agent architecture is the future. It's incredible to watch the Triage and Remediation agents collaborate on a complex stack trace.", author: "Elena Rodriguez", role: "Lead Architect, EnterpriseSys" }
            ].map((t, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="bg-slate-800/30 p-8 rounded-2xl border border-white/5 relative">
                <div className="text-4xl text-blue-500/20 absolute top-4 left-4">"</div>
                <p className="text-slate-300 mb-6 relative z-10 italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{t.author}</div>
                    <div className="text-slate-500 text-sm">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeIn}>
            <h2 className="text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {[
              { q: "How does the Multi-Agent system work?", a: "We use specialized LLM agents for different tasks (Triage, Root Cause, Remediation) that communicate and share context to arrive at a highly accurate diagnosis." },
              { q: "Is my code secure?", a: "Yes. Enterprise plans offer zero-data-retention policies, and all analysis is done in isolated, secure containers. We do not train public models on your private code." },
              { q: "What is RAG-based analysis?", a: "Retrieval-Augmented Generation (RAG) allows our AI to search your historical bug tickets, codebase context, and documentation before suggesting a fix, ensuring highly relevant answers." },
              { q: "Can it integrate with Jira / GitHub?", a: "Yes, we offer native integrations with Jira, Linear, GitHub, and GitLab to seamlessly pull issues and push automated fix PRs." },
              { q: "What programming languages are supported?", a: "We support all major languages including Python, JavaScript/TypeScript, Java, Go, Rust, C++, and C# for stack trace analysis and code remediation." }
            ].map((faq, i) => (
              <motion.div key={i} {...fadeIn} className="bg-slate-950 border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-slate-950 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Bug className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-white">BugLens.ai</span>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} BugLens Platform. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
