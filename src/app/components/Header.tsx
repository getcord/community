'use client';

import Link from 'next/link';
import styles from './header.module.css';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';
import Button from '../ui/Button';
import { usePathname } from 'next/navigation';
import { User } from '@/app/helpers/user';
import { UserDetails } from '@/app/components/UserDetails';
import SearchBox from '@/app/components/Search';

export default function Header({ user }: { user: User }) {
  const pathname = usePathname();
  const { name } = user;

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/" aria-label="home" className={styles.mainLink}>
          <Image alt="cord logo" src={logo} height={24} /> Community
        </Link>
        <SearchBox />
        {!name ? (
          <Button behaveAs="a" href={`/api/auth/login?returnTo=${pathname}`}>
            Sign in to comment
          </Button>
        ) : (
          <UserDetails user={user} />
        )}
      </div>
    </header>
  );
}
