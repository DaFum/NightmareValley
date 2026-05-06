import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export const Card: React.FC<CardProps> = ({ title, children, className, ...rest }) => {
  const classes = ['hud-panel', className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-label={title ?? 'Card'} {...rest}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
};

export default Card;
