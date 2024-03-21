'use client';

import Link from 'next/link';
import styles from './header.module.css';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';
import Button from '../ui/Button';
import { usePathname } from 'next/navigation';
import { User } from '@/app/helpers/user';

export default function Header({ user }: { user: User }) {
  const pathname = usePathname();
  const { name } = user;

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/" aria-label="home">
          <Image alt="cord logo" src={logo} height={40} />
        </Link>
        {!name ? (
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
            Log out {name}
          </Button>
        )}
      </div>
    </header>
  );
}
