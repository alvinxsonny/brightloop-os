"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Users, UserPlus, Shield, Briefcase, Mail, Phone, Lock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminStaffPage() {
  const [user, setUser] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("StaffPass@2026");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndStaff();
  }, []);

  const fetchUserAndStaff = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      setUser(userData.user);

      const staffRes = await fetch("/api/admin/staff");
      const staffData = await staffRes.json();
      if (staffRes.ok) {
        setStaffList(staffData.staffMembers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add staff member.");
      }

      setFormSuccess(`Staff member ${data.staff.name} added successfully!`);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("StaffPass@2026");
      fetchUserAndStaff();
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Admin Privilege Only
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Staff Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Only administrators can provision new internal staff accounts to operate Brightloop.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">Internal Team Members ({staffList.length})</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Provisioned On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Loading team members...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  staffList.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                      <td className="px-6 py-4 text-slate-600">{member.email}</td>
                      <td className="px-6 py-4">
                        {member.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <Shield className="w-3 h-3 text-purple-600" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Briefcase className="w-3 h-3 text-blue-600" />
                            Staff
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{member.phone || "—"}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(member.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Staff Member</h3>
                <p className="text-xs text-slate-500">Grant internal staff operations access</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@brightloop.io"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0144"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Initial Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Must meet security criteria (&gt;8 chars, uppercase, lowercase, special char).</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Adding..." : "Add Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
