import { useState, type CSSProperties } from "react"

import { Conversations } from "../../components/conversation"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"
import { ConversationDetail } from "../../components/conversation/conversationDetail"
import { PlusCircle } from 'lucide-react'
import { useThemeColors } from "../../hooks/theme"
import Button from "../../components/Button"
import Text from "../../components/text"
import CreateConversationModal from "../../components/conversation/createConversation"
import { UseConversation } from "../../context/conversation"

const MessagePage = () => {
  const colors = useThemeColors()
  const {pushConversation} = UseConversation()
  
  const buttonStyle: CSSProperties = {
    backgroundColor: colors.secondary,
    fontSize: '1rem',
    color: colors.primaryBackground
  }

  const [open, setOpen] = useState<boolean>(false)

  const handleFinished = ()=> {
    pushConversation()
  }
  
  
  return (
    <>
      <SectionLayout>
        <LeftSection style={styles.leftStyle}>
          <Button 
            icon={<PlusCircle color={colors.primaryBackground} size={30} />} 
            style={buttonStyle} 
            onClick={() => setOpen(true)}
          >
            <Text color="primaryBackground">Créer conversation</Text>
          </Button>
          <Conversations />
        </LeftSection>
        <CenterSection style={styles.centerStyle}>
          <ConversationDetail />
        </CenterSection>
        <RightSection style={styles.rightStyle}>
          <Text variant="Headline">Information</Text>
        </RightSection>
      </SectionLayout>
      {open && <CreateConversationModal open={open} oncClose={()=>setOpen(false)} onFinished={handleFinished}/>}
    </>
  )
}

const styles = {
  centerStyle: {
    flex: "1 1 60%",
    padding: 8
  },
  leftStyle: {
    flex: "1 1 20%",
    height: "100vh",
    borderRightColor: "#f0f0f0",
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    paddingInline: '1%',
    gap: 8,
    paddingTop: 8
  },
  rightStyle: {
    flex: "1 1 20%",
    boxShadow: '-2px 0 6px rgba(0,0,0,.08)',
    padding: 8
  }
} satisfies Record<string, React.CSSProperties>

export default MessagePage