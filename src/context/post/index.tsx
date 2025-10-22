/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type JSX,
} from "react";
import type { PostDTO, SalonDTO } from "../../data/dto/post";
import salonApi from "../../services/api/salon.api";


interface PostActionProps {
  getSalonByUser: () => Promise<void>
  selectSalon: (salon: SalonDTO) => void
  selectedSalon?: SalonDTO;
  salons?: SalonDTO[]
  posts?: PostDTO[]
  loading: boolean
  // refreshPost:()=>void
  // hasMore : boolean
  // resetPage : ()=>void
}

const defaultValue:PostActionProps = {
  getSalonByUser : async ()=>{/** */},
  selectSalon: ()=>{/** */},
  selectedSalon : undefined,
  loading : false,
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
  // const [newPost, setNewPost] = useState<number>(0)
  // const [page, setPage] = useState(1)
  // const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    console.log('---------------------- Init post context ----------------------------')
    
    getSalonByUser().then(res=>{
      console.log({res});
      if (res.data?.length >0){
        setSelectedSalon(res.data[0])
      } else{
        setPosts([])
      }
    })
  }, [])

  // useEffect(()=>{
    
  //   if(newPost === 0){
  //     return
  //   }
  //   console.log({selectedSalon})
  //   if(selectedSalon?.id){
  //     // getPostListBySalon()
  //   }
    
  // },[newPost])
  
  useEffect(() => {
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
  };

  const selectSalon = (salon: SalonDTO) => setSelectedSalon(salon);

  // const getPostListBySalon = async () => {
  //   // console.log({page});
    
  //   // setLoading(true)
  //   // try {
  //   //   if (!selectedSalon?.id){
  //   //     return { items: [], hasMore: false }
  //   //   } 
  //   //   const { data: fetched, pagination } = await postApi.getSalonPost(selectedSalon?.id,page)
  //   //   if(pagination.hasMore){
  //   //     setPage(prev => prev+1)
  //   //   }
  //   //   if(posts.length){
  //   //     setPosts(prev=>[...prev, ...fetched])
  //   //   }else{
  //   //     setPosts(fetched ?? [])
  //   //   }
      
  //   //   setHasMore(pagination.hasMore)

  //   //   return { items: fetched, hasMore: pagination.hasMore }
  //   // } finally {
  //   //   setLoading(false)
  //   // }
  // }

  // const refreshPost = ()=>{
   
    
  //   setNewPost(prev=>prev+1)
  // }

  
  // const resetPage = async ()=> {
  //   setPosts([]) 
  //   setPage(1)
  //   console.log({selectedSalon});
  //   await getPostListBySalon()
    
  // }

  const value: PostActionProps = {
    selectedSalon,
    selectSalon,
    getSalonByUser,
    salons,
    posts,
    loading,
    // refreshPost,
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