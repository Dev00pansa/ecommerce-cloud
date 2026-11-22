"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Pencil,
  User as UserIcon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  evaluatePasswordStrength,
  translateSupabaseError,
  validateUsername,
} from "@/lib/auth";
import type { AppLanguage } from "@/types";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  initialEmail?: string | null;
  language: AppLanguage;
  onChangeLanguage: (next: AppLanguage) => void;
  onUsernameUpdated: (nextUsername: string) => void;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  username,
  initialEmail = null,
  language,
  onChangeLanguage,
  onUsernameUpdated,
}: AccountSettingsModalProps) {
  const router = useRouter();
  const isEn = language === "en";

  const [resolvedEmail, setResolvedEmail] = useState<string>(initialEmail ?? "");
  const [editingUsername, setEditingUsername] = useState(false);
  const [nextUsername, setNextUsername] = useState(username);
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingUsername && !savingPassword) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, savingUsername, savingPassword, onClose]);

  useEffect(() => {
    if (!isOpen || resolvedEmail) return;

    let cancelled = false;
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user?.email) {
        setResolvedEmail(data.user.email);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, resolvedEmail]);

  if (!isOpen) {
    return null;
  }

  function startEditUsername() {
    setNextUsername(username);
    setUsernameError(null);
    setUsernameSuccess(null);
    setEditingUsername(true);
  }

  function cancelEditUsername() {
    setNextUsername(username);
    setUsernameError(null);
    setEditingUsername(false);
  }

  async function handleSaveUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingUsername) return;

    setUsernameError(null);
    setUsernameSuccess(null);

    const check = validateUsername(nextUsername);
    if (!check.valid) {
      setUsernameError(
        isEn
          ? "Username must be 4–20 characters using A-Z, a-z, 0-9, or _ only."
          : check.error
      );
      return;
    }

    if (check.normalized === username) {
      setEditingUsername(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setUsernameError(
        isEn ? "Cloud service is not configured." : "ยังไม่ได้ตั้งค่าระบบ Cloud"
      );
      return;
    }

    setSavingUsername(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsernameError(
          isEn ? "Session expired. Please sign in again." : "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"
        );
        return;
      }

      const { data: available, error: rpcError } = await supabase.rpc(
        "check_username_available",
        { p_username: check.normalized }
      );

      if (rpcError) {
        setUsernameError(translateSupabaseError(rpcError));
        return;
      }

      if (available !== true) {
        setUsernameError(
          isEn
            ? "This username is already taken. Please choose another."
            : "ชื่อผู้ใช้นี้มีคนใช้งานแล้ว กรุณาเลือกชื่ออื่น"
        );
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username: check.normalized })
        .eq("id", user.id);

      if (profileError) {
        setUsernameError(translateSupabaseError(profileError));
        return;
      }

      const { error: authMetaError } = await supabase.auth.updateUser({
        data: { username: check.normalized },
      });

      if (authMetaError) {
        setUsernameError(translateSupabaseError(authMetaError));
        return;
      }

      onUsernameUpdated(check.normalized);
      setEditingUsername(false);
      setUsernameSuccess(
        isEn
          ? "Username updated successfully."
          : "อัปเดตชื่อผู้ใช้เรียบร้อยแล้ว"
      );
      router.refresh();
    } catch (err) {
      setUsernameError(translateSupabaseError(err));
    } finally {
      setSavingUsername(false);
    }
  }

  function toggleEditPassword() {
    setEditingPassword((prev) => !prev);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setPasswordError(null);
    setPasswordSuccess(null);
  }

  async function handleSavePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingPassword) return;

    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError(
        isEn
          ? "New password must be at least 6 characters."
          : "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
      );
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 2) {
      setPasswordError(
        isEn
          ? "Password is too weak. Mix letters with numbers or symbols."
          : "รหัสผ่านไม่ปลอดภัย กรุณาผสมตัวอักษรกับตัวเลขหรือสัญลักษณ์"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        isEn
          ? "Passwords do not match."
          : "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน"
      );
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setPasswordError(
        isEn ? "Cloud service is not configured." : "ยังไม่ได้ตั้งค่าระบบ Cloud"
      );
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(translateSupabaseError(error));
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setEditingPassword(false);
      setPasswordSuccess(
        isEn
          ? "Password updated successfully."
          : "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"
      );
    } catch (err) {
      setPasswordError(translateSupabaseError(err));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !savingUsername && !savingPassword) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-zinc-800 bg-[#070707] text-zinc-100 shadow-[0_0_50px_-12px_rgba(16,185,129,0.22)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/75 to-transparent"
        />

        <div className="flex items-center justify-between border-b border-zinc-800/90 px-6 py-5">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
              {isEn ? "KhumLab Account" : "การตั้งค่าบัญชี KhumLab"}
            </span>
            <h2
              id="account-settings-title"
              className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-white"
            >
              {isEn ? "Account Settings" : "ตั้งค่าบัญชีและความปลอดภัย"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={savingUsername || savingPassword}
            aria-label={isEn ? "Close settings" : "ปิดหน้าต่างตั้งค่า"}
            className="p-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-800/90 px-6 py-2">
          <section className="py-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-zinc-400">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isEn ? "01 — Language" : "01 — การตั้งค่าภาษา"}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onChangeLanguage("th")}
                className={`flex items-center justify-between border px-4 py-3 text-sm font-medium transition-colors ${
                  language === "th"
                    ? "border-emerald-500/70 bg-emerald-950/30 text-emerald-300"
                    : "border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span>ภาษาไทย (TH)</span>
                {language === "th" && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onChangeLanguage("en")}
                className={`flex items-center justify-between border px-4 py-3 text-sm font-medium transition-colors ${
                  language === "en"
                    ? "border-emerald-500/70 bg-emerald-950/30 text-emerald-300"
                    : "border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span>English (EN)</span>
                {language === "en" && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </button>
            </div>
          </section>

          <section className="py-5 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-zinc-400">
              <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {isEn
                  ? "02 — Account & Password"
                  : "02 — ข้อมูลบัญชีและความปลอดภัย"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>{isEn ? "Username" : "ชื่อผู้ใช้ (Username)"}</span>
                  </span>
                  {!editingUsername && (
                    <p className="mt-1 text-base font-semibold text-zinc-100 truncate">
                      {username}
                    </p>
                  )}
                </div>

                {!editingUsername && (
                  <button
                    type="button"
                    onClick={startEditUsername}
                    className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-white/[0.04] hover:text-emerald-300"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>{isEn ? "Edit Username" : "แก้ไขชื่อผู้ใช้"}</span>
                  </button>
                )}
              </div>

              {editingUsername && (
                <form
                  onSubmit={handleSaveUsername}
                  className="space-y-3 border border-zinc-800 bg-black/80 p-4"
                >
                  <div className="space-y-1.5">
                    <label
                      htmlFor="settings-username-input"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      {isEn
                        ? "New Username (Case-Sensitive: A-Z, a-z, 0-9, _)"
                        : "ชื่อผู้ใช้ใหม่ (ตรงตัวพิมพ์เล็ก-ใหญ่: A-Z, a-z, 0-9, _)"}
                    </label>
                    <input
                      id="settings-username-input"
                      type="text"
                      maxLength={20}
                      required
                      value={nextUsername}
                      onChange={(e) => setNextUsername(e.target.value)}
                      disabled={savingUsername}
                      className="w-full border border-zinc-800 bg-[#050505] px-3.5 py-2.5 text-sm font-mono text-zinc-100 focus:border-emerald-400 focus:outline-none disabled:opacity-60"
                    />
                  </div>

                  {usernameError && (
                    <p className="flex items-start gap-1.5 text-xs text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{usernameError}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={cancelEditUsername}
                      disabled={savingUsername}
                      className="px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
                    >
                      {isEn ? "Cancel" : "ยกเลิก"}
                    </button>
                    <button
                      type="submit"
                      disabled={savingUsername}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {savingUsername && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      <span>
                        {savingUsername
                          ? isEn
                            ? "Saving..."
                            : "กำลังบันทึก..."
                          : isEn
                            ? "Save Username"
                            : "บันทึกชื่อผู้ใช้"}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {usernameSuccess && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{usernameSuccess}</span>
                </p>
              )}
            </div>

            <div className="border-t border-zinc-900 pt-4">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Mail className="h-3.5 w-3.5" />
                <span>{isEn ? "Email Address" : "อีเมลที่ผูกกับบัญชี"}</span>
              </span>
              <p className="mt-1 text-sm font-mono text-zinc-200 break-all">
                {resolvedEmail || "—"}
              </p>
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{isEn ? "Password" : "รหัสผ่าน"}</span>
                  </span>
                  <p className="font-mono text-base tracking-widest text-zinc-200">
                    ••••••••••••
                  </p>
                  <p className="text-[11px] leading-relaxed text-zinc-500">
                    {isEn
                      ? "Passwords are encrypted one-way in our database for security and cannot be retrieved as plain text."
                      : "ระบบเข้ารหัสรหัสผ่านแบบทางเดียวเพื่อความปลอดภัยสูงสุด จึงไม่สามารถดึงรหัสผ่านเดิมมาแสดงเป็นตัวอักษรได้"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleEditPassword}
                  className="shrink-0 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-white/[0.04] hover:text-emerald-300"
                >
                  {editingPassword
                    ? isEn
                      ? "Cancel"
                      : "ยกเลิก"
                    : isEn
                      ? "Change Password"
                      : "เปลี่ยนรหัสผ่าน"}
                </button>
              </div>

              {editingPassword && (
                <form
                  onSubmit={handleSavePassword}
                  className="space-y-3.5 border border-zinc-800 bg-black/80 p-4"
                >
                  <div>
                    <label
                      htmlFor="settings-new-password"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      {isEn ? "New Password" : "รหัสผ่านใหม่"}
                    </label>
                    <div className="relative">
                      <input
                        id="settings-new-password"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        maxLength={128}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={
                          isEn
                            ? "Enter new password (min 6 chars)"
                            : "กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                        }
                        disabled={savingPassword}
                        className="w-full border border-zinc-800 bg-[#050505] pl-3.5 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-400 focus:outline-none disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={
                          showNewPassword
                            ? isEn
                              ? "Hide password"
                              : "ซ่อนรหัสผ่าน"
                            : isEn
                              ? "Show password"
                              : "แสดงรหัสผ่าน"
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={newPassword} />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-confirm-password"
                      className="block text-xs font-medium text-zinc-300 mb-1.5"
                    >
                      {isEn
                        ? "Confirm New Password"
                        : "ยืนยันรหัสผ่านใหม่อีกครั้ง"}
                    </label>
                    <input
                      id="settings-confirm-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      maxLength={128}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={
                        isEn
                          ? "Re-enter new password"
                          : "พิมพ์รหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                      }
                      disabled={savingPassword}
                      className="w-full border border-zinc-800 bg-[#050505] px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-400 focus:outline-none disabled:opacity-60"
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="mt-1.5 text-[11px] font-medium text-rose-400">
                        {isEn
                          ? "Passwords do not match"
                          : "รหัสผ่านใหม่ยังไม่ตรงกัน"}
                      </p>
                    )}
                  </div>

                  {passwordError && (
                    <p className="flex items-start gap-1.5 text-xs text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{passwordError}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={toggleEditPassword}
                      disabled={savingPassword}
                      className="px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
                    >
                      {isEn ? "Cancel" : "ยกเลิก"}
                    </button>
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {savingPassword && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      <span>
                        {savingPassword
                          ? isEn
                            ? "Updating..."
                            : "กำลังบันทึก..."
                          : isEn
                            ? "Update Password"
                            : "บันทึกรหัสผ่านใหม่"}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {passwordSuccess && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{passwordSuccess}</span>
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
