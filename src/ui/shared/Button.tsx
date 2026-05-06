import React from 'react';

type ButtonVariant = 'primary' | 'ghost';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  className,
  children,
  ...rest
}) => {
  const classes = ['hud-button', variant === 'primary' ? 'hud-button--primary' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
