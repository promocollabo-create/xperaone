export default function AnnouncementBar({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled || !text) return null;
  return (
    <div className="xp-gradient-bg text-white text-xs sm:text-sm font-medium">
      <div className="xp-container py-2 text-center truncate">{text}</div>
    </div>
  );
}
