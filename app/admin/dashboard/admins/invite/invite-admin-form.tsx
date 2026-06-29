
"use client";

import { useFormState } from "react-dom";
import { inviteAdmin } from "@/actions/admins";
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
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const initialState = {
  success: false,
  error: null,
};

export function InviteAdminForm() {
  const [state, formAction] = useFormState(inviteAdmin, initialState);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formKey, setFormKey] = useState(0);

  const handleFormReset = () => {
    setFormKey((prev) => prev + 1);
    setTurnstileToken("");
  };

  return (
    <>
      {state.success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">Invite Sent</h3>
            <p className="text-sm text-green-700 mt-1">
              The invitation email has been sent successfully.
            </p>
          </div>
        </div>
      )}
      {state.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{state.error}</p>
          </div>
        </div>
      )}
      <form
        key={formKey}
        action={(formData) => {
          formData.append("cf-turnstile-response", turnstileToken);
          formAction(formData);
          if (state.success) {
            handleFormReset();
          }
        }}
        className="max-w-md space-y-4"
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
