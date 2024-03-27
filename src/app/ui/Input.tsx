'use client';

import { PropsWithChildren } from 'react';
import styles from './input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, ...props }: InputProps) {
  return (
    <div className={styles.container}>
      <Label htmlFor={props.id}>{label}</Label>
      <input className={styles.input} {...props} />
    </div>
  );
}

export function Label({
  children,
  ...props
}: PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label className={styles.label} {...props}>
      {children}
    </label>
  );
}
