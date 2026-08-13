import Link from "next/link";
import { customerLogin } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;

  return (
    <div className="auth-page">
      <form action={customerLogin} className="auth-card card">
        <h1>Welcome Back</h1>
        <p className="sub">Log in to your XperaOne account</p>

        {registered && <div className="success-box">Account created — please log in.</div>}
        {error && <div className="error-box">{error}</div>}

        <label>Email<input type="email" name="email" required /></label>
        <label>Password<input type="password" name="password" required /></label>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>Log In</button>
        <p className="switch">No account? <Link href="/register">Register</Link></p>
      </form>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; background: var(--bg-light); padding: 40px 16px; }
        .auth-card { width: 100%; max-width: 380px; padding: 36px; }
        .auth-card h1 { font-size: 22px; }
        .sub { margin: 6px 0 24px; font-size: 14px; }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 16px; }
        input { font-family: var(--font-body); padding: 11px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; }
        .error-box { background: #fef2f2; color: #b91c1c; font-size: 13px; padding: 10px 12px; border-radius: var(--radius-sm); margin-bottom: 16px; }
        .success-box { background: #dcfce7; color: #166534; font-size: 13px; padding: 10px 12px; border-radius: var(--radius-sm); margin-bottom: 16px; }
        .switch { text-align: center; font-size: 13px; margin-top: 16px; }
        .switch a { color: var(--blue); font-weight: 600; }
      `}</style>
    </div>
  );
}
