"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createChild, updateChild, uploadChildMedia } from "@/actions/children";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Video } from "lucide-react";
import type { ChildProfile } from "@/actions/children";

const REGION_OPTIONS = [
  { value: "Kampala", label: "Kampala" },
  { value: "Gulu", label: "Gulu" },
  { value: "Jinja", label: "Jinja" },
  { value: "Mbale", label: "Mbale" },
  { value: "Mbarara", label: "Mbarara" },
  { value: "Other", label: "Other" },
];

interface ProfileFormProps {
  child?: ChildProfile;
  mode: "create" | "edit";
}

// Shared field label, matching the className pattern already used below
// for the image/video upload labels in this same file.
function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <span className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
      {children}
      {hint ? (
        <span className="block text-xs font-normal text-[var(--color-text-muted)] mt-0.5">
          {hint}
        </span>
      ) : null}
    </span>
  );
}

export function ProfileForm({ child, mode }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(child?.profile_image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(child?.video_url ?? "");
  const [region, setRegion] = useState(child?.region ?? "");

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const result = await uploadChildMedia(fd, type);
    setImageUploading(false);

    if (!result.success) {
      setError(result.error ?? "Upload failed");
    } else if (result.data) {
      if (type === "image") setImageUrl(result.data.url);
      else setVideoUrl(result.data.url);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const input = {
      ...(mode === "edit" && child ? { id: child.id } : {}),
      name: fd.get("name") as string,
      date_of_birth: fd.get("date_of_birth") as string,
      region,
      narrative: fd.get("narrative") as string,
      goal_monthly_ugx: Number(fd.get("goal_monthly_ugx")),
      profile_image_url: imageUrl || "https://placeholder.openheartsfoundation.org/child.jpg",
      video_url: videoUrl || null,
    };

    setError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createChild(input as any)
          : await updateChild(input as any);

      if (result.success) {
        if (mode === "create" && result.data) {
          router.push(`/admin/dashboard/children/${result.data.id}/edit`);
        } else {
          router.push("/admin/dashboard/children");
        }
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-4 py-3">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <FieldLabel>Full name</FieldLabel>
          <Input
            name="name"
            defaultValue={child?.name}
            required
            placeholder="e.g. Grace Nakato"
          />
        </label>
        <label className="block">
          <FieldLabel>Date of birth</FieldLabel>
          <Input
            name="date_of_birth"
            type="date"
            defaultValue={child?.date_of_birth}
            required
          />
        </label>
      </div>

      <div>
        <FieldLabel>Region</FieldLabel>
        <Select
          name="region"
          value={region}
          onValueChange={(value) => setRegion(value as string)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select region..." />
          </SelectTrigger>
          <SelectContent>
            {REGION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="block">
        <FieldLabel hint="Minimum 50 characters. Be specific about the child's story and needs.">
          Biographical narrative
        </FieldLabel>
        <Textarea
          name="narrative"
          defaultValue={child?.narrative}
          rows={6}
          placeholder="Describe the child's background, current situation, and specific needs..."
          required
          minLength={50}
        />
      </label>

      <label className="block">
        <FieldLabel hint="Total monthly sponsorship goal in UGX">
          Monthly sponsorship goal (UGX)
        </FieldLabel>
        <Input
          name="goal_monthly_ugx"
          type="number"
          min={5000}
          defaultValue={child?.goal_monthly_ugx}
          placeholder="500000"
          required
        />
      </label>

      {/* Image upload */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <ImageIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Profile photo
          </span>
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Profile preview"
            className="w-24 h-24 rounded-[var(--radius-lg)] object-cover mb-2 border border-[var(--color-border)]"
          />
        )}
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
          <Upload className="w-4 h-4" />
          <span>Choose image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "image")}
            className="sr-only"
          />
        </label>
        {imageUploading && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Uploading...</p>
        )}
      </div>

      {/* Video upload */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Video className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Profile video{" "}
            <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
          </span>
        </div>
        {videoUrl && (
          <p className="text-xs text-[var(--color-success)] mb-1 flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />
            Video uploaded
          </p>
        )}
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">
          <Upload className="w-4 h-4" />
          <span>Choose video</span>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e, "video")}
            className="sr-only"
          />
        </label>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          16:9 recommended. No audio autoplay.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="default" loading={isPending}>
          {mode === "create" ? "Create profile" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/dashboard/children")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
