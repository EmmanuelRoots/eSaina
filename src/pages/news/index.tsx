import { useEffect, useState } from "react"
import { UsePost } from "../../context/post"
import type { PostDTO } from "../../data/dto/post"
import postApi from "../../services/api/post.api"
import { UseSSE } from "../../context/sse"
import { CanDoAction } from "../../services/utils/role.utils"
import { InfiniteScroll } from "../../components/infinite-scroll"
import { ComposeBox, NewPostItem, SalonList, EmptyTrail } from "../../components/posts/NewPostItem"

const NewsPage = () => {
  const { salons, selectedSalon, selectSalon } = UsePost()
  const { newPost } = UseSSE()
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const canCreate = CanDoAction('Post', 'create')

  const reset = async () => {
    if (!selectedSalon?.id) return
    setLoading(true)
    try {
      const { data, pagination } = await postApi.getSalonPost(selectedSalon.id, 1)
      setPosts(data)
      setHasMore(pagination.hasMore)
      setPage(2)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!selectedSalon?.id || loading) return
    setLoading(true)
    try {
      const { data, pagination } = await postApi.getSalonPost(selectedSalon.id, page)
      if (data.length) {
        setPosts((prev) => [...prev, ...data])
        setHasMore(pagination.hasMore)
        setPage((p) => p + 1)
      } else {
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reset() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selectedSalon])
  useEffect(() => { if (newPost) reset() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [newPost])

  return (
    <div style={{ height: 'calc(100vh - 0px)', display: 'flex', overflow: 'hidden' }}>
      {/* Center column — feed */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {canCreate && <ComposeBox />}
          <InfiniteScroll
            items={posts}
            hasMore={hasMore}
            loading={loading}
            loadMore={loadMore}
            renderItem={(p) => <NewPostItem key={p.id} post={p} />}
          />
          {!hasMore && posts.length > 0 && <EmptyTrail />}
        </div>
      </div>

      <SalonList
        salons={salons}
        activeId={selectedSalon?.id}
        onSelect={selectSalon}
      />
    </div>
  )
}

export default NewsPage
