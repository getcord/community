import Link from 'next/link';
import { PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './button.module.css';

type Variant = 'fill' | 'outline';

interface LinkProps extends React.ComponentProps<typeof Link> {
  type: 'link';
  href: React.ComponentProps<typeof Link>['href'];
  label: string;
  disabled?: boolean;
  variant?: Variant;
}

interface AProps extends React.HTMLProps<HTMLAnchorElement> {
  type: 'a';
  href: React.HTMLProps<HTMLAnchorElement>['href'];
  label: string;
  disabled?: boolean;
  variant?: Variant;
}

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  type: 'button';
  variant?: Variant;
  disabled?: boolean;
}

type Props = LinkProps | AProps | ButtonProps;

/**
 * @param type - "link" for navigation to different pages, "a" for API routes, "button" for actions
 */
export default function Button(props: PropsWithChildren<Props>) {
  const variant = props.variant ?? 'fill';
  if (props.type === 'link') {
    return (
      <Link
        aria-label={props.label}
        className={cx(styles.container, {
          [styles.fill]: variant === 'fill',
          [styles.outline]: variant === 'outline',
          [styles.disabled]: props.disabled
        })}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
  if (props.type === 'a') {
    return (
      <a
        className={cx(styles.container, {
          [styles.fill]: variant === 'fill',
          [styles.outline]: variant === 'outline',
          [styles.disabled]: props.disabled
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
        [styles.disabled]: props.disabled
      })}
      {...props}
    >
      {props.children}
    </button>
  );
}
