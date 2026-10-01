import type { IconName } from "../types/navigation";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

const paths: Record<IconName, React.ReactNode> = {
  home: <><path fill="none" d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path fill="none" d="M9 21v-6h6v6" /></>,
  assets: <><rect fill="none" x="3" y="3" width="7" height="7" rx="1" /><rect fill="none" x="14" y="3" width="7" height="7" rx="1" /><rect fill="none" x="3" y="14" width="7" height="7" rx="1" /><rect fill="none" x="14" y="14" width="7" height="7" rx="1" /></>,
  brand: <><path fill="none" d="M4 20c0-5.2 3.6-9.5 8-9.5s8 4.3 8 9.5" /><path fill="none" d="M7 9.3a5 5 0 0 1 10 0" /><path fill="none" d="M12 4v7" /><circle fill="none" cx="12" cy="17" r="1.5" /></>,
  palette: <><path fill="none" d="M12 3a9 9 0 1 0 0 18h1.1c1.1 0 1.7-1.3 1-2.1-.5-.5-.1-1.4.6-1.4H16a5 5 0 0 0 0-10h-4Z" /><circle fill="none" cx="7.5" cy="11" r="1" /><circle fill="none" cx="10" cy="7" r="1" /><circle fill="none" cx="15" cy="8" r="1" /></>,
  type: <><path fill="none" d="M4 5h16" /><path fill="none" d="M12 5v14" /><path fill="none" d="M8 19h8" /></>,
  audio: <><path fill="none" d="M4 10v4" /><path fill="none" d="M8 7v10" /><path fill="none" d="M12 4v16" /><path fill="none" d="M16 7v10" /><path fill="none" d="M20 10v4" /></>,
  graphics: <><rect fill="none" x="3" y="4" width="18" height="16" rx="2" /><path fill="none" d="m7 16 3-3 2.5 2.5L16 11l3 5" /><circle fill="none" cx="8" cy="9" r="1.2" /></>,
  motion: <><path fill="none" d="M4 6h16" /><path fill="none" d="M4 12h11" /><path fill="none" d="M4 18h16" /><path fill="none" d="m16 9 4 3-4 3" /></>,
  template: <><rect fill="none" x="4" y="3" width="16" height="18" rx="2" /><path fill="none" d="M8 8h8M8 12h8M8 16h5" /></>,
  sliders: <><path fill="none" d="M4 7h16" /><path fill="none" d="M4 17h16" /><circle fill="none" cx="9" cy="7" r="2" /><circle fill="none" cx="15" cy="17" r="2" /></>,
  package: <><path fill="none" d="m4 7 8-4 8 4-8 4-8-4Z" /><path fill="none" d="M4 7v10l8 4 8-4V7" /><path fill="none" d="M12 11v10" /></>,
  star: <path fill="none" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  clock: <><circle fill="none" cx="12" cy="12" r="9" /><path fill="none" d="M12 7v5l3.5 2" /></>,
  settings: <><circle fill="none" cx="12" cy="12" r="3" /><path fill="none" d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5.3v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  chevronLeft: <path fill="none" d="m15 18-6-6 6-6" />,
  chevronRight: <path fill="none" d="m9 18 6-6-6-6" />,
  search: <><circle fill="none" cx="11" cy="11" r="6" /><path fill="none" d="m16 16 4 4" /></>,
  chevronDown: <path fill="none" d="m6 9 6 6 6-6" />,
  plus: <><path fill="none" d="M12 5v14" /><path fill="none" d="M5 12h14" /></>,
  folder: <path fill="none" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  grid: <><rect fill="none" x="4" y="4" width="6" height="6" rx="1" /><rect fill="none" x="14" y="4" width="6" height="6" rx="1" /><rect fill="none" x="4" y="14" width="6" height="6" rx="1" /><rect fill="none" x="14" y="14" width="6" height="6" rx="1" /></>,
  list: <><path fill="none" d="M9 6h11M9 12h11M9 18h11" /><path fill="none" d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  filter: <path fill="none" d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />,
  sort: <><path fill="none" d="M8 4v16" /><path fill="none" d="m5 7 3-3 3 3" /><path fill="none" d="M16 20V4" /><path fill="none" d="m13 17 3 3 3-3" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  command: <><path fill="none" d="M8 9a3 3 0 1 1-3-3 3 3 0 0 1 3 3v6a3 3 0 1 1-3-3h14a3 3 0 1 1-3 3V9a3 3 0 1 1 3 3H5" /></>,
  info: <><circle fill="none" cx="12" cy="12" r="9" /><path fill="none" d="M12 11v5" /><path fill="none" d="M12 8h.01" /></>,
  arrowUpRight: <><path fill="none" d="M7 17 17 7" /><path fill="none" d="M9 7h8v8" /></>,
  x: <><path fill="none" d="m6 6 12 12" /><path fill="none" d="m18 6-12 12" /></>,
};

export function Icon({ name, size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}
