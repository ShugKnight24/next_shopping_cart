import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/pages/NotFound.module.css';

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
    <div className={styles.notFoundBody}>
      <div className={styles.errorCard}>
        <div className={styles.errorCode}>404</div>
        <h1>Page Not Found</h1>
        <p>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
          <br />
          Redirecting to home in <strong>{countdown}</strong> seconds...
        </p>
        <div className={styles.quickLinks}>
          <Link href="/" className={styles.primaryLink}>
            Go Home
          </Link>
          <Link href="/products" className={styles.secondaryLink}>
            Browse Products
          </Link>
          <Link href="/cart" className={styles.secondaryLink}>
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
