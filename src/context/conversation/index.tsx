import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type JSX,
} from "react";
import type { ConversationDTO } from "../../data/dto/conversation";
import conversationApi from "../../services/api/conversation.api";

export type PageResult<T> ={
  items : T[]
  hasMore : boolean
}

interface ConversationAction {
  loadPage: () => Promise<PageResult<Partial<ConversationDTO>>>;
  conversations: Partial<ConversationDTO>[];
  selectedConversation: Partial<ConversationDTO> | null;
  selectConversation: (conv: Partial<ConversationDTO>) => void;
  pushConversation: () => void;
  loading: boolean;
  page: number;
  hasMore : boolean
}


const conversationContext = createContext<ConversationAction>({
  loadPage: async () => ({ items: [], hasMore: false }),
  conversations: [],
  selectedConversation: null,
  selectConversation: () => {},
  pushConversation: () => {},
  loading: false,
  page: 1,
  hasMore: false,
});


const ConversationProvider = (props: { children: JSX.Element }) => {
  
  const [conversations, setConversations] = useState<Partial<ConversationDTO>[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Partial<ConversationDTO> | null>(null);
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [refreshFlag, setRefreshFlag] = useState(0); // déclenche un re-chargement
  
  const loadPage = useCallback(
    async ()  => {
      console.log('--- call this ---');
      
      if (loading) return { items: [], hasMore };

      setLoading(true);
      try {
        const { conversations: fetched, pagination } = await conversationApi.getAllConversation({ page: page, limit: 20 });
        console.log({pagination});
        
        selectConversation(fetched[0])
        setConversations(fetched)
        if(pagination.hasMore){
          setPage(prev => prev+1)
        }
        setHasMore(pagination.hasMore)
        return { items: fetched, hasMore: pagination.hasMore }
      } finally {
        setLoading(false);
        setRefreshFlag(0)
      }
    },
    [loading, hasMore]
  );
  useEffect(()=>{
        console.log('initialize');
        loadPage().then(()=>{
          console.log({selectedConversation});
          
        })
       
    },[])
  
  const selectConversation = useCallback((conv: Partial<ConversationDTO>) => {
    setSelectedConversation(conv);
  }, []);

 
  const pushConversation = () => {
    console.log('push conversation');
    
    setRefreshFlag((f) => f + 1); // simple toggle
  }

  
  useEffect(() => {
    if (refreshFlag === 0) return; // évite le 1er rendu
    loadPage();
  }, [refreshFlag, loadPage]);


  const value: ConversationAction = {
    loadPage,
    conversations,
    selectedConversation,
    selectConversation,
    pushConversation,
    loading,
    page,
    hasMore
  };

  return (
    <conversationContext.Provider value={value}>
      {props.children}
    </conversationContext.Provider>
  );
};

export const UseConversation = () => useContext(conversationContext);
export default ConversationProvider