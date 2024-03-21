import Link from 'next/link';
import { PropsWithChildren } from 'react';
import cx from 'classnames';
import styles from './button.module.css';

type Variant = 'fill' | 'outline';

/**
 * @params label - will be used as aria-label. Important for accessibility!
 */
interface LinkProps extends React.ComponentProps<typeof Link> {
  type: 'link';
  href: React.ComponentProps<typeof Link>['href'];
  label: string;
  variant?: Variant;
}

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  type: 'button';
  variant?: Variant;
}

type Props = LinkProps | ButtonProps;

export default function Button(props: PropsWithChildren<Props>) {
  const variant = props.variant ?? 'fill';
  if (props.type === 'link') {
    return (
      <Link aria-label={props.label} className={cx(styles.container, {
        [styles.fill]: variant === 'fill',
        [styles.outline]: variant === 'outline',
      })} {...props}>
        {props.children}
      </Link>
    );
  }
  return (
    <button className={cx(styles.container, {
      [styles.fill]: variant === 'fill',
      [styles.outline]: variant === 'outline',
    })} {...props}>
      {props.children}
    </button>
  );
}
