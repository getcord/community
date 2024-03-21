import Link from 'next/link';
import styles from './header.module.css';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';
import { getSession } from '@auth0/nextjs-auth0';
import Button from '../ui/Button';

export default async function Header() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href="/" aria-label="home">
          <Image alt="cord logo" src={logo} height={40} />
        </Link>
        {!user ? (
          <Button type="a" href="/api/auth/login" label="sign in">
            Sign in to comment
          </Button>
        ) : (
          <Button type="a" href="/api/auth/logout" label="log out">
            Log out {user.name}
          </Button>
        )}
      </div>
    </header>
  );
}
