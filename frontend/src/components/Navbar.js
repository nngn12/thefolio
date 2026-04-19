// src/components/Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (location.pathname === '/') return null;

  const guestLinks = [
    { path: '/home',    label: 'Home'    },
    { path: '/about',   label: 'About'   },
    { path: '/contact', label: 'Contact' },
    { path: '/login',   label: 'Login'   },
  ];

  const memberLinks = [
    { path: '/home',        label: 'Home'       },
    { path: '/create-post', label: 'Write Post' },
    { path: '/dashboard',   label: 'Dashboard'  },
    { path: '/profile',     label: 'Profile'    },
    { path: '/about',       label: 'About'      },
    { path: '/contact',     label: 'Contact'    },
  ];

  const adminLinks = [
    { path: '/home',        label: 'Home'       },
    { path: '/create-post', label: 'Write Post' },
    { path: '/profile',     label: 'Profile'    },
    { path: '/admin',       label: 'Admin'      },
    { path: '/about',       label: 'About'      },
    { path: '/contact',     label: 'Contact'    },
  ];

  let linksToDisplay = guestLinks;
  if (user) {
    linksToDisplay = user.role === 'admin' ? adminLinks : memberLinks;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/home" className="logo">The Art of Web Development/Blogs</Link>

      <ul>
        {linksToDisplay.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {user && (
          <li>
            <button onClick={handleLogout} className="nav-logout-btn">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
