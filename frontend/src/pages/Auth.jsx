import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../utils/store';
import { showToast } from '../utils/toast';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student' or 'faculty'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const current = Store.get('currentUser');
    if (current && current.loggedIn) {
      if (current.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        const profile = Store.get('profile');
        if (!profile || !profile.skills || Object.keys(profile.skills).length === 0) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill all required fields.', '⚠️');
      return;
    }
    if (password.length < 6) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    setLoading(true);

    const computedName = fullName.trim() || (email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()));
    const computedRoll = rollNo.trim() || (role === 'faculty' ? 'FAC001' : '21CS101');

    const user = {
      email,
      name: computedName,
      role,
      rollNo: computedRoll,
      loggedIn: true,
      authTime: new Date().toISOString()
    };

    Store.set('currentUser', user);

    if (mode === 'register' || !Store.get('profile')) {
      const existing = Store.get('profile') || {};
      const parts = computedName.split(' ');
      Store.set('profile', {
        ...existing,
        name: computedName,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email,
        rollNo: user.rollNo,
        branch: existing.branch || (role === 'faculty' ? 'CSE' : 'Computer Science & Engineering'),
        year: existing.year || '3rd Year'
      });
    }

    setTimeout(() => {
      showToast(`Welcome, ${computedName}!`, '🎉');
      setLoading(false);
      setTimeout(() => {
        if (role === 'faculty') {
          navigate('/faculty-dashboard');
        } else {
          const profile = Store.get('profile');
          if (!profile || !profile.skills || Object.keys(profile.skills).length === 0) {
            navigate('/profile');
          } else {
            navigate('/dashboard');
          }
        }
      }, 700);
    }, 600);
  };

  const fillDemoStudent = () => {
    setEmail('arjun.sharma@college.edu.in');
    setPassword('password123');
    setRole('student');
    setMode('login');
    showToast('Loaded Student demo credentials', '👨‍🎓');
  };

  const fillDemoFaculty = () => {
    setEmail('prof.verma@college.edu.in');
    setPassword('faculty123');
    setRole('faculty');
    setMode('login');
    showToast('Loaded Faculty demo credentials', '👨‍🏫');
  };

  const isReg = mode === 'register';

  return (
    <>
      <div className="page-bg-glow"></div>
      <div className="page-bg-glow-2"></div>

      <main className="auth-page">
        <div className="auth-split animate-fade-up">
          
          {/* Left Panel */}
          <div className="auth-left">
            <div className="auth-brand">
              <div className="auth-brand-icon">🎓</div>
              <span>ProjectGuide<span style={{ color: '#60a5fa' }}>-AI</span></span>
            </div>

            <div className="auth-left-body">
              <h1 className="auth-left-title">
                Your AI-Powered<br />Project Guide
              </h1>
              <p className="auth-left-desc">
                Submit your rough idea, get an instant blueprint, and follow a guided milestone roadmap.
              </p>
              <ul className="auth-feature-list">
                <li>Instant feasibility check &amp; scope analysis</li>
                <li>AI-recommended tech stack for your skills</li>
                <li>Milestone roadmap generated based on your timeline</li>
                <li>Conversational mentor — voice &amp; text support</li>
                <li>Faculty review &amp; live progress tracking</li>
              </ul>
            </div>

            <div className="auth-left-footer">
              © 2026 ProjectGuide-AI — Infosys Project
            </div>
          </div>

          {/* Right Panel */}
          <div className="auth-right">
            <div className="auth-form-header">
              <h2 className="auth-form-title">{isReg ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="auth-form-sub">
                {isReg ? 'Set up your account to start AI project mentoring' : 'Sign in to your account to continue'}
              </p>
            </div>

            <div className="auth-tabs">
              <button 
                type="button"
                className={`auth-tab ${!isReg ? 'active' : ''}`} 
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
              <button 
                type="button"
                className={`auth-tab ${isReg ? 'active' : ''}`} 
                onClick={() => setMode('register')}
              >
                Create Account
              </button>
            </div>

            <div className="role-pills">
              <label className={`role-pill ${role === 'student' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="userRole" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')} 
                />
                👨‍🎓 Student
              </label>
              <label className={`role-pill ${role === 'faculty' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="userRole" 
                  value="faculty" 
                  checked={role === 'faculty'} 
                  onChange={() => setRole('faculty')} 
                />
                👨‍🏫 Faculty
              </label>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              
              {isReg && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="e.g. Arjun Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Institute Email</label>
                <input 
                  className="form-input" 
                  type="email" 
                  placeholder="student@college.edu.in" 
                  required 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  className="form-input" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  autoComplete={isReg ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <span className="form-error">Password must be at least 6 characters.</span>
                )}
              </div>

              {isReg && (
                <div className="form-group">
                  <label className="form-label">Roll Number / Faculty ID</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder={role === 'faculty' ? 'e.g. FAC001' : 'e.g. 21CS101'}
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                </div>
              )}

              {!isReg && (
                <div className="form-extra">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--blue)' }} /> Remember me
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent to your email!', '📧'); }}>
                    Forgot password?
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-full btn-lg" 
                style={{ marginTop: '0.25rem' }} 
                disabled={loading}
              >
                {loading ? '⏳ Authenticating...' : (isReg ? '✨ Create Account & Proceed' : 'Sign In')}
              </button>
            </form>

            <div className="demo-hint">
              💡 <strong>Quick Demo:</strong>{' '}
              <span onClick={fillDemoStudent}>Student Login</span> or{' '}
              <span onClick={fillDemoFaculty}>Faculty Login</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
