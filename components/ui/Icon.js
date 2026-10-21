const PATHS = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />,
  store: <path d="M4 10h16M6 10v10h12V10M5 4h14l1 6H4l1-6Z" />,
  pin: <><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
  menu: <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></>,
  whatsapp: <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />,
  eye: <><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  camera: <><path d="M4 7h3l1.2-2h7.6L17 7h3v12H4Z" /><circle cx="12" cy="13" r="3.5" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  star: <path d="m12 3 2.7 5.4 6 .9-4.3 4.2 1 5.9-5.4-2.8-5.4 2.8 1-5.9-4.3-4.2 6-.9z" />,
  check: <path d="m5 12 5 5 9-10" />,
  alert: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4m0 4h.01" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  delivery: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  wallet: <><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4Z" /><path d="M4 7V6a2 2 0 0 1 2-2h10" /><circle cx="16" cy="13.5" r="1.2" /></>,
  share:<><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></>,
  burger: <path d="M4 11h16M6 11a6 6 0 0 1 12 0M5 15h14l-1 3H6l-1-3Z" />,
  cup: <><path d="M7 4h10l-1 16H8L7 4Z" /><path d="M7.5 9h9" /></>,
  ice: <><path d="M7 10h10l-2 10H9L7 10Z" /><path d="M8 10a4 4 0 0 1 8 0" /></>,
  soup: <><path d="M5 12h14v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-3Z" /><path d="M9 4c0 2 2 2 2 4M14 4c0 2 2 2 2 4" /></>,
  grill: <><path d="M4 18 18 4" /><circle cx="9" cy="13" r="2" /><circle cx="13" cy="9" r="2" /></>,
  plate: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3" /></>,
}

export default function Icon({ name, size = 20, strokeWidth = 2, className = '', fill = 'none' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {PATHS[name]}
    </svg>
  )
}
