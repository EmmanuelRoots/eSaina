import { type ConversationDTO } from '../../data/dto/conversation'
import type { UserDTO } from '../../data/dto/user'
import type { FieldConfig } from '../../interfaces/components/form'

type ConvFactoryProps = {
  data: Partial<UserDTO>[]
  getSuggestionLabel: (item: Partial<UserDTO>) => string
  getSuggestionKey: (item: Partial<UserDTO>) => string
  onAutoCompleteSelect: (item: Partial<UserDTO>) => void
  onInputChange: (value: string) => void
}

export const conversationFromFactory = ({
  data,
  getSuggestionKey,
  getSuggestionLabel,
  onAutoCompleteSelect,
  onInputChange,
}: ConvFactoryProps) => {
  const formFields: FieldConfig<Partial<ConversationDTO>, Partial<UserDTO>>[] =
    [
      {
        label: 'Titre de la conversation',
        name: 'title',
        type: 'text',
      },
      {
        label: 'Choisir utilisateur',
        name: 'userId',
        type: 'autoComplete',
        data: data,
        required: true,
        getSuggestionLabel: getSuggestionLabel,
        onAutoCompleteSelect: onAutoCompleteSelect,
        getSuggestionKey: getSuggestionKey,
        onInputChange: onInputChange,
      },
    ]
  return formFields
}
