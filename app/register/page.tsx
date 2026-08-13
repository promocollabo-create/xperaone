import Link from "next/link";
import { customerRegister } from "../login/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="auth-page">
      <form action={customerRegister} className="auth-card card">
        <h1>Create Your Account</h1>
        <p className="sub">Join XperaOne to start shopping</p>

        {error && <div className="error-box">{error}</div>}

        <label>Full Name<input type="text" name="full_name" required /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Password<input type="password" name="password" required minLength={8} /></label>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>Create Account</button>
        <p className="switch">Already have an account? <Link href="/login">Log in</Link></p>
      </form>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; background: var(--bg-light); padding: 40px 16px; }
        .auth-card { width: 100%; max-width: 380px; padding: 36px; }
        .auth-card h1 { font-size: 22px; }
        .sub { margin: 6px 0 24px; font-size: 14px; }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 16px; }
        input { font-family: var(--font-body); padding: 11px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; }
        .error-box { background: #fef2f2; color: #b91c1c; font-size: 13px; padding: 10px 12px; border-radius: var(--radius-sm); margin-bottom: 16px; }
        .switch { text-align: center; font-size: 13px; margin-top: 16px; }
        .switch a { color: var(--blue); font-weight: 600; }
      `}</style>
    </div>
  );
}
