
"use client";

import { useActionState } from "react";
import { inviteAdmin, InviteAdminState } from "@/actions/admins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnstileWidget } from "@/components/donation/TurnstileWidget";
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const initialState: InviteAdminState = {
  success: false,
  error: null,
};

export function InviteAdminForm() {
  const [state, formAction] = useActionState(inviteAdmin, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setFormKey((prev) => prev + 1);
      setTurnstileToken("");
    }
  }, [state.success]);

  return (
    <>
      {state.success && (
        <div className="mb-4 bg-[var(--color-success-lightest)] border border-[var(--color-success)] rounded-[var(--radius-md)] p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-[var(--color-success)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-success-dark)]">Invite Sent</h3>
            <p className="text-sm text-[var(--color-success-dark)] mt-1">
              The invitation email has been sent successfully.
            </p>
          </div>
        </div>
      )}
      {state.error && (
        <div className="mb-4 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--color-error)] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-error)]">Error</h3>
            <p className="text-sm text-[var(--color-error)] mt-1">{state.error}</p>
          </div>
        </div>
      )}
      <form
        key={formKey}
        action={(formData) => {
          formData.append("cf-turnstile-response", turnstileToken);
          formAction(formData);
        }}
        className="max-w-md space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-primary)]">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[var(--color-text-primary)]">
            Role
          </label>
          <Select name="role" required>
            <SelectTrigger id="role" className="mt-1">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="content_admin">Content Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TurnstileWidget onVerify={setTurnstileToken} />
        <Button type="submit" disabled={!turnstileToken}>
          Send Invitation
        </Button>
      </form>
    </>
  );
}
