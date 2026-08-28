import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, logout } from '../utils/store';

export default function Navbar({ onOpenSubmitModal }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const currentUser = Store.get('currentUser');
    const curProfile = Store.get('profile');
    const customAvatar = Store.get('avatarDataUrl');
    setUser(currentUser);
    setProfile(curProfile);
    if (customAvatar) {
      setAvatar(customAvatar);
    } else if (curProfile && curProfile.avatar) {
      setAvatar(curProfile.avatar);
    }
  }, [location.pathname]);

  const isFaculty = user && user.role === 'faculty';
  const homePath = isFaculty ? '/faculty-dashboard' : '/dashboard';

  const displayName = profile?.firstName || user?.name?.split(' ')[0] || (isFaculty ? 'Faculty' : 'Student');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <Link to={homePath} className="nav-logo">
        <div className="nav-logo-icon">🎓</div>
        <div className="nav-logo-text">ProjectGuide<span>-AI</span></div>
      </Link>

      <ul className="nav-links">
        {isFaculty ? (
          <li>
            <Link to="/faculty-dashboard" className={location.pathname === '/faculty-dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                Profile
              </Link>
            </li>
            {onOpenSubmitModal && (
              <li>
                <a href="#submit" onClick={(e) => { e.preventDefault(); onOpenSubmitModal(); }}>
                  Submit Idea
                </a>
              </li>
            )}
          </>
        )}
      </ul>

      <div className="nav-actions">
        <Link 
          to={isFaculty ? '/faculty-dashboard' : '/profile'} 
          className="nav-avatar" 
          id="navAvatar" 
          title={displayName}
        >
          {avatar ? (
            <img src={avatar} alt={displayName} />
          ) : (
            initial
          )}
        </Link>
        <button 
          onClick={logout} 
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
