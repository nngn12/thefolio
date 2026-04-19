// src/App.js
import './App.css';
import { Routes, Route } from 'react-router-dom';

import Navbar         from './components/Navbar';
import Footer         from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import SplashPage     from './pages/SplashPage';
import HomePage       from './pages/HomePage';
import PostPage       from './pages/PostPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import ProfilePage    from './pages/ProfilePage';
import DashboardPage  from './pages/DashboardPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage   from './pages/EditPostPage';
import AdminPage      from './pages/AdminPage';
import AboutPage      from './pages/AboutPage';
import ContactPage    from './pages/ContactPage';

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        {/* Splash */}
        <Route path="/"              element={<SplashPage />} />

        {/* Public */}
        <Route path="/home"          element={<HomePage />} />
        <Route path="/posts/:id"     element={<PostPage />} />
        <Route path="/about"         element={<AboutPage />} />
        <Route path="/contact"       element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />

        {/* Members */}
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create-post"   element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/edit-post/:id" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
