import React, { type ReactNode, type FC, type CSSProperties } from 'react';
import { useThemeColors } from '../../hooks/theme';

/* ---------- Card ---------- */
type CardProps = { children: ReactNode, style? : CSSProperties };
export const Card: FC<CardProps> = ({ children, style}) => {
  const colors = useThemeColors()
  
  return (
    <div style={{...styles.card,backgroundColor : colors.primaryBackground, ...style}}>
      {children}
    </div>
  )
};

/* ---------- CardHeader ---------- */
type CardSubProps = { children: ReactNode; className?: string };
export const CardHeader: FC<CardSubProps> = ({ children, className = '' }) => (
  <div className={`card-header ${className}`} style={styles.header}>
    {children}
  </div>
);

/* ---------- CardBody ---------- */
export const CardBody: FC<CardSubProps> = ({ children, className = '' }) => (
  <div className={`card-body ${className}`} style={styles.body}>
    {children}
  </div>
);

/* ---------- CardFooter ---------- */
export const CardFooter: FC<CardSubProps> = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`} style={styles.footer}>
    {children}
  </div>
);

/* ---------- Styles inline (facultatif) ---------- */
const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    overflow: 'hidden',
  },
  header: {
    padding: '12px 16px',
    fontWeight: 600,
    borderBottom: '1px solid #f0f0f0',
  },
  body: {
    padding: 16,
    flex: 1,
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
} satisfies Record<string, React.CSSProperties>