"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAdminProfile, uploadAdminAvatar } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Save } from "lucide-react";

interface ProfileSettingsFormProps {
  adminId: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

function AvatarDisplay({ name, email, url }: { name: string; email: string; url?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt="Avatar"
        className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-border)]"
      />
    );
  }
  const letter = (name || email).charAt(0).toUpperCase();
  return (
    <div className="w-20 h-20 rounded-full bg-[var(--color-brand-purple-light)] text-[var(--color-brand-purple)] flex items-center justify-center text-3xl font-bold border-2 border-[var(--color-border)]">
      {letter}
    </div>
  );
}

export function ProfileSettingsForm({ adminId, email, name, role, avatarUrl: initialAvatar }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(name);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatar);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const result = await uploadAdminAvatar(fd);
    setAvatarUploading(false);

    if (result.success && result.data) {
      setAvatarUrl(result.data.url);
    } else {
      setError(result.error ?? "Upload failed");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateAdminProfile({
        name: displayName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });

      if (result.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-4 py-3">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-[var(--color-success-bg)] border border-[var(--color-success)] rounded-[var(--radius-md)] px-4 py-3">
          <p className="text-sm text-[var(--color-success)]">Profile saved successfully.</p>
        </div>
      )}

      {/* Avatar */}
      <div>
        <label className="text-sm font-medium text-[var(--color-foreground)] block mb-3">
          Profile photo
        </label>
        <div className="flex items-center gap-4">
          <AvatarDisplay name={displayName || name} email={email} url={avatarUrl} />
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
            <Upload className="w-4 h-4" />
            <span>{avatarUploading ? "Uploading..." : "Upload photo"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="sr-only"
              disabled={avatarUploading}
            />
          </label>
        </div>
      </div>

      {/* Email (read-only) */}
      <label className="block">
        <span className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
          Email address
        </span>
        <Input value={email} disabled className="opacity-60" />
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Email cannot be changed</p>
      </label>

      {/* Display name */}
      <label className="block">
        <span className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
          Display name
        </span>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </label>

      {/* Role (read-only) */}
      <label className="block">
        <span className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
          Role
        </span>
        <Input value={role.replace("_", " ")} disabled className="opacity-60 capitalize" />
      </label>

      <div className="pt-2">
        <Button type="submit" variant="default" loading={isPending}>
          <Save className="w-4 h-4" />
          Save changes
        </Button>
      </div>
    </form>
  );
}
