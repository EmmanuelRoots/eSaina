import { Conversations } from "../../components/conversation"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"
import { ConversationDetail } from "../../components/conversation/conversationDetail"
import {PlusCircle} from 'lucide-react'
import { useThemeColors } from "../../hooks/theme"
import Button from "../../components/Button"
import type { CSSProperties } from "react"



const MessagePage = ()=> {
  const colors = useThemeColors()
  const buttonStyle : CSSProperties = {
    backgroundColor : colors.secondary,
    fontSize : '1rem',
    color : colors.primaryBackground
  }

  return (
      <SectionLayout>
        <LeftSection style={styles.leftStyle}>
          <Button icon={<PlusCircle color={colors.primaryBackground} size={30}/>} style={buttonStyle} title="Créer conversation">
            Créer conversation
          </Button>
          <Conversations />
        </LeftSection>
        <CenterSection style={{flex : "1 1 60%"}}>
          <h3>Message detail</h3>
          <ConversationDetail />
        </CenterSection>
        <RightSection style={{flex : "1 1 20%"}}>
          <h3>Message menu</h3>
        </RightSection>
      </SectionLayout>
  )
}

const styles = {
  leftStyle : {
    flex : "1 1 20%", 
    height:"100vh",
    borderRightColor: "#f0f0f0",
    borderRightWidth:"1px",
    borderRightStyle : "solid",
    boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    paddingInline: '1%',
    gap : 8,
    paddingTop : 8
  }

} satisfies Record<string, React.CSSProperties>

export default MessagePage