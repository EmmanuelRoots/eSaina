import { useState, type CSSProperties } from "react"

import { Conversations } from "../../components/conversation"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"
import { ConversationDetail } from "../../components/conversation/conversationDetail"
import { PlusCircle } from 'lucide-react'
import Button from "../../components/Button"
import Text from "../../components/text"
import CreateConversationModal from "../../components/conversation/createConversation"
import { UseConversation } from "../../context/conversation"
import { useTheme } from "../../hooks/theme"

const MessagePage = () => {
  const { theme, colors } = useTheme()
  const { pushConversation } = UseConversation()
  const isDark = theme === 'dark'

  const buttonStyle: CSSProperties = {
    backgroundColor: colors.secondary,
    fontSize: '1rem',
    color: colors.primaryBackground
  }

  const [open, setOpen] = useState<boolean>(false)

  const handleFinished = () => {
    pushConversation()
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? '#1a1f2e'
        : '#f5f7fa',
      paddingBottom: '48px'
    }}>
      <SectionLayout style={{
        maxWidth: '1600px',
        gap: '28px',
        position: 'relative'
      }}>
        <LeftSection style={styles.leftStyle}>
          <div style={{
            background: isDark
              ? '#242b3d'
              : '#ffffff',
            borderRadius: '20px',
            border: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 2px 12px rgba(0, 0, 0, 0.08)',
            padding: '12px',
            transition: 'all 0.3s ease'
          }}>
            <Button
              icon={<PlusCircle color={colors.primaryBackground} size={30} />}
              style={buttonStyle}
              onClick={() => setOpen(true)}
            >
              <Text color="primaryBackground">Créer conversation</Text>
            </Button>
            <Conversations />
          </div>
        </LeftSection>
        <CenterSection style={styles.centerStyle}>
          <Text variant="Headline">Messages</Text>
          <ConversationDetail />
        </CenterSection>
        <RightSection style={styles.rightStyle}>
          <Text variant="Headline">Information</Text>
        </RightSection>
      </SectionLayout>
      {open && <CreateConversationModal open={open} oncClose={() => setOpen(false)} onFinished={handleFinished} />}
    </div>
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