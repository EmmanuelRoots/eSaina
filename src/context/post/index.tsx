import {
  createContext,
  useContext,
  useEffect,
  useState,
  type JSX,
} from "react";
import type { PostDTO, SalonDTO } from "../../data/dto/post";
import salonApi from "../../services/api/salon.api";
import postApi from "../../services/api/post.api";

interface PostActionProps {
  getSalonByUser: () => Promise<void>
  selectSalon: (salon: SalonDTO) => void
  selectedSalon?: SalonDTO;
  getPostListBySalon: (salonId: string) => Promise<void>
  salons?: SalonDTO[]
  posts?: PostDTO[]
  loading: boolean
}

const PostContext = createContext<PostActionProps | undefined>(undefined)

const PostProvider = (props: { children: JSX.Element }) => {
  const [selectedSalon, setSelectedSalon] = useState<SalonDTO | undefined>()
  const [salons, setSalons]         = useState<SalonDTO[]>([])
  const [posts, setPosts]           = useState<PostDTO[]>([])
  const [loading, setLoading]       = useState<boolean>(true)

  console.log({salons,posts});
  
  const getSalonByUser = async () => {
    setLoading(true)
    try {
      const res = await salonApi.getUserSalon()
      const list: SalonDTO[] = Array.isArray(res.data) ? res.data : [res.data]
      setSalons(list)
      if (list.length === 1) setSelectedSalon(list[0])
    } finally {
      setLoading(false)
    }
  };

  const selectSalon = (salon: SalonDTO) => setSelectedSalon(salon);

  const getPostListBySalon = async (salonId: string) => {
    if (!salonId) return
    setLoading(true)
    try {
      const res = await postApi.getSalonPost(salonId)
      setPosts(res.data ?? [])
    } finally {
      setLoading(false)
    }
  };

  
  useEffect(() => {
    getSalonByUser()
  }, [])

  
  useEffect(() => {
    if (selectedSalon?.id) {
      getPostListBySalon(selectedSalon.id);
    } else {
      setPosts([])
    }
  }, [selectedSalon])

  const value: PostActionProps = {
    selectedSalon,
    selectSalon,
    getSalonByUser,
    getPostListBySalon,
    salons,
    posts,
    loading,
  }

  return (
    <PostContext.Provider value={value}>
      {props.children}
    </PostContext.Provider>
  )
}

export default PostProvider
export const UsePost = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePost must be used inside PostProvider");
  return ctx;
};