import Row from "../row";
import { InfiniteScroll } from "../infinite-scroll";
import { UseConversation } from "../../context/conversation";
import { useThemeColors } from "../../hooks/theme";

export const Conversations = ()=> {
  const {loadPage, selectConversation} = UseConversation()
  const colors = useThemeColors()

  return (
    <Row>
      <InfiniteScroll
        loadPage={loadPage}
        renderItem={(c) => <div key={c.id} style={{background:colors.primary}} onClick={()=>{selectConversation(c)}}>{c.title}</div>}
      />
    </Row>
  )
}