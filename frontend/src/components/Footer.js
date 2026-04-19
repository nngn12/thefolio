import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const Footer = () => {
    const location = useLocation();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    if (location.pathname === "/") return null;

    return (
        <footer style={{
            borderTop: `1px solid ${t.border}`,
            background: isDark ? "rgba(12,5,8,0.95)" : "rgba(253,246,248,0.98)",
            fontFamily: t.fontSans,
            marginTop: "80px",
        }}>
            <div style={{
                maxWidth: "900px", margin: "0 auto",
                padding: "48px 24px 32px",
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr",
                gap: "40px",
            }}>
                {/* Brand */}
                <div>
                    <p style={{
                        fontFamily: t.fontSerif, fontStyle: "italic",
                        fontSize: "22px", color: t.text, marginBottom: "10px",
                    }}>Captured Memories</p>
                    <p style={{ fontSize: "13px", color: t.textMuted, lineHeight: "1.7", maxWidth: "240px" }}>
                        A personal space to preserve beautiful moments and stories worth remembering.
                    </p>
                </div>

                {/* Navigate */}
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", color: t.pink, marginBottom: "16px" }}>
                        Navigate
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                            { to: "/home", label: "Home" },
                            { to: "/about", label: "About" },
                            { to: "/contact", label: "Contact" },
                            { to: "/login", label: "Sign In" },
                            { to: "/register", label: "Register" },
                        ].map(({ to, label }) => (
                            <li key={to}>
                                <Link to={to} style={{ fontSize: "13px", color: t.textSub, textDecoration: "none", transition: "color 0.2s" }}
                                    onMouseEnter={e => e.target.style.color = t.pink}
                                    onMouseLeave={e => e.target.style.color = t.textSub}
                                >{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", color: t.pink, marginBottom: "16px" }}>
                        Resources
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                            { href: "https://developer.mozilla.org", label: "MDN Web Docs" },
                            { href: "https://www.w3schools.com", label: "W3Schools" },
                            { href: "https://www.freecodecamp.org", label: "freeCodeCamp" },
                            { href: "https://css-tricks.com", label: "CSS-Tricks" },
                        ].map(({ href, label }) => (
                            <li key={href}>
                                <a href={href} target="_blank" rel="noreferrer"
                                    style={{ fontSize: "13px", color: t.textSub, textDecoration: "none" }}
                                    onMouseEnter={e => e.target.style.color = t.pink}
                                    onMouseLeave={e => e.target.style.color = t.textSub}
                                >{label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div style={{
                borderTop: `1px solid ${t.border}`,
                padding: "16px 24px",
                textAlign: "center",
                fontSize: "12px",
                color: t.textMuted,
            }}>
                © {new Date().getFullYear()} Captured Memories · Made with ♥
            </div>
        </footer>
    );
};

export default Footer;
