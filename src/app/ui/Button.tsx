import Link from 'next/link';
import { PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './button.module.css';

type Variant = 'fill' | 'outline';

interface LinkProps extends React.ComponentProps<typeof Link> {
  behaveAs: 'link';
  href: React.ComponentProps<typeof Link>['href'];
  label: string;
  disabled?: boolean;
  variant?: Variant;
}

interface AProps extends React.HTMLProps<HTMLAnchorElement> {
  behaveAs: 'a';
  href: React.HTMLProps<HTMLAnchorElement>['href'];
  disabled?: boolean;
  variant?: Variant;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  behaveAs: 'button';
  variant?: Variant;
  disabled?: boolean;
}

type Props = LinkProps | AProps | ButtonProps;

/**
 * @param type - "link" for navigation to different pages, "a" for API routes, "button" for actions
 */
export default function Button(props: PropsWithChildren<Props>) {
  // otherProps will no longer be typed here, so infer the type every where we pass it below
  const { behaveAs, ...otherProps } = props;

  const variant = props.variant ?? 'fill';
  if (behaveAs === 'link') {
    return (
      <Link
        aria-label={props.label}
        className={cx(styles.container, {
          [styles.fill]: variant === 'fill',
          [styles.outline]: variant === 'outline',
          [styles.disabled]: props.disabled,
        })}
        {...(otherProps as LinkProps)}
      >
        {props.children}
      </Link>
    );
  }
  if (behaveAs === 'a') {
    return (
      <a
        className={cx(styles.container, {
          [styles.fill]: variant === 'fill',
          [styles.outline]: variant === 'outline',
          [styles.disabled]: props.disabled,
        })}
        {...(otherProps as AProps)}
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
      {...(otherProps as ButtonProps)}
    >
      {props.children}
    </button>
  );
}
