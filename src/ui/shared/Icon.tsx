import React from 'react';

export type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
  name: string;
  label?: string;
};

export default function Icon({ name, label, className, ...rest }: IconProps): JSX.Element {
  const classes = ['ui-icon', `ui-icon--${name}`, className].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      data-icon={name}
      {...rest}
    />
  );
}

