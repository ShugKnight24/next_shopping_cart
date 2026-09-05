import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="not-found-body">
      <div className="error-card">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
          <br />
          Redirecting to home in <strong>{countdown}</strong> seconds...
        </p>
        <div className="quick-links">
          <Link href="/" className="primary-link">
            Go Home
          </Link>
          <Link href="/products" className="secondary-link">
            Browse Products
          </Link>
          <Link href="/cart" className="secondary-link">
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
