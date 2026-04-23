import React from 'react';
import '../styles/tokens.css';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...rest }) => {
  return (
    <button className={`${styles.btn} ${variant === 'primary' ? styles.primary : styles.ghost}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
