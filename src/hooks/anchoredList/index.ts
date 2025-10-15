import React, { useLayoutEffect } from 'react';

/* ----------  petit helper  ---------- */
const useAnchoredList = (
  anchorRef: React.RefObject<HTMLElement>,
  deps: React.DependencyList = []
) =>{
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const el = anchorRef.current;
    const rect = el.getBoundingClientRect();

    setStyle({
      position: 'fixed',
      top: rect.bottom + window.scrollY + 4,   // 4 px sous l’input
      left: rect.left + window.scrollX,
      width: rect.width,
      maxHeight: 224,
      overflowY: 'auto',
      zIndex: 9999,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return style;
}

export default useAnchoredList