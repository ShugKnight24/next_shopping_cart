import Link from 'next/link';

const socialLinks = [
  {
    href: 'https://facebook.com/#',
    className: 'fab fa-facebook-square facebook',
    label: 'Facebook',
  },
  {
    href: 'https://discord.com/#',
    className: 'fab fa-discord discord',
    label: 'Discord',
  },
  {
    href: 'https://instagram.com/#',
    className: 'fab fa-instagram instagram',
    label: 'Instagram',
  },
  {
    href: 'https://linkedin.com/#',
    className: 'fab fa-linkedin linkedin',
    label: 'LinkedIn',
  },
  {
    href: 'https://pinterest.com/#',
    className: 'fab fa-pinterest-square pinterest',
    label: 'Pinterest',
  },
  {
    href: 'https://tiktok.com/#',
    className: 'fab fa-tiktok tiktok',
    label: 'TikTok',
  },
  {
    href: 'https://twitch.com/#',
    className: 'fab fa-twitch twitch',
    label: 'Twitch',
  },
  {
    href: 'https://twitter.com/#',
    className: 'fab fa-twitter-square twitter',
    label: 'Twitter',
  },
  {
    href: 'https://youtube.com/#',
    className: 'fab fa-youtube youtube',
    label: 'YouTube',
  },
];

export function SocialIcons() {
  return (
    <div className="social-icons-container">
      {socialLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          rel="noopener noreferrer"
          target="_blank"
          aria-label={link.label}
        >
          <i className={link.className} />
        </Link>
      ))}
    </div>
  );
}
