import type { HTMLAttributes } from 'react'
import { UseAuth } from '../../context/user'
import { SenderType, type MessageDTO } from '../../data/dto/message'
import { useThemeColors } from '../../hooks/theme'
import Row from '../row'
import Text from '../text'

type MessageItemProps = HTMLAttributes<HTMLDivElement> & {
  message: MessageDTO
}

export const MessageItem = ({ message, ...rest }: MessageItemProps) => {
  const { user } = UseAuth()
  const colors = useThemeColors()
  const isMine =
    message.sender === SenderType.USER && user?.id === message.user.id

  return (
    <Row
      style={{ justifyContent: isMine ? 'flex-end' : 'flex-start' }}
      {...rest}
    >
      <Row
        style={{
          padding: '1%',
          flex: '0 1 50%',
          backgroundColor: isMine ? colors.primary : colors.secondary,
          borderRadius: 8,
        }}
      >
        <Text color="primaryBackground" variant="body">
          {message.content}
        </Text>
      </Row>
    </Row>
  )
}
