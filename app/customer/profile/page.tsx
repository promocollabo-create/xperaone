import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";
import Link from "next/link";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="container section">
      <div className="dash-nav"><Link href="/customer/dashboard">← Back to Dashboard</Link></div>
      <h1 style={{ fontSize: 28, margin: "12px 0 24px" }}>My Profile</h1>

      <form action={updateProfile} className="card profile-form">
        <label>Email<input type="email" value={profile?.email ?? ""} disabled /></label>
        <label>Full Name<input type="text" name="full_name" defaultValue={profile?.full_name ?? ""} /></label>
        <label>Phone<input type="text" name="phone" defaultValue={profile?.phone ?? ""} /></label>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>

      <style>{`
        .dash-nav a { font-size: 13px; color: var(--blue); font-weight: 600; }
        .profile-form { max-width: 420px; padding: 26px; display: flex; flex-direction: column; gap: 16px; }
        .profile-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); }
        .profile-form input { font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400; }
        .profile-form input:disabled { background: var(--bg-light); color: var(--text-muted); }
      `}</style>
    </div>
  );
}
