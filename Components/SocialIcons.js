import Link from 'next/link';

import { XLogo } from './Logos/XLogo';
import {
  FacebookIcon,
  DiscordIcon,
  InstagramIcon,
  LinkedInIcon,
  PinterestIcon,
  TikTokIcon,
  TwitchIcon,
  YouTubeIcon,
} from './Icons';

// Globe/Connect icon
function ConnectIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const socialLinks = [
  {
    href: 'https://facebook.com/#',
    label: 'Facebook',
    className: 'facebook',
    Icon: FacebookIcon,
  },
  {
    href: 'https://discord.com/#',
    label: 'Discord',
    className: 'discord',
    Icon: DiscordIcon,
  },
  {
    href: 'https://instagram.com/#',
    label: 'Instagram',
    className: 'instagram',
    Icon: InstagramIcon,
  },
  {
    href: 'https://linkedin.com/#',
    label: 'LinkedIn',
    className: 'linkedin',
    Icon: LinkedInIcon,
  },
  {
    href: 'https://pinterest.com/#',
    label: 'Pinterest',
    className: 'pinterest',
    Icon: PinterestIcon,
  },
  {
    href: 'https://tiktok.com/#',
    label: 'TikTok',
    className: 'tiktok',
    Icon: TikTokIcon,
  },
  {
    href: 'https://twitch.com/#',
    label: 'Twitch',
    className: 'twitch',
    Icon: TwitchIcon,
  },
  {
    href: 'https://youtube.com/#',
    label: 'YouTube',
    className: 'youtube',
    Icon: YouTubeIcon,
  },
  {
    href: 'https://x.com/#',
    label: 'X',
    className: 'x',
    Icon: XLogo,
  },
];

export function SocialIcons() {
  return (
    <div className="social-icons-section">
      <div className="social-heading">
        <span className="heading-icon">
          <ConnectIcon />
        </span>
        <div className="heading-text">
          <h4>Join the Community</h4>
          <span>Stay connected & inspired</span>
        </div>
      </div>
      <div className="social-icons-container">
        {socialLinks.map((link) => {
          const IconComponent = link.Icon;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={link.className}
              rel="noopener noreferrer"
              target="_blank"
              aria-label={link.label}
            >
              <IconComponent size={18} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
