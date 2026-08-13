import { adminLogin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="auth-page">
      <form action={adminLogin} className="auth-card card">
        <h1>Admin Login</h1>
        <p className="sub">XperaOne control center</p>

        {error && (
          <div className="error-box">
            {error === "not_admin"
              ? "This account does not have admin access."
              : "Invalid email or password."}
          </div>
        )}

        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" name="password" required autoComplete="current-password" />
        </label>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>
          Sign In
        </button>
      </form>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; background: var(--bg-light); padding: 40px 16px; }
        .auth-card { width: 100%; max-width: 380px; padding: 36px; }
        .auth-card h1 { font-size: 22px; }
        .sub { margin: 6px 0 24px; font-size: 14px; }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 16px; }
        input {
          font-family: var(--font-body);
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          font-size: 14px;
        }
        input:focus-visible { outline: 2px solid var(--blue); }
        .error-box {
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
