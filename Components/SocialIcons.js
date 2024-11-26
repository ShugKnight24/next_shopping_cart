import Link from 'next/link';

export function SocialIcons() {
  return (
    <div className="social-icons-container">
      <Link href="https://facebook.com/#">
        <i className="fab fa-facebook-square facebook"></i>
      </Link>
      <Link href="https://instagram.com/#">
        <i className="fab fa-instagram instagram"></i>
      </Link>
      <Link href="https://linkedin.com/#">
        <i className="fab fa-linkedin linkedin"></i>
      </Link>
      <Link href="https://twitch.com/#">
        <i className="fab fa-twitch twitch"></i>
      </Link>
      <Link href="https://twitter.com/#">
        <i className="fab fa-twitter-square twitter"></i>
      </Link>
      <Link href="https://youtube.com/#">
        <i className="fab fa-youtube youtube"></i>
      </Link>
    </div>
  );
}
