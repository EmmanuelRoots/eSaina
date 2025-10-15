import { useCallback, useEffect, useState } from "react"

import GenericForm from "../../form"
import Modal from "../../modal"
import { ModalBody } from "../../modal/body"
import ModalHeader from "../../modal/header"
import Text from "../../text"
import { conversationFromFactory } from "../../../services/factory/createConversation.factory"
import type { UserDTO } from "../../../data/dto/user"
import userApi from "../../../services/api/user.api"
import { ConversationType, MemberRole, type ConversationDTO } from "../../../data/dto/conversation"
import conversationApi from "../../../services/api/conversation.api"
import { UseAuth } from "../../../context/user"

type CreateConvModalProps = {
  open : boolean,
  oncClose : ()=>void,
  onFinished : ()=> void
}

const CreateConversationModal = ({open, oncClose, onFinished}:CreateConvModalProps) => {
  console.log('render conversation modal create');
  const {user} = UseAuth()
  const [users, setUsers] = useState<UserDTO[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const fetchUser = useCallback(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        return
      }
  
      setLoading(true)
      try {
        const res = await userApi.searchUser({ 
          page: 1, 
          limit: 10, 
          searchTerm 
        })
        setUsers(res)
      } catch (err) {
        console.error('Erreur lors de la recherche:', err)
        setUsers([])
      } finally {
        setLoading(false)
      }
  }, [])

  const initialValues : Partial<ConversationDTO> = {
    title : '',
    userId : ''
  }

  const handleInputChange = useCallback((query: string) => {
    fetchUser(query)
  }, [fetchUser])

  const getLabel = (u:Partial<UserDTO>) => `${u.firstName} ${u.lastName}`
  const getKey = (u:Partial<UserDTO>) => u.id!.toString()
  const createConvFields = conversationFromFactory({data:users,getSuggestionLabel:getLabel,getSuggestionKey:getKey,onAutoCompleteSelect:()=>{/** */}, onInputChange:handleInputChange})
  
  useEffect(() => {
    const loadInitialUsers = async () => {
      setLoading(true)
      try {
        const res = await userApi.searchUser({ 
          page: 1, 
          limit: 10, 
          searchTerm: '' 
        })
        setUsers(res)
      } catch (err) {
        console.error('Erreur lors du chargement initial:', err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadInitialUsers()
  }, [])  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (conv:any)=> {
    console.log({conv});
    
    const newConv:Partial<ConversationDTO> = {
      userId : conv.userId.id,
      title : conv.title,
      type : ConversationType.DIRECT,
      members : [{
          userId : conv.userId.id,
          role : MemberRole.MEMBER
        },
        {
          userId : user?.id,
          role : MemberRole.ADMIN
        }
      ]
    }
    conversationApi.createConversation(newConv).then(res=>{
      console.log({res});
    }).finally(()=>{
      onFinished()
      oncClose()
    })
    
  }

  return (
    <Modal isOpen={open} onClose={oncClose} size="lg">
        <ModalHeader>
          <Text variant="Headline">Créer une conversation</Text>
        </ModalHeader>
        <ModalBody>
          <GenericForm 
            fields={createConvFields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitText="Créer la conversation"
            loading = {loading}
          />
        </ModalBody>
      </Modal>
  )
}

export default CreateConversationModal