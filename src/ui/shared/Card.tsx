import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  title?: string;
};

export const Card: React.FC<CardProps> = ({ title, children, className, id, ...rest }) => {
  const classes = ['hud-panel', className].filter(Boolean).join(' ');

  const headingId = title ? `${id ?? 'card'}-title` : undefined;

  return (
    <section className={classes} id={id} aria-labelledby={headingId} {...rest}>
      {title ? <h3 id={headingId}>{title}</h3> : null}
      {children}
    </section>
  );
};

export default Card;
