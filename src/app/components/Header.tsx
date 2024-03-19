import Link from 'next/link';
import styles from './header.module.css';
import { CORD_USER_COOKIE } from '@/consts';
import { cookies } from 'next/headers';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';

export default function Header() {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);

  return (
    <header className={styles.container}>
      <div className={styles.content}>
      <Link href="/" aria-label="home">
      <Image alt="cord logo" src={logo} height={40}/>
      </Link>
      {!userIdCookie && (
        <Link href="/signin" className={styles.signinButton} aria-label="sign in">
          Sign in to comment
        </Link>
      )}
      </div>
    </header>
  );
}
