import React, { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../api";
import { clearStoredAuth } from "../utils/auth";

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "college_admin";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminAccountsPanel: React.FC = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentSuperAdminPassword, setCurrentSuperAdminPassword] = useState("");
  const [newSuperAdminPassword, setNewSuperAdminPassword] = useState("");
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      setAccounts((await apiGet<{ accounts: AdminAccount[] }>("/api/admin/accounts")).accounts);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load administrator accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPost("/api/admin/accounts", { name, email, password });
      setName("");
      setEmail("");
      setPassword("");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create College Admin account.");
    } finally {
      setSaving(false);
    }
  };

  const changeSuperAdminPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPost("/api/admin/accounts/change-password", {
        currentPassword: currentSuperAdminPassword,
        newPassword: newSuperAdminPassword,
      });
      clearStoredAuth();
      window.location.assign("/admin-login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change the Super Admin password.");
    } finally {
      setSaving(false);
    }
  };

  const setAccountActive = async (account: AdminAccount) => {
    setSaving(true);
    setError("");
    try {
      await apiPatch(`/api/admin/accounts/${encodeURIComponent(account.id)}`, { active: !account.active });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update College Admin account.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (accountId: string) => {
    setSaving(true);
    setError("");
    try {
      await apiPost(`/api/admin/accounts/${encodeURIComponent(accountId)}/reset-password`, { password: resetPassword });
      setResetId(null);
      setResetPassword("");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset the account password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-8 rounded-xl border border-blue-500/30 bg-slate-800/50 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">College Admin Accounts</h2>
        <p className="mt-1 text-sm text-slate-400">Create and manage College Admin access. Passwords are never displayed.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}

      <form onSubmit={changeSuperAdminPassword} className="mb-6 grid gap-3 border-b border-slate-700 pb-6 md:grid-cols-3">
        <input
          aria-label="Current Super Admin password"
          type="password"
          autoComplete="current-password"
          required
          value={currentSuperAdminPassword}
          onChange={(event) => setCurrentSuperAdminPassword(event.target.value)}
          placeholder="Current Super Admin password"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <input
          aria-label="New Super Admin password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={200}
          required
          value={newSuperAdminPassword}
          onChange={(event) => setNewSuperAdminPassword(event.target.value)}
          placeholder="New password (12+ chars)"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={saving || newSuperAdminPassword.length < 12}
          className="rounded-lg border border-blue-500/50 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-blue-950/50 disabled:opacity-50"
        >
          Change Super Admin Password
        </button>
      </form>

      <form onSubmit={createAccount} className="mb-6 grid gap-3 md:grid-cols-4">
        <input
          aria-label="College Admin name"
          autoComplete="name"
          required
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <input
          aria-label="College Admin email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <input
          aria-label="Temporary College Admin password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={200}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Initial password (12+ chars)"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Create College Admin
        </button>
      </form>

      {loading ? <p className="text-sm text-slate-400">Loading accounts...</p> : (
        <div className="space-y-3">
          {accounts.filter((account) => account.role === "college_admin").length === 0 && (
            <p className="text-sm text-slate-400">No College Admin accounts have been created.</p>
          )}
          {accounts.filter((account) => account.role === "college_admin").map((account) => (
            <div key={account.id} className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-white">{account.name}</p>
                <p className="text-sm text-slate-400">{account.email}</p>
                <p className={`mt-1 text-xs font-semibold ${account.active ? "text-emerald-400" : "text-amber-400"}`}>
                  {account.active ? "Active" : "Deactivated"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void setAccountActive(account)}
                  className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                >
                  {account.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => { setResetId(resetId === account.id ? null : account.id); setResetPassword(""); }}
                  className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                >
                  Reset password
                </button>
                {resetId === account.id && (
                  <div className="flex w-full gap-2 md:w-auto">
                    <input
                      aria-label={`New password for ${account.email}`}
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={200}
                      value={resetPassword}
                      onChange={(event) => setResetPassword(event.target.value)}
                      placeholder="New password (12+ chars)"
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white md:w-56"
                    />
                    <button
                      type="button"
                      disabled={saving || resetPassword.length < 12}
                      onClick={() => void changePassword(account.id)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
