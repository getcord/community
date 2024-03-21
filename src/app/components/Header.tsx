import Link from 'next/link';
import styles from './header.module.css';
import { SERVER_HOST } from '@/consts';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';
import { getSession } from '@auth0/nextjs-auth0';

export default async function Header() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/" aria-label="home">
          <Image alt="cord logo" src={logo} height={40} />
        </Link>
        {/* These links point to an API route and not to a page, you should keep it as an anchor tag rather than a Link component. */}
        {!user ? (
          <a
            href="/api/auth/login"
            className={styles.signinButton}
            aria-label="sign in"
          >
            Sign in to comment
          </a>
        ) : (
          <a
            href="/api/auth/logout"
            className={styles.signinButton}
            aria-label="log out"
          >
            Log out {user.name}
          </a>
        )}
      </div>
    </header>
  );
}
