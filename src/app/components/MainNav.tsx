'use client';

import Sidebar from '@/app/components/Sidebar';
import { Category, SupportChat } from '@/app/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/app/components/mainNav.module.css';
import { usePathname } from 'next/navigation';

export default function MainNav({
  children,
  categories,
  supportChats,
  supportEnabled,
  isLoggedIn,
  customerExists,
}: {
  children: React.ReactNode;
  categories?: Category[];
  supportEnabled?: boolean;
  supportChats?: SupportChat[];
  isLoggedIn: boolean;
  customerExists: boolean;
}) {
  const [navOpen, setNavOpen] = useState(true);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    if (window.innerWidth < 1024) {
      setNavOpen(false);
    }
  }, [setNavOpen, setWidth]);

  const pathname = usePathname();
  const lastPathnameRef = useRef(pathname);
  useEffect(() => {
    if (width > 1024) {
      return;
    }

    if (lastPathnameRef.current !== pathname) {
      setNavOpen(false);
    }
    lastPathnameRef.current = pathname;
  }, [width, pathname, setNavOpen]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (width > 1024) {
      return;
    }

    const onPointerDown = (e: PointerEvent) => {
      if (sidebarRef.current && e.target) {
        let p = e.target as Node;
        let isWithinNav = false;
        while (p) {
          if (p === sidebarRef.current) {
            isWithinNav = true;
            break;
          } else if (p.parentNode) {
            p = p.parentNode;
          } else {
            break;
          }
        }

        if (!isWithinNav) {
          setNavOpen(false);
        }
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [width, navOpen, setNavOpen]);

  const onResizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  useEffect(() => {
    const onResize = () => {
      if (onResizeTimeoutRef.current) {
        clearTimeout(onResizeTimeoutRef.current);
      }

      onResizeTimeoutRef.current = setTimeout(() => {
        setWidth(window.innerWidth);
        if (window.innerWidth > 1024 && !navOpen) {
          setNavOpen(true);
        }
        onResizeTimeoutRef.current = undefined;
      }, 500);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('pageshow', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('pageshow', onResize);
    };
  }, [setWidth, setNavOpen, navOpen]);

  const onToggle = useCallback(() => {
    setNavOpen(!navOpen);
  }, [navOpen, setNavOpen]);

  return (
    <div className={styles.mainNav}>
      <Sidebar
        forwardRef={sidebarRef}
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
  );
}
