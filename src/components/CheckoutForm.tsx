"use client";

import { useActionState } from "react";
import { submitCheckoutAction, type CheckoutState } from "@/app/(site)/checkout/actions";
import type { SessionUser } from "@/lib/auth/session";

const initialState: CheckoutState = {};

export default function CheckoutForm({ user }: { user: SessionUser | null }) {
  const [state, formAction, pending] = useActionState(submitCheckoutAction, initialState);

  return (
    <form action={formAction} className="xp-card p-6 space-y-4">
      <h2 className="font-bold text-slate-900">Customer Details</h2>
      {state.error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">Full Name *</label>
          <input name="fullName" required defaultValue={user?.fullName} className="xp-input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Email *</label>
          <input type="email" name="email" required defaultValue={user?.email} className="xp-input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Phone *</label>
          <input name="phone" required defaultValue={user?.phone ?? ""} className="xp-input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Country *</label>
          <input name="country" required defaultValue={user?.country ?? ""} className="xp-input mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500">Billing Address</label>
          <input name="address" className="xp-input mt-1" placeholder="Street address" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">City</label>
          <input name="city" className="xp-input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Postal Code</label>
          <input name="postalCode" className="xp-input mt-1" />
        </div>
      </div>

      <button type="submit" disabled={pending} className="xp-btn-primary w-full py-3 mt-2 disabled:opacity-60">
        {pending ? "Processing..." : "CONTINUE TO PAYMENT"}
      </button>
    </form>
  );
}
