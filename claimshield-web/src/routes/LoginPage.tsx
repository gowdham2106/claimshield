import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Car,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

// 4 stages for the top stepper (matches the reference: Raise claim ->
// Smart survey -> Review & approve -> Get paid), labelled Step 1-4
// instead of time values.
const STEPPER_STAGES = [
  { label: "Raise claim", stepLabel: "Step 1" },
  { label: "Smart survey", stepLabel: "Step 2" },
  { label: "Review & approve", stepLabel: "Step 3" },
  { label: "Get paid", stepLabel: "Step 4" },
];

// 4 tiles at the bottom (matches the reference's Snap the damage / AI
// assessment / Approval / Settled - "AI" wording kept out per the
// earlier explicit request, using "Damage Assessment" instead).
const JOURNEY_TILES = [
  { step: "STEP 1", title: "Snap the damage", detail: "Four guided angles at the scene." },
  { step: "STEP 2", title: "Damage Assessment", detail: "Dent, glass or scratch priced in seconds." },
  { step: "STEP 3", title: "Approval", detail: "Straight-through, no surveyor visit." },
  { step: "STEP 4", title: "Settled", detail: "Paid to your bank inside 30 minutes." },
];

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"login" | "forgot" | "forgot-sent">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Cycles the stepper AND the tile grid together through all 4
  // stages, looping continuously - green highlight moves from tile 1
  // through tile 4 and repeats, matching the requested behavior.
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((i) => (i + 1) % STEPPER_STAGES.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setResetError("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    setResetLoading(true);

    try {
      // Supabase deliberately doesn't reveal whether the email exists
      // - it always resolves the same way for security, so we show
      // the same generic confirmation regardless.
      await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      setMode("forgot-sent");
    } catch (err) {
      console.error("Password reset error:", err);
      setResetError("Unable to send reset instructions right now. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* =========================================================
           CLAIMSHIELD+ LOGIN - dark navy console (reverted per team
           request) + the light login form, unchanged.
           ========================================================= */

        * { box-sizing: border-box; }

        html, body, #root { margin: 0; width: 100%; min-height: 100%; }

        :root {
          --cs-navy: #123B4A;
          --cs-brand-green: #008284;
          --cs-timeline-green: #2E9B62;
          --cs-gold: #D99A18;
          --cs-gold-soft: rgba(217, 154, 24, 0.35);
          --cs-teal-1: #123B4A;
          --cs-teal-2: #005758;
          --cs-teal-3: #008284;
          --cs-teal-4: #66b3b5;
          --cs-teal-5: #E8F6F5;
          --cs-navy-line: rgba(255, 255, 255, 0.1);
          --cs-ink: #1a1410;
          --cs-muted: #6b7280;
          --cs-border: #e7e2dc;
        }

        .cs-login-page {
          width: 100%;
          height: 100vh;
          height: 100dvh;
          display: flex;
          align-items: stretch;
          background: var(--cs-teal-1);
          overflow: hidden;
          position: relative;
        }

        .cs-login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.5;
          z-index: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.035) 0px, rgba(255, 255, 255, 0.035) 1px, transparent 1px, transparent 34px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.035) 0px, rgba(255, 255, 255, 0.035) 1px, transparent 1px, transparent 34px);
        }

        .cs-login-page > * {
          position: relative;
          z-index: 1;
        }

        /* =====================================================
           LEFT - dark console
           ===================================================== */

        .cs-console {
          flex: 0 0 60%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 20px 32px 22px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .cs-console::after {
          content: '';
          position: absolute;
          top: -20%;
          right: -10%;
          width: 60%;
          height: 60%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%);
        }

        .cs-console > * {
          position: relative;
          z-index: 1;
        }

        .cs-console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 16px;
          position: relative;
        }

        .cs-console-header::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--cs-gold-soft) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 100%);
        }

        .cs-console-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 800;
        }

        .cs-console-brand svg { color: var(--cs-brand-green); }

        .cs-console-brand-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        .cs-console-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cs-gold);
          margin-bottom: 4px;
        }

        .cs-console-headline {
          font-size: clamp(36px, 4.4vw, 52px);
          font-weight: 800;
          line-height: 1;
          margin: 6px 0 6px;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
          letter-spacing: -0.01em;
        }

        .cs-console-sub {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
        }

        .cs-console-sub b { color: rgba(255, 255, 255, 0.9); }

        /* Stepper */

        .cs-stepper { margin-top: 50px; margin-bottom: 16px; }

        .cs-stepper-labels {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-bottom: 8px;
        }

        .cs-stepper-labels span {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.78);
          transition: color 0.4s ease;
        }

        .cs-stepper-labels span.is-active { color: var(--cs-timeline-green); }

        .cs-stepper-track {
          position: relative;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          margin-bottom: 6px;
        }

        .cs-stepper-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 999px;
          background: var(--cs-timeline-green);
          box-shadow: 0 0 12px rgba(46, 155, 98, 0.55);
        }

        .cs-stepper-marker {
          position: absolute;
          top: 50%;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--cs-navy);
          border: 2px solid var(--cs-timeline-green);
          box-shadow: 0 0 14px rgba(46, 155, 98, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
        }

        .cs-stepper-marker svg { width: 11px; height: 11px; color: var(--cs-timeline-green); }

        .cs-stepper-times {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .cs-stepper-times span {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.72);
          transition: color 0.4s ease;
        }

        .cs-stepper-times span.is-active { color: var(--cs-timeline-green); }

        /* Tiles */

        .cs-tile-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: auto;
        }

        .cs-tile {
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: all 0.5s ease;
        }

        .cs-tile.is-done {
          background: rgba(0, 128, 128, 0.18);
          border-color: rgba(102, 179, 179, 0.5);
        }

        .cs-tile.is-active {
          background: linear-gradient(135deg, var(--cs-teal-3) 0%, var(--cs-teal-2) 100%);
          border-color: var(--cs-gold-soft);
          transform: translateY(-3px);
          box-shadow: 0 14px 28px rgba(0, 87, 88, 0.45), 0 0 0 1px var(--cs-gold-soft);
        }

        .cs-tile-tag {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 6px;
        }

        .cs-tile.is-active .cs-tile-tag { color: rgba(255, 255, 255, 0.85); }

        .cs-tile-title {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .cs-tile-detail {
          display: block;
          font-size: 11px;
          line-height: 1.35;
          color: rgba(255, 255, 255, 0.82);
        }

        .cs-tile.is-active .cs-tile-detail { color: rgba(255, 255, 255, 0.9); }

        /* =====================================================
           RIGHT - login form (unchanged from what's currently live)
           ===================================================== */

        .cs-form-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .cs-login-card {
          width: 100%;
          max-width: 380px;
          background: #fdfcfb;
          border-radius: 16px;
          padding: 26px;
          position: relative;
          box-shadow:
            0 30px 70px rgba(18, 59, 74, 0.35),
            0 8px 24px rgba(18, 59, 74, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .cs-login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 16px;
          right: 16px;
          height: 3px;
          border-radius: 0 0 3px 3px;
          background: linear-gradient(90deg, var(--cs-gold) 0%, #f4e5b8 50%, var(--cs-gold) 100%);
        }

        .cs-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cs-muted);
          margin-bottom: 6px;
        }

        .cs-login-card h1 {
          margin: 0 0 16px;
          font-size: 24px;
          color: var(--cs-ink);
        }

        .cs-login-sub {
          margin: 0 0 16px;
          font-size: 13px;
          color: var(--cs-muted);
          line-height: 1.4;
        }

        .cs-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fdecea;
          border: 1px solid #e0554a;
          margin-bottom: 16px;
          font-size: 12.5px;
          line-height: 1.4;
          color: #b3261e;
        }

        .cs-alert svg { flex-shrink: 0; margin-top: 1px; color: #d64540; }

        .cs-form { display: flex; flex-direction: column; gap: 14px; }

        .cs-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cs-muted);
          margin-bottom: 6px;
        }

        .cs-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          border: 1px solid var(--cs-border);
          border-radius: 10px;
          background: #ffffff;
        }

        .cs-input-wrapper:focus-within {
          border-color: #c7d2dd;
          box-shadow: none;
        }

        .cs-input-wrapper.cs-input-error {
          border-color: #e0554a;
          box-shadow: none;
        }

        .cs-input-icon { flex-shrink: 0; color: var(--cs-muted); }

        .cs-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 11px 0;
          font-size: 14px;
          color: var(--cs-ink);
          min-width: 0;
        }

        .cs-input:focus { outline: none; }

        .cs-input:-webkit-autofill,
        .cs-input:-webkit-autofill:hover,
        .cs-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
          -webkit-text-fill-color: var(--cs-ink);
        }

        .cs-password-button {
          flex-shrink: 0;
          background: transparent;
          border: none;
          padding: 4px;
          color: var(--cs-muted);
          cursor: pointer;
        }

        .cs-password-button:hover:not(:disabled) {
          background: transparent;
          box-shadow: none;
          color: var(--cs-teal-4);
        }

        .cs-field-error {
          margin: 4px 0 0;
          font-size: 11.5px;
          font-weight: 600;
          color: #b3261e;
        }

        .cs-remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .cs-remember {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #4a453f;
          cursor: pointer;
        }

        .cs-checkbox {
          width: 15px;
          height: 15px;
          accent-color: var(--cs-brand-green);
        }

        .cs-forgot-link {
          margin: 0;
          padding: 0;
          background: transparent;
          border: none;
          font-size: 12px;
          font-weight: 700;
          color: var(--cs-teal-2);
          text-decoration: underline;
          flex-shrink: 0;
          cursor: pointer;
        }

        .cs-forgot-link:hover { color: var(--cs-teal-4); }

        .cs-error {
          font-size: 12px;
          font-weight: 600;
          color: #b3261e;
        }

        .cs-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--cs-teal-3) 0%, var(--cs-teal-2) 100%);
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 130, 132, 0.35);
        }

        .cs-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--cs-teal-3) 0%, var(--cs-teal-2) 100%);
          box-shadow: 0 14px 30px rgba(0, 130, 132, 0.45);
          filter: brightness(1.06);
        }
        .cs-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .cs-spinner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          animation: cs-spin 0.7s linear infinite;
        }

        @keyframes cs-spin { to { transform: rotate(360deg); } }

        .cs-track-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid var(--cs-border);
          color: var(--cs-ink);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .cs-track-button:hover:not(:disabled) {
          background: #f7faff;
          box-shadow: none;
          border-color: var(--cs-teal-4);
        }

        .cs-forgot-sent {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .cs-forgot-sent-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(46, 155, 98, 0.1);
          color: var(--cs-brand-green);
          margin-bottom: 4px;
        }

        .cs-forgot-sent .cs-submit { margin-top: 8px; width: 100%; }

        @media (max-width: 980px) {
          .cs-login-page { flex-direction: column; height: auto; min-height: 100vh; min-height: 100dvh; }
          .cs-form-area { flex: none; padding: 24px; }
          .cs-console { padding: 24px; }
          .cs-tile-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <main className="cs-login-page">
        {/* =====================================================
            LEFT - dark settlement console
            ===================================================== */}
        <section className="cs-console">
          <div className="cs-console-header">
            <span className="cs-console-brand">
              <img src="/claimshield-logo-green.png" alt="" className="cs-console-brand-logo" />
              CLAIMSHIELD+
            </span>
          </div>

          <div className="cs-console-eyebrow">Fast track OD settlement</div>
          <h1 className="cs-console-headline">30 min</h1>
          <p className="cs-console-sub">
            Not 5-7 days Dents,windshield glass and scratches, settled while you wait

          </p>

          <div className="cs-stepper">
            <div className="cs-stepper-labels">
              {STEPPER_STAGES.map((stage, i) => (
                <span key={stage.label} className={i === activeStep ? "is-active" : ""}>
                  {stage.label}
                </span>
              ))}
            </div>

            <div className="cs-stepper-track">
              <motion.div
                className="cs-stepper-fill"
                animate={{ width: `${(activeStep / (STEPPER_STAGES.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="cs-stepper-marker"
                animate={{ left: `${(activeStep / (STEPPER_STAGES.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Car />
              </motion.div>
            </div>

            <div className="cs-stepper-times">
              {STEPPER_STAGES.map((stage, i) => (
                <span key={stage.stepLabel} className={i === activeStep ? "is-active" : ""}>
                  {stage.stepLabel}
                </span>
              ))}
            </div>
          </div>

          <div className="cs-tile-grid">
            {JOURNEY_TILES.map((tile, i) => {
              const isDone = i < activeStep
              const isActive = i === activeStep

              return (
                <div
                  key={tile.title}
                  className={`cs-tile${isDone ? " is-done" : ""}${isActive ? " is-active" : ""}`}
                >
                  <span className="cs-tile-tag">{tile.step}</span>
                  <span className="cs-tile-title">{tile.title}</span>
                  <span className="cs-tile-detail">{tile.detail}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* =====================================================
            RIGHT - login form (unchanged)
            ===================================================== */}
        <section className="cs-form-area">
          <motion.div
            className="cs-login-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {mode === "forgot-sent" ? (
              <div className="cs-forgot-sent">
                <div className="cs-forgot-sent-icon">
                  <Mail size={24} />
                </div>
                <h1>Check your email</h1>
                <p className="cs-login-sub">
                  If an account exists for <strong>{resetEmail}</strong>, we've sent
                  password reset instructions to your registered email.
                </p>
                <button type="button" className="cs-submit" onClick={() => setMode("login")}>
                  Back to sign in
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : mode === "forgot" ? (
              <>
                <div className="cs-eyebrow">Forgot password</div>
                <h1>Forgot your password?</h1>
                <p className="cs-login-sub">
                  Enter your registered email and we'll send you instructions to reset it.
                </p>

                <form onSubmit={handleForgotPassword} className="cs-form">
                  <div>
                    <label htmlFor="resetEmail" className="cs-label">Email address</label>
                    <div className="cs-input-wrapper">
                      <Mail size={16} className="cs-input-icon" />
                      <input
                        id="resetEmail"
                        type="email"
                        autoComplete="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={resetLoading}
                        className="cs-input"
                      />
                    </div>
                  </div>

                  {resetError && <div className="cs-error">{resetError}</div>}

                  <button type="submit" disabled={resetLoading} className="cs-submit">
                    {resetLoading ? (
                      <>
                        <span className="cs-spinner" />
                        Sending&hellip;
                      </>
                    ) : (
                      <>
                        Send reset instructions
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button type="button" className="cs-track-button" onClick={() => setMode("login")}>
                    Back to sign in
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="cs-eyebrow">Customer sign-in</div>
                <h1>Resume your claim</h1>

                {error && (
                  <div className="cs-alert">
                    <AlertCircle size={16} />
                    <span>
                      <strong>{error}</strong>
                    </span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="cs-form">
                  <div>
                    <label htmlFor="email" className="cs-label">Email address</label>
                    <div className="cs-input-wrapper">
                      <Mail size={16} className="cs-input-icon" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={loading}
                        className="cs-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="cs-label">Password</label>
                    <div className={`cs-input-wrapper${error ? " cs-input-error" : ""}`}>
                      <LockKeyhole size={16} className="cs-input-icon" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter password"
                        disabled={loading}
                        className="cs-input cs-password-input"
                      />
                      <button
                        type="button"
                        className="cs-password-button"
                        onClick={() => setShowPassword((value) => !value)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {error && <p className="cs-field-error">Incorrect password</p>}
                  </div>

                  <div className="cs-remember-row">
                    <label className="cs-remember">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="cs-checkbox"
                      />
                      Keep me signed in
                    </label>

                    <button
                      type="button"
                      className="cs-forgot-link"
                      onClick={() => {
                        setResetEmail(email);
                        setResetError("");
                        setMode("forgot");
                      }}
                    >
                      Reset password
                    </button>
                  </div>

                  <button type="submit" disabled={loading} className="cs-submit">
                    {loading ? (
                      <>
                        <span className="cs-spinner" />
                        Signing in&hellip;
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </section>
      </main>
    </>
  );
}

export default LoginPage;