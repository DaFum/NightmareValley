import React from 'react';
import '../styles/tokens.css';
import styles from './Card.module.css';

export const Card: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className={styles.card} role="region" aria-label={title || 'Card'}>
    {title && <div className={styles.header}>{title}</div>}
    <div className={styles.body}>{children}</div>
  </div>
);

export default Card;
