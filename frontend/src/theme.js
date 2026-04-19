export const getTheme = (isDark) => ({
    // ── Backgrounds ──────────────────────────────────
    bg:       isDark ? "#0c0508"                          : "#fdf6f8",
    bgAlt:    isDark ? "#110609"                          : "#fff9fb",
    card:     isDark ? "#1a0810"                          : "#ffffff",
    cardAlt:  isDark ? "#200c15"                          : "#fdf2f8",
    input:    isDark ? "#1e0b13"                          : "#ffffff",
    overlay:  isDark ? "rgba(12,5,8,0.85)"               : "rgba(253,246,248,0.85)",

    // ── Text ─────────────────────────────────────────
    text:      isDark ? "#fce4ef" : "#1a0a10",
    textSub:   isDark ? "#c9849e" : "#6b3a4e",
    textMuted: isDark ? "#7d4a60" : "#b08090",

    // ── Borders ──────────────────────────────────────
    border:    isDark ? "rgba(220,100,150,0.12)" : "rgba(190,24,93,0.12)",
    borderHov: isDark ? "rgba(220,100,150,0.28)" : "rgba(190,24,93,0.28)",

    // ── Navbar ───────────────────────────────────────
    navBg:     isDark ? "rgba(12,5,8,0.92)"    : "rgba(255,255,255,0.92)",
    navBorder: isDark ? "rgba(190,24,93,0.15)" : "rgba(190,24,93,0.10)",

    // ── Accent (rose) — same both modes ──────────────
    pink:      "#be185d",
    pinkLight: "#fbcfe8",
    pinkGrad:  "linear-gradient(135deg, #be185d 0%, #ec4899 60%, #f9a8d4 100%)",
    pinkMid:   "#ec4899",

    // ── Semantic colours ─────────────────────────────
    success: isDark ? "#6ee7b7" : "#059669",
    danger:  isDark ? "#fca5a5" : "#be123c",
    warn:    isDark ? "#fde68a" : "#92400e",

    // ── Shadows ──────────────────────────────────────
    shadow:   isDark
        ? "0 1px 3px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)"
        : "0 1px 3px rgba(190,24,93,0.06), 0 8px 24px rgba(190,24,93,0.08)",
    shadowSm: isDark
        ? "0 1px 2px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)"
        : "0 1px 2px rgba(190,24,93,0.04), 0 4px 12px rgba(190,24,93,0.06)",
    shadowHov:isDark
        ? "0 2px 6px rgba(0,0,0,0.7), 0 16px 40px rgba(0,0,0,0.5)"
        : "0 2px 6px rgba(190,24,93,0.1), 0 16px 40px rgba(190,24,93,0.14)",

    // ── Typography ───────────────────────────────────
    fontSerif: "'Cormorant Garamond', Georgia, serif",
    fontSans:  "'DM Sans', sans-serif",
});
