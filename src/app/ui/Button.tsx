import Link from 'next/link';
import { PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './button.module.css';

type Variant = 'fill' | 'outline';

interface LinkProps extends React.ComponentProps<typeof Link> {
  as: 'link';
  href: React.ComponentProps<typeof Link>['href'];
  label: string;
  disabled?: boolean;
  variant?: Variant;
}

interface AProps extends React.HTMLProps<HTMLAnchorElement> {
  as: 'a';
  href: React.HTMLProps<HTMLAnchorElement>['href'];
  label: string;
  disabled?: boolean;
  variant?: Variant;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as: 'button';
  variant?: Variant;
  disabled?: boolean;
}

type Props = LinkProps | AProps | ButtonProps;

/**
 * @param type - "link" for navigation to different pages, "a" for API routes, "button" for actions
 */
export default function Button(props: PropsWithChildren<Props>) {
  const variant = props.variant ?? 'fill';
  if (props.as === 'link') {
    return (
      <Link
        aria-label={props.label}
        className={cx(styles.container, {
          [styles.fill]: variant === 'fill',
          [styles.outline]: variant === 'outline',
          [styles.disabled]: props.disabled,
        })}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
  if (props.as === 'a') {
    return (
      <a
        className={cx(styles.container, {
          [styles.fill]: variant === 'fill',
          [styles.outline]: variant === 'outline',
          [styles.disabled]: props.disabled,
        })}
        {...props}
      >
        {props.children}
      </a>
    );
  }
  return (
    <button
      className={cx(styles.container, {
        [styles.fill]: variant === 'fill',
        [styles.outline]: variant === 'outline',
        [styles.disabled]: props.disabled,
      })}
      {...props}
    >
      {props.children}
    </button>
  );
}
