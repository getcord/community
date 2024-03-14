import Link from "next/link";
import styles from "./header.module.css";
import { CORD_USER_COOKIE } from "@/consts";
import { cookies } from "next/headers";

export default function Header() {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);

  return (
    <div className={styles.container}>
      CORD COMMUNITY
      {!userIdCookie && (
        <Link href="/signin" className={styles.signinButton}>
          Sign in to comment
        </Link>
      )}
    </div>
  );
}
