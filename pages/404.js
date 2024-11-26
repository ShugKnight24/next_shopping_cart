import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <div className="not-found-container">
      <div className="page-header">
        <h1>Page Not Found</h1>
        <h2>Sure you have the right address?</h2>
      </div>
      <div className="not-found-body">
        <p>Use the links below to navigate to our most popular pages</p>
        <p>
          You&apos;ll be redirected to the homepage in 5 seconds automatically
        </p>
        <ul>
          Return:
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/products">Products</Link>
          </li>
          <li>
            <Link href="/cart">Cart</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
