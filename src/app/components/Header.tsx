'use client';

import Link from 'next/link';
import styles from './header.module.css';
import { SERVER_HOST } from '@/consts';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';

export default function Header() {
  const { user, isLoading, checkSession } = useUser();

  // This runs on page refresh or first render, and will be a way
  // to maintain a login state for a user, incase they've already
  // logged through console.cord.com
  useEffect(() => {
    async function silentlyLoginUser() {
      if (!user && !isLoading) {
        const url = new URL(`${SERVER_HOST}/api/auth/silent-login`);
        await fetch(url.href, { mode: 'no-cors' });
        await checkSession();
      }
    }
    silentlyLoginUser();
  }, [user, checkSession, isLoading]);

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/" aria-label="home">
          <Image alt="cord logo" src={logo} height={40} />
        </Link>
        {/* These links point to an API route and not to a page, you should keep it as an anchor tag rather than a Link component. */}
        {!isLoading &&
          (!user ? (
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
          ))}
      </div>
    </header>
  );
}
