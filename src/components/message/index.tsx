import { UseAuth } from "../../context/user"
import { SenderType, type MessageDTO } from "../../data/dto/message"
import { useThemeColors } from "../../hooks/theme"
import Row from "../row"
import Text from "../text"

export const MessageItem = (message:MessageDTO) => {
  const {user} = UseAuth()
  const colors = useThemeColors()
  const isMine = message.sender === SenderType.USER && user?.id === message.user.id

  return (
    <Row style={{justifyContent : isMine ? 'flex-end' : 'flex-start'}}>
      <Row style={{padding:'1%', flex:"0 1 50%", backgroundColor: isMine ? colors.primary : colors.secondary, borderRadius : 8}}>
        <Text>{message.content}</Text>
      </Row>
    </Row>
  )
}