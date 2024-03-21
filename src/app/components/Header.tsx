'use client';

import Link from 'next/link';
import styles from './header.module.css';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';
import Button from '../ui/Button';
import { Claims } from '@auth0/nextjs-auth0';
import { usePathname } from 'next/navigation';

export default function Header({ user }: { user?: Claims }) {
  const pathname = usePathname();

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/" aria-label="home">
          <Image alt="cord logo" src={logo} height={40} />
        </Link>
        {!user ? (
          <Button
            type="a"
            href={`/api/auth/login?returnTo=${pathname}`}
            label="sign in"
          >
            Sign in to comment
          </Button>
        ) : (
          <Button
            type="a"
            href={`/api/auth/logout?returnTo=${pathname}`}
            label="log out"
          >
            Log out {user.name}
          </Button>
        )}
      </div>
    </header>
  );
}
