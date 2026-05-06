import React from 'react';

export type PanelProps = React.HTMLAttributes<HTMLElement> & {
  title?: string;
};

export default function Panel({ title, children, className, ...rest }: PanelProps): JSX.Element {
  const classes = ['hud-panel', className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-label={title} {...rest}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
