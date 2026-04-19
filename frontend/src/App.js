import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import SplashPage    from "./pages/SplashPage";
import HomePage      from "./pages/HomePage";
import ContactPage   from "./pages/ContactPage";
import RegisterPage  from "./pages/RegisterPage";
import LoginPage     from "./pages/LoginPage";
import ProfilePage   from "./pages/ProfilePage";
import AboutPage     from "./pages/AboutPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage  from "./pages/EditPostPage";
import PostPage      from "./pages/PostPage";
import AdminPage     from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div style={{
                height: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
                background: "linear-gradient(135deg, #fde2e4, #fce7f3)",
                fontFamily: "'DM Sans', sans-serif", color: "#6b7280"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "50px", height: "50px", border: "3px solid #fbcfe8",
                        borderTop: "3px solid #be185d", borderRadius: "50%",
                        margin: "0 auto 16px", animation: "spin 1s linear infinite"
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "18px" }}>Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/"              element={<SplashPage />} />
                <Route path="/home"          element={<HomePage />} />
                <Route path="/about"         element={<AboutPage />} />
                <Route path="/contact"       element={<ContactPage />} />
                <Route path="/post/:id"      element={<PostPage />} />

                <Route path="/login"    element={user ? <Navigate to="/home" /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage />} />

                <Route path="/profile"   element={user ? <ProfilePage />   : <Navigate to="/login" />} />
                <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
                <Route path="/create"    element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
                <Route path="/edit/:id"  element={user ? <EditPostPage />  : <Navigate to="/login" />} />

                <Route path="/admin" element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/home" />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
