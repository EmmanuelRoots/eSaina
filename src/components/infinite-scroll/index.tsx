import { useEffect, useRef, useState } from 'react';


type Props<T> = {
  items: T[];
  loadMore: () => void
  hasMore: boolean;
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
  direction?: 'top' | 'bottom';
};

export function InfiniteScroll<T>({
  items,
  loadMore,
  hasMore,
  loading,
  renderItem,
  direction = 'bottom',
}: Props<T>) {
  const sentinel = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);


  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const isNearTop = Math.abs(el.scrollTop) > 200
      console.log({isNearTop});
      
      setUserScrolledUp(isNearTop);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  
  useEffect(() => {
    console.log({hasMore,loading,sentinel});
    
    if (!sentinel.current || loading || !hasMore) {
      console.log('no more');
      
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        console.log({entry});
        
        if (entry.isIntersecting) loadMore()
      },
      { root: scrollContainerRef.current!, rootMargin: '100px' }
    );

    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [loading, hasMore, loadMore, userScrolledUp]);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        gap : 8,
        flexDirection: direction === 'top' ? 'column-reverse' : 'column',
      }}
    >
      {items.map(renderItem)}

      {direction === 'top' && userScrolledUp && hasMore && (
        <>
          {loading && <p>Chargement en haut…</p>}
          {!hasMore && items.length > 0 && <p>Plus rien à charger.</p>}
          <div ref={sentinel} style={{ height: 100 }} ></div>
        </>
      )}

      {direction === 'bottom' && hasMore && (
        <>
          {hasMore && loading && <p>Chargement…</p>}
          {!hasMore && items.length > 0 && <p>Plus rien à charger.</p>}
          <div ref={sentinel} style={{ height: 1 }} />
        </>
      )}
    </div>
  );
}