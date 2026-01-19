import { BotMessageSquare } from 'lucide-react'
import { UseConversation } from '../../../context/conversation'
import {
  ConversationType,
  type ConversationDTO,
} from '../../../data/dto/conversation'
import Row from '../../row'
import Text from '../../text'
import { UseAuth } from '../../../context/user'
import { useTheme } from '../../../hooks/theme'
import Column from '../../column'

type ConvItemProps = {
  conversation: Partial<ConversationDTO>
}

export const ConversationItem = ({ conversation }: ConvItemProps) => {
  const { selectConversation, selectedConversation } = UseConversation()
  const { user } = UseAuth()
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'

  const isSelected = selectedConversation?.id === conversation.id

  const getRender = (conversation: Partial<ConversationDTO>) => {
    switch (conversation.type) {
      case ConversationType.AI_CHAT:
        return (
          <Row style={{ alignItems: 'center' }} gap={12}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <BotMessageSquare size={24} />
            </div>
            <Column gap={4}>
              <Text variant="body" style={{ fontWeight: 600 }}>
                {conversation.title || 'Assistant IA'}
              </Text>
              <Text
                variant="caption"
                style={{ color: colors.secondaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}
              >
                Comment puis-je vous aider ?
              </Text>
            </Column>
          </Row>
        )

      default:
        if (conversation.title?.length) {
          return (
            <Row style={{ alignItems: 'center' }} gap={12}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: '1.2rem',
                }}
              >
                {conversation.title.charAt(0).toUpperCase()}
              </div>
              <Column gap={4}>
                <Text variant="body" style={{ fontWeight: 600 }}>
                  {conversation.title}
                </Text>
                <Text variant="caption" style={{ color: colors.secondaryText }}>
                  Cliquez pour voir les messages
                </Text>
              </Column>
            </Row>
          )
        } else {
          const member = conversation.members?.find(
            m => m.user?.id !== user?.id
          )

          return (
            <Row style={{ alignItems: 'center' }} gap={12}>
              <img
                src={member?.user?.pdpUrl}
                height={48}
                width={48}
                style={{ borderRadius: '14px', objectFit: 'cover' }}
              />
              <Column gap={4}>
                <Text variant="body" style={{ fontWeight: 600 }}>
                  {member?.user?.lastName} {member?.user?.firstName}
                </Text>
                <Text variant="caption" style={{ color: colors.secondaryText }}>
                  En ligne il y a 5 min
                </Text>
              </Column>
            </Row>
          )
        }
    }
  }

  return (
    <div
      onClick={() => selectConversation(conversation)}
      style={{
        cursor: 'pointer',
        padding: '12px',
        borderRadius: '16px',
        background: isSelected
          ? isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)'
          : 'transparent',
        transition: 'all 0.2s ease',
        border: isSelected
          ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
          : '1px solid transparent',
        marginBottom: '4px',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.background = isDark
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.02)'
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {getRender(conversation)}
    </div>
  )
}
