import { useRef, useState } from "react";
import monsterSky from "../assets/characters/buddy-monster-sky.svg";
import { ScreenShell } from "../components/ScreenShell";

export function ParentLoginScreen({
  isConfigured,
  onBack,
  onLogin,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      emailRef.current?.focus();
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      passwordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await onLogin(email, password);
    } catch (loginError) {
      setError("เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบข้อมูลแล้วลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell
      className="screen-shell--parent-login"
      variant="ParentToolShell"
    >
      <section className="parent-login-card">
        <button type="button" className="parent-back-button" onClick={onBack}>
          ← กลับหน้าเด็ก
        </button>

        <div className="parent-login-card__hero">
          <img src={monsterSky} alt="" />
          <div>
            <span>Parent / Teacher Mode</span>
            <h1>จัดการคลังการเรียนรู้</h1>
            <p>พื้นที่นี้แยกจากเกมของเด็กและต้องเข้าสู่ระบบก่อนแก้ไขข้อมูล</p>
          </div>
        </div>

        {isConfigured ? (
          <form className="parent-login-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>อีเมล</span>
              <input
                ref={emailRef}
                id="parent-login-email"
                aria-describedby={error ? "parent-login-error" : undefined}
                aria-invalid={Boolean(error && !email.trim())}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span>รหัสผ่าน</span>
              <span className="parent-password-field">
                <input
                  ref={passwordRef}
                  id="parent-login-password"
                  aria-describedby={error ? "parent-login-error" : undefined}
                  aria-invalid={Boolean(error && !password)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="parent-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>
            {error ? (
              <p
                id="parent-login-error"
                className="parent-form-message parent-form-message--error"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="parent-primary-button"
              disabled={isSubmitting}
              aria-busy={isSubmitting || undefined}
            >
              {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ Parent Library"}
            </button>
          </form>
        ) : (
          <div className="parent-setup-card" role="status">
            <strong>ยังไม่ได้เชื่อมต่อ Supabase</strong>
            <p>
              เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ในไฟล์
              `.env` แล้วเปิด dev server ใหม่
            </p>
          </div>
        )}
      </section>
    </ScreenShell>
  );
}
