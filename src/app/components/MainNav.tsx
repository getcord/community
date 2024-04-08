'use client';

import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import { User } from '@/app/helpers/user';
import { Category, SupportChat } from '@/app/types';
import { useCallback, useEffect, useState } from 'react';
import styles from '@/app/components/mainNav.module.css';

export default function MainNav({
  children,
  user,
  categories,
  supportChats,
  supportEnabled,
  isLoggedIn,
  customerExists,
}: {
  children: React.ReactNode;
  user: User;
  categories?: Category[];
  supportEnabled?: boolean;
  supportChats?: SupportChat[];
  isLoggedIn: boolean;
  customerExists: boolean;
}) {
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setNavOpen(false);
    }
  }, [setNavOpen]);

  const onToggle = useCallback(() => {
    setNavOpen(!navOpen);
  }, [navOpen, setNavOpen]);

  return (
    <>
      <Header user={user} />
      <div className={styles.mainNav}>
        <Sidebar
          categories={categories}
          supportEnabled={supportEnabled}
          supportChats={supportChats}
          isLoggedIn={isLoggedIn}
          customerExists={customerExists}
          navOpen={navOpen}
          onToggle={onToggle}
        />
        {children}
      </div>
    </>
  );
}
