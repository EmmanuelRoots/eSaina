import { useEffect, useRef } from 'react';

type Props<T> = {
  items: T[];
  loadMore: (p:number) => void;
  hasMore: boolean;
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
  page : number
};

export function InfiniteScroll<T>({ items, loadMore, hasMore, loading, renderItem, page }: Props<T>) {
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinel.current || loading || !hasMore) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(page+1),
      { rootMargin: '100px' }
    );
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [loadMore, loading, hasMore]);

  return (
    <>
      {items.map(renderItem)}
      <div ref={sentinel} style={{ height: 1 }} />
      {loading && <p>Chargement…</p>}
      {!hasMore && items.length > 0 && <p>Plus rien à charger.</p>}
    </>
  );
}