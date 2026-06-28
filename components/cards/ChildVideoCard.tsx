export function ChildVideoCard({ videoUrl, childName }: { videoUrl: string; childName: string }) {
  return (
    <div className="relative aspect-video rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-muted)]">
      <video
        src={videoUrl}
        controls
        muted
        playsInline
        className="w-full h-full object-cover"
        aria-label={`${childName} profile video`}
      />
    </div>
  );
}
