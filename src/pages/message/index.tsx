import { useState, type CSSProperties } from 'react'

import { Conversations } from '../../components/conversation'
import {
  CenterSection,
  LeftSection,
  RightSection,
  SectionLayout,
} from '../layout/section'
import { ConversationDetail } from '../../components/conversation/conversationDetail'
import { PlusCircle } from 'lucide-react'
import Button from '../../components/Button'
import Text from '../../components/text'
import CreateConversationModal from '../../components/conversation/createConversation'
import { UseConversation } from '../../context/conversation'
import { useTheme } from '../../hooks/theme'
import Column from '../../components/column'
import Row from '../../components/row'

const MessagePage = () => {
  const { theme, colors } = useTheme()
  const { pushConversation } = UseConversation()
  const isDark = theme === 'dark'

  const buttonStyle: CSSProperties = {
    backgroundColor: colors.secondary,
    fontSize: '1rem',
    color: colors.primaryBackground,
  }

  const [open, setOpen] = useState<boolean>(false)

  const handleFinished = () => {
    pushConversation()
  }

  return (
    <>
      <SectionLayout
        style={{
          background: isDark ? '#1a1f2e' : '#f5f7fa',
          padding: '1%',
          gap: 8,
        }}
      >
        <LeftSection style={styles.leftStyle}>
          <Column
            gap={8}
            style={{
              background: isDark ? '#242b3d' : '#ffffff',
              borderRadius: '20px',
              border: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
              boxShadow: isDark
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 2px 12px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              padding: 10,
            }}
          >
            <Button
              icon={<PlusCircle color={colors.primaryBackground} size={30} />}
              style={buttonStyle}
              onClick={() => setOpen(true)}
            >
              <Text color="primaryBackground">Créer conversation</Text>
            </Button>
            <Conversations />
          </Column>
        </LeftSection>
        {/**Center section */}
        <CenterSection
          style={{
            ...styles.centerStyle,
            background: isDark ? '#242b3d' : '#ffffff',
            borderRadius: '20px',
            border: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 2px 12px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
          }}
        >
          <Column style={{ padding: '1%', flex: 1 }}>
            <Row style={{ flex: 1 }}>
              <Text variant="Headline">Messages</Text>
            </Row>
            <ConversationDetail />
          </Column>
        </CenterSection>
        {/**reight section */}
        <RightSection style={styles.rightStyle}>
          <Text variant="Headline">Information</Text>
        </RightSection>
      </SectionLayout>
      {open && (
        <CreateConversationModal
          open={open}
          oncClose={() => setOpen(false)}
          onFinished={handleFinished}
        />
      )}
    </>
  )
}

const styles = {
  centerStyle: {
    flex: '1 1 50%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  leftStyle: {
    flex: '1 1 20%',
  },
  rightStyle: {
    flex: '1 1 20%',
    boxShadow: '-2px 0 6px rgba(0,0,0,.08)',
    padding: 8,
  },
} satisfies Record<string, React.CSSProperties>

export default MessagePage
