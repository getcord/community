import Link from 'next/link';
import styles from './header.module.css';
import { CORD_USER_COOKIE } from '@/consts';
import { cookies } from 'next/headers';
import logo from '@/static/cord-logo.png';
import Image from 'next/image';

export default function Header() {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);

  return (
    <div className={styles.container}>
      <Image alt="cord logo" src={logo} height={40}/>
      {!userIdCookie && (
        <Link href="/signin" className={styles.signinButton}>
          Sign in to comment
        </Link>
      )}
    </div>
  );
}
