import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  title?: string;
};

export const Card: React.FC<CardProps> = ({ title, children, className, id, ...rest }) => {
  const classes = ['hud-panel', className].filter(Boolean).join(' ');
  const baseId = React.useId();
  const sectionId = id ?? baseId;
  const headingId = title ? `${sectionId}-title` : undefined;

  return (
    <section {...rest} className={classes} id={sectionId} aria-labelledby={headingId}>
      {title ? <h3 id={headingId}>{title}</h3> : null}
      {children}
    </section>
  );
};

export default Card;
