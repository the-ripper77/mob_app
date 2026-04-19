export function timeAgo(createdAt: number): string {
  const sec = Math.floor((Date.now() - createdAt) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return new Date(createdAt).toLocaleDateString();
}
