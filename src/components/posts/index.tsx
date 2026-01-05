import { useEffect, useRef, useState, type HTMLAttributes } from "react"

import type { PostDTO } from "../../data/dto/post"
import PostItem from "./post-item"
import Column from "../column"
import { CreatePost } from "./create-post"
import { UsePost } from "../../context/post"
import { InfiniteScroll } from "../infinite-scroll"
import postApi from "../../services/api/post.api"
import { UseSSE } from "../../context/sse"
import { CanDoAction } from "../../services/utils/role.utils"

const PostComponent = ({ ...rest }: HTMLAttributes<HTMLDivElement>) => {
  const [loadingPost, setLoadingPost] = useState<boolean>(false)
  const { selectedSalon } = UsePost()
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [hasMorePost, setHasMorePost] = useState<boolean>(false)
  const { newPost } = UseSSE()
  const canCreatePost = CanDoAction("Post", "create")

  const page = useRef(1)

  useEffect(() => {
    init()
  }, [selectedSalon])

  useEffect(() => {
    if (newPost) {
      page.current = 1
      setPosts([])
      loadMore()
    }
  }, [newPost])

  const loadMore = async () => {
    if (!selectedSalon?.id) return

    setLoadingPost(true)

    try {
      const { data, pagination } = await postApi.getSalonPost(selectedSalon.id, page.current)

      if (data.length > 0) {
        setPosts(prev => [...prev, ...data])
        setHasMorePost(pagination.hasMore)
        page.current += 1
      } else {
        setHasMorePost(false)
      }
    } finally {
      setLoadingPost(false)
    }
  }

  const init = async () => {
    if (!selectedSalon?.id) {
      return { items: [], hasMores: false }
    }
    const { data, pagination } = await postApi.getSalonPost(selectedSalon?.id, page.current)
    setPosts(data)
    setHasMorePost(pagination.hasMore)
    page.current = 2
  }

  return (
    <Column {...rest} style={{ gap: '1rem' }}>
      {
        canCreatePost && <CreatePost />
      }
      <Column style={{ height: "80vh" }}>
        <InfiniteScroll
          items={posts}
          loading={loadingPost}
          hasMore={hasMorePost}
          loadMore={loadMore}
          renderItem={(p) => (<PostItem key={p.id} post={p} />)}
        />
      </Column>
    </Column>
  )
}

export default PostComponent