export default function StampBadge({ status, label }) {
  const cls = `km-stamp km-stamp--${status}`;
  return <span className={cls}>{label || status?.replace(/_/g, " ")}</span>;
}
