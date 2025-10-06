import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type PageResult<T> = {
  items: T[];
  hasMore: boolean;
};

type InfiniteScrollProps<T> = {
  loadPage: (page: number) => Promise<PageResult<T>>;
  renderItem: (item: T) => ReactNode;
  loader?: ReactNode;
  endMessage?: ReactNode;
};

export function InfiniteScroll<T>({
  loadPage,
  renderItem,
  loader = <p>Chargement…</p>,
  endMessage = <p>Plus rien à charger.</p>,
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { items: newItems, hasMore: more } = await loadPage(page);
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(more);
      setPage((p) => p + 1);
    } catch (e) {
      console.error(e);
      // on peut aussi exposer une onError prop si on veut
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      {items.map((item) => (
        renderItem(item)
      ))}

      {/* sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {loading && loader}
      <div>
        {!hasMore && items.length > 0 && endMessage}
      </div>
    </>
  );
}