import { useState, type FormEvent } from "react";
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

const STEPPER_STAGES = [
  { time: "00:00", label: "Raise claim" },
  { time: "00:06", label: "Smart survey" },
  { time: "00:14", label: "Review & approve" },
  { time: "00:28", label: "Get paid" },
];

const STEP_CARDS = [
  {
    step: "STEP 01 · 00:00",
    title: "Snap the damage",
    detail: "Four guided angles at the scene.",
  },
  {
    step: "STEP 02 · 00:06",
    title: "AI assessment",
    detail: "Dent, glass or scratch priced in seconds.",
  },
  {
    step: "STEP 03 · 00:14",
    title: "Approval",
    detail: "Straight-through, no surveyor visit.",
  },
  {
    step: "STEP 04 · 00:28",
    title: "Settled",
    detail: "Paid to your bank inside 30 minutes.",
    highlight: true,
  },
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
           CLAIMSHIELD+ LOGIN — FAST TRACK SETTLEMENT CONSOLE
           Dark navy-blue console (not black) + form as an
           overlapping card. Accent color pulls from the global
           theme variables, so it follows the orange/green toggle.
           ========================================================= */

        * { box-sizing: border-box; }

        html, body, #root { margin: 0; width: 100%; min-height: 100%; }

        :root {
          --cs-primary: var(--color-primary, #ff9736);
          --cs-primary-dark: var(--color-primary-dark, #e67a1f);
          --cs-primary-soft: rgba(var(--color-primary-rgb, 255, 151, 54), 0.14);
          --cs-navy: #0e1f36;
          --cs-navy-deep: #081226;
          --cs-navy-line: rgba(255, 255, 255, 0.1);
          --cs-ink: #1a1410;
          --cs-muted: #6b7280;
          --cs-border: #e7e2dc;
        }

        .cs-login-page {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: stretch;
          background: var(--cs-navy);
        }

        /* =====================================================
           LEFT — dark console (header, TAT box, stepper, cards)
           ===================================================== */

        .cs-console {
          flex: 1.35;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 28px 40px 40px;
          color: #ffffff;
          position: relative;
        }

        .cs-console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 28px;
          border-bottom: 1px solid var(--cs-navy-line);
        }

        .cs-console-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .cs-console-brand svg { color: var(--cs-primary); }

        .cs-console-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
        }

        .cs-console-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--cs-primary);
          box-shadow: 0 0 8px var(--cs-primary);
        }

        .cs-console-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cs-primary);
          margin-bottom: 6px;
        }

        .cs-console-headline {
          font-size: clamp(44px, 6vw, 68px);
          font-weight: 800;
          line-height: 1;
          margin: 0 0 8px;
        }

        .cs-console-sub {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
          margin: 0 0 28px;
        }

        .cs-console-sub b { color: rgba(255, 255, 255, 0.9); }

        /* Stepper */

        .cs-stepper {
          margin-bottom: 26px;
        }

        .cs-stepper-labels {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-bottom: 10px;
        }

        .cs-stepper-labels span {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.55);
        }

        .cs-stepper-labels span.is-active {
          color: var(--cs-primary);
        }

        .cs-stepper-track {
          position: relative;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          margin-bottom: 8px;
        }

        .cs-stepper-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 999px;
          background: var(--cs-primary);
        }

        .cs-stepper-marker {
          position: absolute;
          top: 50%;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--cs-navy);
          border: 2px solid var(--cs-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
        }

        .cs-stepper-marker svg {
          width: 12px;
          height: 12px;
          color: var(--cs-primary);
        }

        .cs-stepper-times {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .cs-stepper-times span {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.04em;
        }

        .cs-stepper-times span.is-active {
          color: var(--cs-primary);
        }

        /* TAT stat */

        .cs-tat {
          padding-bottom: 22px;
          margin-bottom: 22px;
          border-bottom: 1px solid var(--cs-navy-line);
        }

        .cs-tat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 6px;
        }

        .cs-tat-value {
          display: flex;
          align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
        }

        .cs-tat-value strong {
          font-size: 44px;
          font-weight: 800;
          color: var(--cs-primary);
          line-height: 1;
        }

        .cs-tat-value p {
          margin: 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          max-width: 260px;
        }

        /* Step cards */

        .cs-step-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: auto;
        }

        .cs-step-card {
          padding: 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--cs-navy-line);
        }

        .cs-step-card.is-highlight {
          background: var(--cs-primary);
          border-color: var(--cs-primary);
        }

        .cs-step-card-tag {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 8px;
        }

        .cs-step-card.is-highlight .cs-step-card-tag {
          color: rgba(255, 255, 255, 0.85);
        }

        .cs-step-card-title {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .cs-step-card-detail {
          display: block;
          font-size: 12px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.55);
        }

        .cs-step-card.is-highlight .cs-step-card-detail {
          color: rgba(255, 255, 255, 0.9);
        }

        /* =====================================================
           RIGHT — overlapping white login card
           ===================================================== */

        .cs-form-area {
          flex: 0 0 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
        }

        .cs-login-card {
          width: 100%;
          max-width: 360px;
          background: #fdfcfb;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
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
          background: var(--cs-primary-soft);
          border: 1px solid var(--cs-primary);
          margin-bottom: 16px;
          font-size: 12.5px;
          line-height: 1.4;
          color: var(--cs-primary-dark);
        }

        .cs-alert svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--cs-primary);
        }

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
          border-color: var(--cs-primary);
          box-shadow: 0 0 0 3px var(--cs-primary-soft);
        }

        .cs-input-wrapper.cs-input-error {
          border-color: var(--cs-primary);
          box-shadow: 0 0 0 3px var(--cs-primary-soft);
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

        .cs-password-button {
          flex-shrink: 0;
          background: transparent;
          border: none;
          padding: 4px;
          color: var(--cs-muted);
          cursor: pointer;
        }

        .cs-field-error {
          margin: 4px 0 0;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--cs-primary-dark);
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
          accent-color: var(--cs-primary);
        }

        .cs-forgot-link {
          margin: 0;
          padding: 0;
          background: transparent;
          border: none;
          font-size: 12px;
          font-weight: 700;
          color: var(--cs-primary);
          text-decoration: underline;
          flex-shrink: 0;
          cursor: pointer;
        }

        .cs-forgot-link:hover { color: var(--cs-primary-dark); }

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
          background: var(--cs-primary);
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .cs-submit:hover { background: var(--cs-primary-dark); }
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
          background: var(--cs-primary-soft);
          color: var(--cs-primary);
          margin-bottom: 4px;
        }

        .cs-forgot-sent .cs-submit { margin-top: 8px; width: 100%; }

        @media (max-width: 980px) {
          .cs-login-page { flex-direction: column; height: auto; min-height: 100vh; min-height: 100dvh; }
          .cs-step-cards { grid-template-columns: repeat(2, 1fr); }
          .cs-form-area { flex: none; padding: 24px; }
          .cs-console { padding: 24px; }
        }
      `}</style>

      <main className="cs-login-page">
        {/* =====================================================
            LEFT — dark settlement console
            ===================================================== */}
        <section className="cs-console">
          <div className="cs-console-header">
            <span className="cs-console-brand">
              <Car size={18} />
              CLAIMSHIELD+
            </span>
            <span className="cs-console-status">
              Fast Track desk: open
              <span className="cs-console-status-dot" />
            </span>
          </div>

          <div className="cs-console-eyebrow">Fast track OD settlement</div>
          <h1 className="cs-console-headline">30 min</h1>
          <p className="cs-console-sub">
            Median settled at <b>00:28</b> · industry usually takes <b>5–7 days</b>.
          </p>

          <div className="cs-stepper">
            <div className="cs-stepper-labels">
              {STEPPER_STAGES.map((stage, i) => (
                <span key={stage.label} className={i === 0 ? "is-active" : ""}>
                  {stage.label}
                </span>
              ))}
            </div>

            <div className="cs-stepper-track">
              <motion.div
                className="cs-stepper-fill"
                initial={{ width: "0%" }}
                animate={{ width: "22%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="cs-stepper-marker"
                initial={{ left: "0%" }}
                animate={{ left: "22%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Car />
              </motion.div>
            </div>

            <div className="cs-stepper-times">
              {STEPPER_STAGES.map((stage, i) => (
                <span key={stage.time} className={i === 0 ? "is-active" : ""}>
                  {stage.time}
                </span>
              ))}
            </div>
          </div>

          <div className="cs-tat">
            <div className="cs-tat-label">Median settled at</div>
            <div className="cs-tat-value">
              <strong>00:28</strong>
              <p>Minutes from first photo to money in the account — not the usual 5–7 days.</p>
            </div>
          </div>

          <div className="cs-step-cards">
            {STEP_CARDS.map((card) => (
              <div
                key={card.title}
                className={`cs-step-card${card.highlight ? " is-highlight" : ""}`}
              >
                <span className="cs-step-card-tag">{card.step}</span>
                <span className="cs-step-card-title">{card.title}</span>
                <span className="cs-step-card-detail">{card.detail}</span>
              </div>
            ))}
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
                <div className="cs-eyebrow">Reset password</div>
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