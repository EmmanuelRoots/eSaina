/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, type JSX } from 'react'
import type { PostDTO, SalonDTO } from '../../data/dto/post'
import salonApi from '../../services/api/salon.api'

interface PostActionProps {
  getSalonByUser: () => Promise<void>
  selectSalon: (salon: SalonDTO) => void
  selectedSalon?: SalonDTO
  salons?: SalonDTO[]
  posts?: PostDTO[]
  loading: boolean
  // refreshPost:()=>void
  // hasMore : boolean
  // resetPage : ()=>void
}

const defaultValue: PostActionProps = {
  getSalonByUser: async () => {
    /** */
  },
  selectSalon: () => {
    /** */
  },
  selectedSalon: undefined,
  loading: false,
  // refreshPost : ()=>{/** */},
  // hasMore:false,
  // resetPage: ()=>{/** */}
}

const PostContext = createContext<PostActionProps>(defaultValue)

const PostProvider = (props: { children: JSX.Element }) => {
  const [selectedSalon, setSelectedSalon] = useState<SalonDTO>()
  const [salons, setSalons] = useState<SalonDTO[]>([])
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getSalonByUser().then(res => {
      console.log({ res })
      if (res.data?.length > 0) {
        setSelectedSalon(res.data[0])
      } else {
        setPosts([])
      }
    })
  }, [])

  useEffect(() => {
    console.log('select salon', selectedSalon)

    if (selectedSalon?.id) {
      // getPostListBySalon();
    } else {
      setPosts([])
    }
  }, [selectedSalon])

  const getSalonByUser = async () => {
    setLoading(true)
    try {
      const res = await salonApi.getUserSalon()
      const list: SalonDTO[] = Array.isArray(res.data) ? res.data : [res.data]
      setSalons(list)
      return res
    } finally {
      setLoading(false)
    }
  }

  const selectSalon = (salon: SalonDTO) => setSelectedSalon(salon)

  const value: PostActionProps = {
    selectedSalon,
    selectSalon,
    getSalonByUser,
    salons,
    posts,
    loading,
  }

  return (
    <PostContext.Provider value={value}>{props.children}</PostContext.Provider>
  )
}

export default PostProvider
export const UsePost = () => {
  const ctx = useContext(PostContext)
  if (!ctx) throw new Error('usePost must be used inside PostProvider')
  return ctx
}
