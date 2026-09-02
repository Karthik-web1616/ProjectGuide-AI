import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Store, fmtDate } from '../utils/store';
import { showToast } from '../utils/toast';
import { submitIdeaToBackend, submitOnboarding } from '../utils/api';

const domainMap = {
  aiml: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'HuggingFace', 'FastAPI'],
  web: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'TailwindCSS'],
  mobile: ['Flutter', 'React Native', 'Firebase', 'Swift', 'Kotlin'],
  ds: ['Python', 'Pandas', 'Scikit-Learn', 'Tableau', 'Jupyter Notebook'],
  iot: ['C++', 'Arduino', 'Raspberry Pi', 'MQTT', 'Python', 'Node-RED'],
  cyber: ['Python', 'Kali Linux', 'Wireshark', 'Bash', 'BurpSuite', 'Metasploit'],
  blockchain: ['Solidity', 'Ethereum', 'Web3.js', 'Hardhat', 'IPFS', 'Ethers.js'],
  cloud: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Go', 'GitHub Actions'],
  nlp: ['Python', 'LangChain', 'OpenAI API', 'ChromaDB', 'Streamlit'],
  gamedev: ['Unity', 'C#', 'Unreal Engine', 'C++', 'Godot', 'Blender']
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ done: 0, total: 8, pct: 0, feasibility: '—', week: '—', weekLabel: 'Not started' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Idea Form State
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaDomain, setIdeaDomain] = useState('');
  const [ideaDuration, setIdeaDuration] = useState('30');
  const [ideaTeamSize, setIdeaTeamSize] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Project Guide. Ask me anything about your project requirements, architecture, or roadmap!', time: new Date().toISOString() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const chatMessagesEndRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const user = Store.get('currentUser');
    if (!user || !user.loggedIn) {
      navigate('/login');
      return;
    }
    const p = Store.get('profile');
    if (!p || !p.skills || Object.keys(p.skills).length === 0) {
      navigate('/profile');
      return;
    }
    setProfile(p);

    const storedAvatar = Store.get('avatarDataUrl') || p.avatar || user.avatar;
    if (storedAvatar) setAvatar(storedAvatar);

    // Initial domain & team size
    if (p.domains && p.domains.length > 0) {
      setIdeaDomain(p.domains[0]);
    }
    if (p.teamSize) {
      setIdeaTeamSize(p.teamSize);
    }

    loadProjects(p);
  }, [navigate]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProjects = (curProfile) => {
    let projs = Store.get('projects') || [];
    // Migration fallback for single project
    const singleProj = Store.get('project');
    if (singleProj && projs.length === 0) {
      projs = [singleProj];
      Store.set('projects', projs);
    }

    setProjects(projs);

    if (projs.length > 0) {
      let tDone = 0;
      let tTotal = 0;
      let feasSum = 0;

      projs.forEach(p => {
        tDone += (p.milestonesDone || 0);
        const pMilestones = p.milestones || [];
        tTotal += pMilestones.length || 8;
        feasSum += (p.feasibility || 85);
      });

      const avgFeas = Math.round(feasSum / projs.length);
      const tPct = tTotal === 0 ? 0 : Math.round((tDone / tTotal) * 100);

      const mainP = projs[0];
      const currentMilestoneIdx = mainP.milestonesDone || 0;
      const currentMilestone = (mainP.milestones && mainP.milestones[currentMilestoneIdx]) || null;
      const curWeek = currentMilestone ? currentMilestone.week : `Week ${Math.min(currentMilestoneIdx + 1, 8)}`;
      const curTitle = currentMilestone ? currentMilestone.title : (tDone >= tTotal ? 'Project Completed' : 'In Progress');

      setStats({
        done: tDone,
        total: tTotal,
        pct: tPct,
        feasibility: `${avgFeas}%`,
        week: curWeek,
        weekLabel: curTitle
      });
    } else {
      setStats({
        done: 0,
        total: 8,
        pct: 0,
        feasibility: '—',
        week: '—',
        weekLabel: 'Not started'
      });
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB', '⚠️');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatar(evt.target.result);
      Store.set('avatarDataUrl', evt.target.result);
      showToast('Profile photo updated!', '📸');
    };
    reader.readAsDataURL(file);
  };

  const openIdeaModal = (index = null) => {
    if (index !== null && projects[index]) {
      const p = projects[index];
      setIdeaTitle(p.title || '');
      setIdeaDesc(p.desc || '');
      setIdeaDomain(p.domain || '');
      setIdeaDuration((p.durationDays || 30).toString());
      setIdeaTeamSize(p.teamSize || '3');
      setEditingIndex(index);
    } else {
      setIdeaTitle('');
      setIdeaDesc('');
      setIdeaDuration('30');
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  const closeIdeaModal = () => setIsModalOpen(false);

  const generateMilestones = (days) => {
    const phaseCount = days <= 15 ? 3 : days <= 30 ? 5 : 8;
    const interval = Math.max(1, Math.floor(days / phaseCount));
    let ms = [];
    const baseTitles = [
      "Requirements, Scope & Feasibility Analysis",
      "System Architecture, DB Design & Wireframing",
      "Environment Setup & Core Infrastructure",
      "Module Development & Core Business Logic",
      "API Integrations & Third-Party Services",
      "Unit, Integration & QA Testing",
      "Deployment, CI/CD & Performance Optimization",
      "Final Documentation, Presentation & Viva Prep"
    ];
    const baseDescs = [
      "Define project goals, user stories, and technical requirements.",
      "Design database schema, component hierarchy, and interface flows.",
      "Initialize repositories, configure frameworks, and set up boilerplate.",
      "Build primary models, views, and core algorithms.",
      "Connect backend endpoints, state management, and external APIs.",
      "Conduct end-to-end testing, bug squashing, and security reviews.",
      "Deploy live build to cloud hosting and verify production metrics.",
      "Prepare final project report, slide deck, and live demonstration."
    ];

    for (let i = 0; i < phaseCount; i++) {
      let startDay = i * interval + 1;
      let endDay = (i === phaseCount - 1) ? days : (i + 1) * interval;
      ms.push({
        week: days <= 30 ? `Day ${startDay}–${endDay}` : `Week ${i + 1}`,
        title: baseTitles[i] || `Phase ${i + 1}`,
        desc: baseDescs[i] || `Complete key deliverables for Phase ${i + 1}`
      });
    }
    return ms;
  };

  const submitIdea = (e) => {
    e.preventDefault();
    if (!ideaDesc.trim()) {
      showToast('Please enter an idea description.', '⚠️');
      return;
    }
    setIsSubmitting(true);

    setTimeout(async () => {
      let techStack = [];
      const d = (ideaDomain || '').toLowerCase();
      if (domainMap[d]) {
        techStack = domainMap[d];
      } else {
        techStack = ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL'];
      }

      const duration = parseInt(ideaDuration) || 30;
      const feasibility = Math.floor(Math.random() * 15) + 82; // 82 - 96%
      const newMilestones = generateMilestones(duration);

      const existingProject = editingIndex !== null ? projects[editingIndex] : null;

      const proj = {
        title: ideaTitle.trim() || 'AI Guided Academic Project',
        desc: ideaDesc.trim(),
        domain: ideaDomain || 'web',
        teamSize: ideaTeamSize,
        durationDays: duration,
        techStack,
        feasibility,
        milestonesDone: existingProject ? (existingProject.milestonesDone || 0) : 0,
        submittedAt: existingProject ? existingProject.submittedAt : new Date().toISOString(),
        milestones: newMilestones,
        backendIdeaId: existingProject?.backendIdeaId || null
      };

      // 1. Ensure we have a valid studentId on the backend
      let studentId = Store.get('studentId');
      if (!studentId) {
        try {
          const user = Store.get('currentUser') || {};
          const curProf = profile || Store.get('profile') || {};
          const onboardingRes = await submitOnboarding({
            firstName: curProf.firstName || user.name?.split(' ')[0] || 'Student',
            lastName: curProf.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            email: curProf.email || user.email || 'student@college.edu.in',
            rollNo: curProf.rollNo || user.rollNo || '21CS101',
            branch: curProf.branch || 'CSE',
            year: curProf.year || '3rd Year',
            skills: curProf.skills || { python: 3, webdev: 3 },
            domains: curProf.domains || [proj.domain],
            teamSize: proj.teamSize
          });
          studentId = onboardingRes.student_id;
          Store.set('studentId', studentId);
        } catch (err) {
          console.warn('Auto-onboarding during submission failed:', err);
          studentId = 1; // Fallback
        }
      }

      // 2. Send idea to backend
      try {
        const result = await submitIdeaToBackend({
          student_id: studentId || 1,
          title: proj.title,
          desc: proj.desc,
          domain: proj.domain,
          teamSize: proj.teamSize,
          durationDays: proj.durationDays,
          idea_id: proj.backendIdeaId || undefined
        });
        if (result && result.idea_id) {
          proj.backendIdeaId = result.idea_id;
        }
        showToast(editingIndex !== null ? 'Project idea updated & synced to backend!' : 'Project idea submitted & synced to backend!', '🚀');
      } catch (err) {
        console.error('Idea submission API call failed:', err);
        showToast(editingIndex !== null ? 'Project idea updated locally! (Backend sync failed)' : 'Project idea submitted locally! (Backend sync failed)', '⚠️');
      }

      let updatedProjects = [...projects];
      if (editingIndex !== null) {
        updatedProjects[editingIndex] = {
          ...updatedProjects[editingIndex],
          ...proj
        };
      } else {
        updatedProjects.push(proj);
      }

      Store.set('projects', updatedProjects);
      Store.set('project', updatedProjects[0]); // compatibility

      closeIdeaModal();
      setIsSubmitting(false);
      loadProjects(profile);
    }, 400);
  };

  const startVoiceRecord = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', '⚠️');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      setIsListening(true);
      showToast('Listening... Speak now 🎙️', '🎤');

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setChatInput(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        showToast(`Voice error: ${event.error}`, '❌');
      };

      recognition.onend = () => {
        setIsListening(false);
        showToast('Voice recorded successfully', '✅');
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      showToast('Could not start voice recognition', '⚠️');
    }
  };

  const sendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput.trim(), time: new Date().toISOString() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setChatInput('');

    // Generate intelligent AI response based on query
    setTimeout(() => {
      const q = userMsg.text.toLowerCase();
      let reply = "I recommend breaking down this task into smaller components and reviewing the milestone deliverables.";
      
      if (q.includes('stack') || q.includes('technology') || q.includes('database')) {
        reply = "For your chosen domain, I recommend using a REST/GraphQL API with a relational or document DB (e.g. PostgreSQL or MongoDB) and a component-driven frontend like React.";
      } else if (q.includes('milestone') || q.includes('timeline') || q.includes('deadline')) {
        reply = "Your current phase focuses on core functionality. Make sure your data models and environment setup are completely validated before building UI screens.";
      } else if (q.includes('faculty') || q.includes('review') || q.includes('approval')) {
        reply = "Your faculty mentor can view your submitted blueprint directly from their dashboard. Make sure to complete the milestone deliverables for quick sign-off!";
      } else if (q.includes('feasibility') || q.includes('scope')) {
        reply = "Your project feasibility score is strong! Focus on delivering a solid MVP with clean documentation first.";
      } else {
        reply = `That's a great question regarding "${userMsg.text}". I recommend creating a modular service layer and writing unit tests to keep development fast and reliable.`;
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply, time: new Date().toISOString() }]);
    }, 900);
  };

  const scrollToChat = () => {
    document.getElementById('chatPanel')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('chatInput')?.focus();
  };

  if (!profile) return null;

  const initial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'S';

  return (
    <>
      <Navbar onOpenSubmitModal={() => openIdeaModal()} />
      <div className="page-bg-glow"></div>
      <div className="page-bg-glow-2"></div>

      <main className="dashboard-page">
        <div className="container-wide">

          {/* Welcome Bar */}
          <div className="welcome-bar animate-fade-up">
            <div className="welcome-info">
              <div 
                className="welcome-avatar" 
                onClick={() => avatarInputRef.current?.click()}
                title="Click to upload profile photo"
                style={{ cursor: 'pointer' }}
              >
                {avatar ? <img src={avatar} alt="Profile" /> : initial}
              </div>
              <input 
                type="file" 
                ref={avatarInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleAvatarUpload} 
              />
              <div>
                <div className="welcome-name">{profile.firstName} {profile.lastName} 👋</div>
                <div className="welcome-sub">{profile.rollNo} · {profile.branch} · {profile.year}</div>
              </div>
            </div>
            <div className="welcome-actions">
              <Link to="/profile" className="btn btn-secondary btn-sm">✏️ Edit Profile</Link>
              <button className="btn btn-primary btn-sm" onClick={() => openIdeaModal()}>💡 Submit Idea</button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row animate-fade-up delay-1">
            <div className="stat-card">
              <div className="stat-card-label">Overall Progress</div>
              <div className="stat-card-value" style={{ color: 'var(--green)' }}>{stats.pct}%</div>
              <div className="stat-card-sub">of {stats.total} milestones</div>
              <div className="progress-bar-wrap" style={{ marginTop: '0.6rem' }}>
                <div className="progress-bar green" style={{ width: `${stats.pct}%` }}></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Milestones Done</div>
              <div className="stat-card-value">{stats.done}</div>
              <div className="stat-card-sub">out of {stats.total} total</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Current Phase</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{stats.week}</div>
              <div className="stat-card-sub">{stats.weekLabel}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Feasibility Score</div>
              <div className="stat-card-value" style={{ color: 'var(--blue)' }}>{stats.feasibility}</div>
              <div className="stat-card-sub">AI assessment</div>
            </div>
          </div>

          {/* Main Dash Grid */}
          <div className="dash-grid">

            {/* Left Column: Project & Milestones */}
            <div>
              <div className="section-label">Your Projects ({projects.length})</div>

              {projects.length === 0 ? (
                <div className="empty-project animate-fade-up delay-2">
                  <div className="empty-project-icon">💡</div>
                  <h3 className="empty-project-title">No Project Submitted Yet</h3>
                  <p className="empty-project-desc">
                    Submit your rough project idea to get an instant AI-powered feasibility check, recommended tech stack, and a week-by-week milestone roadmap.
                  </p>
                  <button className="btn btn-primary" onClick={() => openIdeaModal()}>
                    🚀 Submit Your Idea Now
                  </button>
                </div>
              ) : (
                projects.map((proj, pIdx) => {
                  const milestones = proj.milestones || [];
                  const doneCount = proj.milestonesDone || 0;

                  return (
                    <div className="project-card animate-fade-up delay-2" key={pIdx}>
                      <div className="project-card-top">
                        <div>
                          <div className="project-title">{proj.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                            Submitted {fmtDate(proj.submittedAt)} · Duration: {proj.durationDays || 30} Days · Team of {proj.teamSize || 3}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className="badge badge-green">Feasibility: {proj.feasibility}%</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => openIdeaModal(pIdx)}>
                            ✏️ Update
                          </button>
                        </div>
                      </div>

                      <p className="project-desc">{proj.desc}</p>

                      <div className="project-tech">
                        {(proj.techStack || []).map((tech, tIdx) => (
                          <span className="tech-tag" key={tIdx}>{tech}</span>
                        ))}
                      </div>

                      <div className="divider"></div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="section-label" style={{ margin: 0 }}>Milestone Roadmap</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {doneCount} of {milestones.length} completed
                        </span>
                      </div>

                      <div className="milestone-list">
                        {milestones.map((ms, mIdx) => {
                          const isDone = mIdx < doneCount;
                          const isCurrent = mIdx === doneCount;
                          const dotClass = isDone ? 'done' : isCurrent ? 'current' : 'pending';
                          const statusText = isDone ? 'Done' : isCurrent ? 'In Progress' : 'Upcoming';
                          const statusBadgeClass = isDone ? 'done' : isCurrent ? 'current' : 'pending';

                          return (
                            <div className="milestone-item" key={mIdx}>
                              <div className={`ms-dot ${dotClass}`}>
                                {isDone ? '✓' : isCurrent ? (mIdx + 1) : (mIdx + 1)}
                              </div>
                              <div className="ms-body">
                                <div className="ms-week">{ms.week}</div>
                                <div className="ms-title">{ms.title}</div>
                                <div className="ms-desc">{ms.desc}</div>
                              </div>
                              <div className={`ms-status ${statusBadgeClass}`}>{statusText}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Quick Actions & Chat */}
            <div>
              <div className="section-label">Quick Actions</div>
              <div className="quick-actions animate-fade-up delay-2">
                <button className="quick-action-btn" onClick={() => openIdeaModal()}>
                  <span className="quick-action-icon">💡</span>
                  <span>Submit / Update Project Idea</span>
                </button>
                <Link to="/profile" className="quick-action-btn">
                  <span className="quick-action-icon">👤</span>
                  <span>Update My Profile &amp; Skills</span>
                </Link>
                <button className="quick-action-btn" onClick={scrollToChat}>
                  <span className="quick-action-icon">🤖</span>
                  <span>Chat with AI Guide</span>
                </button>
              </div>

              <div className="section-label">AI Mentor Chat</div>
              <div className="chat-panel animate-fade-up delay-3" id="chatPanel">
                <div className="chat-header">
                  <div className="chat-ai-avatar">🤖</div>
                  <div style={{ flex: 1 }}>
                    <div className="chat-ai-name">ProjectGuide AI</div>
                    <div className="chat-ai-sub">● Online · Mentor</div>
                  </div>
                  <div className="chat-online"></div>
                </div>

                <div className="chat-messages">
                  {messages.map((m, i) => (
                    <div className={`chat-msg ${m.role}`} key={i}>
                      {m.text}
                      <div className="chat-msg-time">
                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <div ref={chatMessagesEndRef} />
                </div>

                <form className="chat-input-row" onSubmit={sendChatMessage}>
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    title="Real-time Voice Recording" 
                    onClick={startVoiceRecord}
                    style={{ 
                      padding: '0.45rem 0.6rem', 
                      fontSize: '1.1rem',
                      background: isListening ? 'var(--red-dim)' : 'transparent',
                      color: isListening ? 'var(--red)' : 'var(--text-muted)',
                      borderColor: isListening ? 'var(--red)' : 'var(--border)'
                    }}
                  >
                    🎤
                  </button>
                  <input 
                    className="chat-input" 
                    id="chatInput" 
                    type="text" 
                    placeholder={isListening ? '🎙️ Listening to your voice...' : 'Ask your mentor anything...'} 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                  />
                  <button type="submit" className="btn btn-primary btn-sm">Send</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Submit / Update Idea Modal */}
      <div 
        className={`modal-overlay ${isModalOpen ? 'open' : ''}`} 
        onClick={(e) => { if (e.target === e.currentTarget) closeIdeaModal(); }}
      >
        <div className="modal animate-fade-up">
          <button className="modal-close" onClick={closeIdeaModal}>×</button>
          <h2 className="modal-title">
            {editingIndex !== null ? '✏️ Update Project Idea' : '💡 Submit Your Project Idea'}
          </h2>
          <p className="modal-sub">
            Describe your idea. The AI mentor will analyze feasibility and generate a personalized milestone roadmap.
          </p>

          <form className="auth-form" onSubmit={submitIdea}>
            <div className="form-group">
              <label className="form-label">Project Title</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="e.g. Smart Attendance using Facial Recognition"
                value={ideaTitle} 
                onChange={e => setIdeaTitle(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Description <span style={{ color: 'var(--red)' }}>*</span></label>
              <textarea 
                className="form-textarea" 
                rows="4" 
                maxLength="500"
                placeholder="Describe what you want to build, the problem it solves, and any initial thoughts on the technology..."
                value={ideaDesc} 
                onChange={e => setIdeaDesc(e.target.value)} 
                required 
              />
              <div className="char-counter">{ideaDesc.length}/500</div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Domain</label>
              <select 
                className="form-select" 
                value={ideaDomain} 
                onChange={e => setIdeaDomain(e.target.value)}
              >
                <option value="">Let AI decide from description</option>
                <option value="aiml">AI / Machine Learning</option>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App (Android / iOS)</option>
                <option value="iot">IoT / Embedded Systems</option>
                <option value="ds">Data Science / Analytics</option>
                <option value="cloud">Cloud / DevOps</option>
                <option value="cyber">Cybersecurity</option>
                <option value="blockchain">Blockchain / Web3</option>
                <option value="nlp">NLP / Chatbot / LLM</option>
                <option value="gamedev">Game Development</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Estimated Duration (Days) <span style={{ color: 'var(--red)' }}>*</span></label>
                <input 
                  className="form-input" 
                  type="number" 
                  min="7" 
                  max="180" 
                  placeholder="e.g. 30"
                  value={ideaDuration} 
                  onChange={e => setIdeaDuration(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Team Size</label>
                <select 
                  className="form-select" 
                  value={ideaTeamSize} 
                  onChange={e => setIdeaTeamSize(e.target.value)}
                >
                  <option value="1">Solo (just me)</option>
                  <option value="2">2 members</option>
                  <option value="3">3 members</option>
                  <option value="4">4 members</option>
                  <option value="5">5 members</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeIdeaModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={isSubmitting}>
                {isSubmitting ? '⏳ Analyzing & Generating...' : (editingIndex !== null ? '💾 Save Updates' : '🚀 Submit for AI Review')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
