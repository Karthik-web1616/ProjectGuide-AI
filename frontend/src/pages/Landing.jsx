import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../utils/store';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = Store.get('currentUser');
    const profile = Store.get('profile');

    if (user && user.loggedIn) {
      if (user.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else if (!profile || !profile.skills || Object.keys(profile.skills).length === 0) {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
}
