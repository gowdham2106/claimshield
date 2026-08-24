import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const JOURNEY_STEPS = [
  { time: "1 min", title: "Claim Reported", detail: "FNOL submitted" },
  { time: "4 min", title: "Damage Assessment", detail: "Damage identified" },
  { time: "9 min", title: "Coverage Check", detail: "Policy verified" },
  { time: "22 min", title: "Decision Engine", detail: "Approval decision" },
  { time: "30 min", title: "Settlement Released", detail: "Compensation paid" },
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

  // Cycles the journey tiles through completed -> active -> upcoming,
  // looping continuously (matches the reference's live progress feel).
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveJourneyStep((i) => (i + 1) % (JOURNEY_STEPS.length + 1));
    }, 2000);

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
           CLAIMSHIELD+ LOGIN — LIGHT SETTLEMENT CONSOLE
           White/light console (matches the "Motor Claims. Settled
           Faster." reference) + form as an overlapping card.
           ========================================================= */

        * { box-sizing: border-box; }

        html, body, #root { margin: 0; width: 100%; min-height: 100%; }

        :root {
          --cs-navy: #071a3a;
          --cs-blue: #003087;
          --cs-azure: #0ea5ff;
          --cs-brand-green: #00d084;
          --cs-ink: #1a1410;
          --cs-muted: #667085;
          --cs-border: #e8eef7;
        }

        .cs-login-page {
          width: 100%;
          height: 100vh;
          height: 100dvh;
          display: flex;
          align-items: stretch;
          background: #ffffff;
          overflow: hidden;
        }

        /* =====================================================
           LEFT — light console
           ===================================================== */

        .cs-console {
          flex: 0 0 60%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 16px 28px 18px;
          color: var(--cs-navy);
          position: relative;
          overflow: hidden;
        }

        .cs-console-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
        }

        .cs-console-blob-one {
          width: 340px;
          height: 340px;
          right: -100px;
          top: -100px;
          background: rgba(14, 165, 255, 0.12);
        }

        .cs-console-blob-two {
          width: 300px;
          height: 300px;
          left: -90px;
          bottom: -100px;
          background: rgba(0, 208, 132, 0.1);
        }

        .cs-console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          margin-bottom: 12px;
          position: relative;
        }

        .cs-console-brand {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .cs-console-brand span { color: var(--cs-brand-green); }

        /* Hero: headline + subtitle on the left, circular badge right */

        .cs-hero {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
          align-items: center;
          position: relative;
        }

        .cs-headline {
          font-size: clamp(20px, 2vw, 26px);
          font-weight: 900;
          line-height: 1.05;
          margin: 0;
        }

        .cs-console-sub {
          margin-top: 6px;
          max-width: 360px;
          font-size: 12px;
          line-height: 1.5;
          color: var(--cs-muted);
        }

        .cs-badge-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .cs-badge-circle {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(
            circle,
            rgba(14, 165, 255, 0.16),
            rgba(0, 208, 132, 0.1),
            transparent
          );
          animation: cs-pulse 4s infinite;
        }

        @keyframes cs-pulse {
          50% { transform: scale(1.05); }
        }

        .cs-badge-number {
          font-size: 42px;
          font-weight: 900;
          line-height: 0.85;
          background: linear-gradient(135deg, var(--cs-navy), var(--cs-blue), var(--cs-azure), var(--cs-brand-green));
          background-size: 260%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cs-gradient-move 7s linear infinite;
        }

        @keyframes cs-gradient-move {
          100% { background-position: 260%; }
        }

        .cs-badge-unit {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .cs-badge-caption {
          margin-top: 4px;
          font-size: 9.5px;
          color: var(--cs-muted);
          line-height: 1.4;
        }

        /* Comparison card */

        .cs-compare {
          margin-top: 100px;
          margin-bottom: 20px;
          padding: 0px 12px;
          background: #ffffff;
          border: 1px solid var(--cs-border);
          border-radius: 14px;
          position: relative;
        }

        .cs-compare-title {
          font-size: 10px;
          letter-spacing: 1.2px;
          color: var(--cs-muted);
          font-weight: 900;
          margin-bottom: 8px;
        }

        .cs-compare-row {
          display: grid;
          grid-template-columns: 90px 1fr 60px;
          gap: 8px;
          align-items: center;
          margin-bottom: 4px;
        }

        .cs-compare-row:last-child { margin-bottom: 0; }

        .cs-compare-label {
          font-size: 12.5px;
          font-weight: 800;
        }

        .cs-compare-track {
          display: block;
          position: relative;
          height: 10px;
          border-radius: 999px;
          background: #edf2f7;
          overflow: hidden;
        }

        .cs-compare-fill-industry {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: #cbd5e1;
        }

        .cs-compare-fill-shield {
          display: block;
          width: 45%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--cs-blue), var(--cs-azure), var(--cs-brand-green));
        }

        .cs-compare-value {
          font-size: 12.5px;
          font-weight: 800;
        }

        .cs-compare-value.is-green { color: var(--cs-brand-green); }

        /* Journey tiles - live progression indicator, cycles
           automatically through completed -> active -> upcoming */

        .cs-journey-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px 12px;
        }

        .cs-journey-tile {
          min-height: 48px;
          padding: 5px 4px;
          border-radius: 9px;
          border: 1px solid var(--cs-border);
          background: #ffffff;
          text-align: center;
          opacity: 0.4;
          transition: all 0.6s ease;
        }

        .cs-journey-tile.is-done {
          background: #edfff7;
          border-color: var(--cs-brand-green);
          color: #00a86b;
          opacity: 1;
        }

        .cs-journey-tile.is-active {
          opacity: 1;
          color: #ffffff;
          background: linear-gradient(135deg, var(--cs-blue), var(--cs-azure), var(--cs-brand-green));
          border-color: transparent;
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0, 48, 135, 0.22);
        }

        .cs-journey-tile-icon {
          font-size: 11px;
          line-height: 1;
        }

        .cs-journey-tile-time {
          font-size: 10.5px;
          font-weight: 900;
          margin-top: 1px;
        }

        .cs-journey-tile-title {
          font-size: 8.5px;
          font-weight: 800;
          margin-top: 1px;
        }

        .cs-journey-tile-detail {
          font-size: 7px;
          margin-top: 0px;
          opacity: 0.8;
        }

        /* =====================================================
           RIGHT — overlapping white login card
           ===================================================== */

        .cs-form-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: #f7faff;
        }

        .cs-login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid var(--cs-border);
          box-shadow: 0 20px 50px rgba(7, 26, 58, 0.1);
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
          font-size: 22px;
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
          color: var(--cs-azure);
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
          color: var(--cs-blue);
          text-decoration: underline;
          flex-shrink: 0;
          cursor: pointer;
        }

        .cs-forgot-link:hover { color: var(--cs-azure); }

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
          background: linear-gradient(90deg, var(--cs-blue), var(--cs-azure), var(--cs-brand-green));
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .cs-submit:hover:not(:disabled) {
          background: linear-gradient(90deg, var(--cs-blue), var(--cs-azure), var(--cs-brand-green));
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
          border-color: var(--cs-azure);
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
          background: rgba(0, 208, 132, 0.1);
          color: var(--cs-brand-green);
          margin-bottom: 4px;
        }

        .cs-forgot-sent .cs-submit { margin-top: 8px; width: 100%; }

        @media (max-width: 980px) {
          .cs-login-page { flex-direction: column; height: auto; min-height: 100vh; min-height: 100dvh; }
          .cs-hero { text-align: center; align-items: center; }
          .cs-badge-wrap { margin: 0 auto; align-items: center; text-align: center; }
          .cs-form-area { flex: none; padding: 24px; }
          .cs-console { padding: 24px; }
          .cs-journey-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <main className="cs-login-page">
        {/* =====================================================
            LEFT — light settlement console
            ===================================================== */}
        <section className="cs-console">
          <span className="cs-console-blob cs-console-blob-one" />
          <span className="cs-console-blob cs-console-blob-two" />

          <div className="cs-console-header">
            <span className="cs-console-brand">
              CLAIM <span>SHIELD+</span>
            </span>
          </div>

          <div className="cs-hero">
            <div>
              <h1 className="cs-headline">
                Motor Claims.
                <br />
                Settled Faster.
              </h1>
              <p className="cs-console-sub">
                Not 5–7 days. Dents, windshield glass and scratches settled
                while you wait.
              </p>
            </div>

            <div className="cs-badge-wrap">
              <div className="cs-badge-circle">
                <span className="cs-badge-number">30</span>
                <span className="cs-badge-unit">MINUTES</span>
              </div>
              <p className="cs-badge-caption">
                From Collision To Compensation
                <br />
                In Just 30 Minutes
              </p>
            </div>
          </div>

          <div className="cs-compare">
            <div className="cs-compare-title">SAME CLAIM. TWO TIMELINES.</div>

            <div className="cs-compare-row">
              <span className="cs-compare-label">Industry</span>
              <span className="cs-compare-track">
                <span className="cs-compare-fill-industry" />
              </span>
              <span className="cs-compare-value">5–7 Days</span>
            </div>

            <div className="cs-compare-row">
              <span className="cs-compare-label">Claim Shield+</span>
              <span className="cs-compare-track">
                <span className="cs-compare-fill-shield" />
              </span>
              <span className="cs-compare-value is-green">30 Min</span>
            </div>
          </div>

          <div className="cs-journey-grid">
            {JOURNEY_STEPS.map((step, i) => {
              const isDone = i < activeJourneyStep
              const isActive = i === activeJourneyStep

              return (
                <div
                  key={step.title}
                  className={`cs-journey-tile${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}
                >
                  <span className="cs-journey-tile-icon">{isDone ? '✓' : '○'}</span>
                  <div className="cs-journey-tile-time">{step.time}</div>
                  <div className="cs-journey-tile-title">{step.title}</div>
                  <div className="cs-journey-tile-detail">{step.detail}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* =====================================================
            RIGHT — overlapping login form card
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
                      Forgot password?
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