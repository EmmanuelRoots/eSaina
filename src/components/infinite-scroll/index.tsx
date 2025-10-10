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
      
      const isNearTop = el.scrollTop < -40;
      console.log(el.scrollTop);
      
      console.log({isNearTop});
      
      setUserScrolledUp(isNearTop);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  
  useEffect(() => {
    
    console.log({sentinel,loading,hasMore});
    
    if (!sentinel.current || loading || !hasMore) return;
    console.log('ato');
    
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
      {direction === 'top' && userScrolledUp && hasMore && (
        <>
          {loading && <p>Chargement en haut…</p>}
          {!hasMore && items.length > 0 && <p>Plus rien à charger.</p>}
          <div ref={sentinel} style={{ height: 1 }} />
        </>
      )}

      {items.map(renderItem)}

      {direction === 'bottom' && (
        <>
          <div ref={sentinel} style={{ height: 1 }} />
          {hasMore && loading && <p>Chargement…</p>}
          {!hasMore && items.length > 0 && <p>Plus rien à charger.</p>}
        </>
      )}
    </div>
  );
}