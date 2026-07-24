import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../common/Card";
import Button from "../Button";
import { Input } from "../common/Field";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const AccountSection = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", text: "Could not sign you out. Please try again." });
    }
  }

  // Supabase sends a recovery link rather than changing the password inline,
  // which also covers users who signed up through Google.
  async function handlePasswordReset() {
    setSending(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;

      setStatus({
        type: "success",
        text: `We've sent a password reset link to ${user.email}.`,
      });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", text: error.message || "Could not send the reset email." });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card title="Account & Security" subtitle="Manage your account settings">
      <div className="space-y-5">

        <Input
          label="Email Address"
          hint="Managed by your login provider"
          name="email"
          type="email"
          value={user?.email || ""}
          readOnly
          disabled
        />

        {status && (
          <p
            className={`rounded-xl border px-4 py-2.5 text-sm ${
              status.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {status.text}
          </p>
        )}

        <Button
          variant="secondary"
          className="w-full py-3"
          onClick={handlePasswordReset}
          disabled={sending}
        >
          {sending ? "Sending reset link…" : "Send Password Reset Link"}
        </Button>

        <Button onClick={handleSignOut} variant="danger" className="w-full py-3">
          Sign Out
        </Button>

      </div>
    </Card>
  );
};

export default AccountSection;
