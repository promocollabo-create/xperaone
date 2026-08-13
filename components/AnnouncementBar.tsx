export default function AnnouncementBar({
  text,
  bg,
  color,
}: {
  text: string;
  bg: string;
  color: string;
}) {
  return (
    <div style={{ background: bg, color }} className="announcement-bar">
      <p>{text}</p>
      <style>{`
        .announcement-bar {
          text-align: center;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 500;
        }
        .announcement-bar p { color: inherit; }
      `}</style>
    </div>
  );
}
