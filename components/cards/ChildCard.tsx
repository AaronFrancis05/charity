"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { computeAge } from "@/lib/utils";
import type { ChildWithFunding } from "@/actions/children";

interface ChildCardProps {
  child: ChildWithFunding;
  priority?: boolean;
}

export function ChildCard({ child, priority = false }: ChildCardProps) {
  const age = computeAge(child.date_of_birth);

  const quote = child.narrative
    ? child.narrative.split(/[.!?]/)[0].trim().substring(0, 110)
    : "";

  return (
    <Link
      href={`/sponsor/${child.id}`}
      className="block bg-[--color-surface] rounded-[--radius-xl] border border-[--color-border] shadow-sm hover:shadow-[--shadow-card-hover] hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
    >
      {/* Zone 1: Image with gradient overlay */}
      <div className="relative h-56 bg-[--color-surface-muted] overflow-hidden">
        {child.profile_image_url ? (
          <Image
            src={child.profile_image_url}
            alt={child.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-[--color-text-muted]">
              {child.name[0]}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge — top-left */}
        <div className="absolute top-3 left-3">
          <Badge variant="success">Available</Badge>
        </div>

        {/* Video play icon — top-right */}
        {child.video_url && (
          <div className="absolute top-3 right-3 bg-black/50 rounded-full w-9 h-9 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        )}

        {/* Name + Age — bottom-left over gradient */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-lg font-bold drop-shadow-sm">
            {child.name}, {age}
          </h3>
        </div>
      </div>

      {/* Zone 2: Video label */}
      {child.video_url && (
        <div className="px-4 pt-3 flex items-center gap-1.5">
          <Play className="w-3 h-3 text-[--color-brand-purple]" />
          <span className="text-xs text-[--color-brand-purple] font-medium">
            Watch video
          </span>
        </div>
      )}

      {/* Zone 3: Footer */}
      <div className="p-4 flex flex-col gap-2">
        {/* Region */}
        <p className="text-xs text-[--color-text-secondary]">
          {child.region}
        </p>

        {/* Quote preview */}
        {quote && (
          <p className="text-sm text-[--color-text-secondary] italic leading-relaxed line-clamp-2">
            &ldquo;{quote}.&rdquo;
          </p>
        )}

        {/* Two CTA buttons */}
        <div className="flex gap-2 mt-auto pt-2">
          <span
            className="flex-1 text-center bg-[--color-brand-purple] text-white text-sm font-semibold py-2.5 rounded-[--radius-md] hover:bg-[--color-brand-purple-dark] transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/sponsor/${child.id}`;
            }}
          >
            Walk with {child.name.split(" ")[0]}
          </span>
          <span
            className="flex-1 text-center border border-[--color-border] text-[--color-text-primary] text-sm font-semibold py-2.5 rounded-[--radius-md] hover:bg-[--color-surface-secondary] transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/sponsor/${child.id}/donate`;
            }}
          >
            Quick Donate
          </span>
        </div>
      </div>
    </Link>
  );
}
