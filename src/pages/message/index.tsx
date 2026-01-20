import { useState, type CSSProperties } from 'react'

import { Conversations } from '../../components/conversation'
import {
  CenterSection,
  LeftSection,
  RightSection,
  SectionLayout,
} from '../layout/section'
import { ConversationDetail } from '../../components/conversation/conversationDetail'
import {
  PlusCircle,
  Search,
  Phone,
  Video,
  Info,
  Image as ImageIcon,
  FileText,
  Settings,
} from 'lucide-react'
import Text from '../../components/text'
import CreateConversationModal from '../../components/conversation/createConversation'
import { UseConversation } from '../../context/conversation'
import { useTheme } from '../../hooks/theme'
import Column from '../../components/column'
import Row from '../../components/row'
import { UseAuth } from '../../context/user'
import { ConversationType } from '../../data/dto/conversation'

const MessagePage = () => {
  const { theme, colors } = useTheme()
  const { pushConversation, selectedConversation } = UseConversation()
  const { user } = UseAuth()
  const isDark = theme === 'dark'

  const [open, setOpen] = useState<boolean>(false)

  const handleFinished = () => {
    pushConversation()
  }

  const getConversationTitle = () => {
    if (!selectedConversation) return 'Sélectionnez une conversation'
    if (selectedConversation.type === ConversationType.AI_CHAT) {
      return selectedConversation.title || 'Assistant IA'
    }
    const member = selectedConversation.members?.find(
      m => m.user?.id !== user?.id
    )
    return (
      member?.user?.lastName ||
      selectedConversation.title ||
      'Conversation'
    )
  }

  const getConversationImage = () => {
    if (
      !selectedConversation ||
      selectedConversation.type === ConversationType.AI_CHAT
    ) {
      return null
    }
    const member = selectedConversation.members?.find(
      m => m.user?.id !== user?.id
    )
    return member?.user?.pdpUrl
  }

  const containerStyle: CSSProperties = {
    background: isDark ? '#242b3d' : '#ffffff',
    borderRadius: '24px',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    boxShadow: isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  }

  const iconButtonStyle: CSSProperties = {
    padding: '8px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: colors.secondaryText,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <>
      <SectionLayout
        style={{
          background: isDark ? '#1a1f2e' : '#f5f7fa',
          padding: '1.5rem',
          gap: '1.5rem',
          height: 'calc(100vh - 60px)',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Section - Conversation List */}
        <LeftSection style={{ flex: '0 0 320px', minWidth: '320px' }}>
          <div style={containerStyle}>
            <Column gap={20} style={{ padding: '20px', flex: 1 }}>
              {/* Header & Search */}
              <Column gap={16}>
                <Row
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="Headline"
                    style={{ fontSize: '1.5rem', fontWeight: 700 }}
                  >
                    Messages
                  </Text>
                  <div
                    style={{
                      ...iconButtonStyle,
                      background: isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    }}
                    onClick={() => setOpen(true)}
                  >
                    <PlusCircle size={20} color={colors.primary} />
                  </div>
                </Row>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: isDark
                      ? 'rgba(0, 0, 0, 0.2)'
                      : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <Search size={18} color={colors.secondaryText} />
                  <input
                    placeholder="Rechercher..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      marginLeft: '10px',
                      color: colors.default,
                      width: '100%',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </Column>

              {/* Conversation List */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Conversations />
              </div>
            </Column>
          </div>
        </LeftSection>

        {/* Center Section - Chat Area */}
        <CenterSection style={{ flex: 1, minWidth: 0 }}>
          <div style={containerStyle}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Row
                  style={{
                    padding: '16px 24px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <Row gap={12} style={{ alignItems: 'center' }}>
                    {getConversationImage() ? (
                      <img
                        src={getConversationImage()!}
                        alt="Profile"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '14px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '14px',
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '1.2rem',
                        }}
                      >
                        {getConversationTitle().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <Column gap={2}>
                      <Text
                        variant="body"
                        style={{ fontWeight: 600, fontSize: '1.1rem' }}
                      >
                        {getConversationTitle()}
                      </Text>
                      <Row gap={6} style={{ alignItems: 'center' }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#10B981',
                          }}
                        />
                        <Text
                          variant="caption"
                          style={{ color: colors.secondaryText }}
                        >
                          En ligne
                        </Text>
                      </Row>
                    </Column>
                  </Row>

                  <Row gap={8}>
                    <div style={iconButtonStyle}>
                      <Phone size={20} />
                    </div>
                    <div style={iconButtonStyle}>
                      <Video size={20} />
                    </div>
                    <div style={iconButtonStyle}>
                      <Info size={20} />
                    </div>
                  </Row>
                </Row>

                {/* Messages Area */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <ConversationDetail />
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 20,
                  color: colors.secondaryText,
                }}
              >
                <div
                  style={{
                    padding: 30,
                    borderRadius: '50%',
                    background: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <PlusCircle size={60} strokeWidth={1} />
                </div>
                <Text variant="Headline" style={{ color: colors.secondaryText }}>
                  Commencez une conversation
                </Text>
              </div>
            )}
          </div>
        </CenterSection>

        {/* Right Section - Info */}
        <RightSection
          style={{
            flex: '0 0 280px',
            display: selectedConversation ? 'flex' : 'none',
          }}
        >
          <div style={{ ...containerStyle, padding: '20px' }}>
            <Column gap={24}>
              <div style={{ textAlign: 'center' }}>
                {getConversationImage() ? (
                  <img
                    src={getConversationImage()!}
                    alt="Profile"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '24px',
                      objectFit: 'cover',
                      marginBottom: 12,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '24px',
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '2rem',
                      margin: '0 auto 12px',
                    }}
                  >
                    {getConversationTitle().charAt(0).toUpperCase()}
                  </div>
                )}
                <Text variant="Headline" style={{ fontSize: '1.2rem' }}>
                  {getConversationTitle()}
                </Text>
                <Text variant="caption" style={{ color: colors.secondaryText }}>
                  @username
                </Text>
              </div>

              <Column gap={16}>
                <Text
                  variant="body"
                  style={{
                    fontWeight: 600,
                    color: colors.secondaryText,
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '1px',
                  }}
                >
                  Médias partagés
                </Text>
                <Row gap={8} style={{ flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ImageIcon size={20} color={colors.secondaryText} />
                    </div>
                  ))}
                </Row>
              </Column>

              <Column gap={8}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <Row gap={10} style={{ alignItems: 'center' }}>
                    <FileText size={18} color={colors.secondaryText} />
                    <Text variant="body">Fichiers</Text>
                  </Row>
                  <Text variant="caption" style={{ color: colors.secondaryText }}>
                    12
                  </Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <Row gap={10} style={{ alignItems: 'center' }}>
                    <Settings size={18} color={colors.secondaryText} />
                    <Text variant="body">Paramètres</Text>
                  </Row>
                </div>
              </Column>
            </Column>
          </div>
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

export default MessagePage
