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

type PageResult<T> ={
  items : T[]
  hasMore : boolean
}

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface ConversationAction {
  loadPage: (page: number) => Promise<PageResult<Partial<ConversationDTO>>>;
  conversations: Partial<ConversationDTO>[];
  selectedConversation: Partial<ConversationDTO> | null;
  selectConversation: (conv: Partial<ConversationDTO>) => void;
  pushConversation: () => void;
  loading: boolean;
  page: number;
  hasMore : boolean
}

/* ------------------------------------------------------------------ */
/* Contexte                                                           */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */
const ConversationProvider = (props: { children: JSX.Element }) => {
  /* ---------- état local ---------- */
  const [conversations, setConversations] = useState<Partial<ConversationDTO>[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Partial<ConversationDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0); // déclenche un re-chargement

  

  /* ---------- chargement d’une page (paginatif ou reset) ---------- */
  const loadPage = useCallback(
    async (nextPage: number)  => {
      console.log('--- call this ---');
      
      if (loading) return { items: [], hasMore };

      setLoading(true);
      try {
        const { conversations: fetched, pagination } =
          await conversationApi.getAllConversation({ page: nextPage, limit: 20 });

        if (nextPage === 1) {
          setConversations(fetched);
          setPage(1);
        } else {
          setConversations((prev) => [...prev, ...fetched]);
          setPage(nextPage);
        }
        setHasMore(pagination.hasMore);
        return { items: fetched, hasMore: pagination.hasMore };
      } finally {
        setLoading(false);
        setRefreshFlag(0)
      }
    },
    [loading, hasMore]
  );
  useEffect(()=>{
        console.log('initialize');
        loadPage(1)
        
    },[])
  /* ---------- sélection ---------- */
  const selectConversation = useCallback((conv: Partial<ConversationDTO>) => {
    setSelectedConversation(conv);
  }, []);

  /* ---------- déclenchement via SSE ---------- */
  const pushConversation = useCallback(() => {
    console.log('push conversation');
    
    setRefreshFlag((f) => f + 1); // simple toggle
  }, []);

  /* ---------- effet : recharge page 1 quand on reçoit un signal ---------- */
  useEffect(() => {
    if (refreshFlag === 0) return; // évite le 1er rendu
    loadPage(1);
  }, [refreshFlag, loadPage]);


  /* ---------- valeur fournie ---------- */
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

/* ------------------------------------------------------------------ */
/* Hook consommateur                                                    */
/* ------------------------------------------------------------------ */
export const UseConversation = () => useContext(conversationContext);
export default ConversationProvider