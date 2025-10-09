import { Conversations } from "../../components/conversation"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"
import { ConversationDetail } from "../../components/conversation/conversationDetail"
import { PlusCircle } from 'lucide-react'
import { useThemeColors } from "../../hooks/theme"
import Button from "../../components/Button"
import { useCallback, useEffect, useState, type CSSProperties } from "react"
import Text from "../../components/text"
import Modal from "../../components/modal"
import ModalHeader from "../../components/modal/header"
import { ModalBody } from "../../components/modal/body"
import userApi from "../../services/api/user.api"
import type { UserDTO } from "../../data/dto/user"
import GenericForm from "../../components/form"
import { conversationFromFactory } from "../../services/factory/createConversation.factory"
import { ConversationType, MemberRole, type ConversationDTO } from "../../data/dto/conversation"
import conversationApi from "../../services/api/conversation.api"
import { UseConversation } from "../../context/conversation"

const MessagePage = () => {
  const colors = useThemeColors()
  const {pushConversation} = UseConversation()
  const initialValues : Partial<ConversationDTO> = {
    title : '',
    userId : ''
  }

  
  const buttonStyle: CSSProperties = {
    backgroundColor: colors.secondary,
    fontSize: '1rem',
    color: colors.primaryBackground
  }

  const [open, setOpen] = useState<boolean>(false)
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
  const handleInputChange = useCallback((query: string) => {
    fetchUser(query)
  }, [fetchUser])
  
  const getLabel = (u:Partial<UserDTO>) => `${u.firstName} ${u.lastName}`
  const getKey = (u:Partial<UserDTO>) => u.id!.toString()
  const createConvFields = conversationFromFactory({data:users,getSuggestionLabel:getLabel,getSuggestionKey:getKey,onAutoCompleteSelect:()=>{/** */}, onInputChange:handleInputChange})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (conv:any)=> {
    // console.log({conv})
    const newConv:Partial<ConversationDTO> = {
      userId : conv.userId.id,
      title : conv.title,
      type : ConversationType.DIRECT,
      members : [{
        userId : conv.userId.id,
        role : MemberRole.MEMBER
      }]
    }
    conversationApi.createConversation(newConv).then(res=>{
      console.log({res});
    }).finally(()=>{
      setOpen(false)
      pushConversation()
    })
    
  }

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
          <Text variant="Headline">Messages</Text>
          <ConversationDetail />
        </CenterSection>
        <RightSection style={styles.rightStyle}>
          <Text variant="Headline">Information</Text>
        </RightSection>
      </SectionLayout>

      <Modal isOpen={open} onClose={() => setOpen(false)} size="lg">
        <ModalHeader>
          <Text variant="Headline">Créer une conversation</Text>
        </ModalHeader>
        <ModalBody>
          <GenericForm 
            fields={createConvFields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitText="Créer la conversation"
          />
        </ModalBody>
        {/* <ModalFooter>
          <Button 

  const [open, setOpen] = useState<boolean>(false)
  const [users, setUsers] = useState<UserDTO[]>([])
  const [loading, setLoading] = useState<boolean>(false)

            onClick={() => setOpen(false)} 
            style={{ padding: "2%", backgroundColor: colors.primary }}
          >
            <Text color="primaryBackground">Annuler</Text>
          </Button>
          <Button 
            onClick={() => setOpen(false)} 
            style={{ padding: "2%", backgroundColor: colors.secondary }}
          >
            <Text color="primaryBackground">Créer la conversation</Text>
          </Button>
        </ModalFooter> */}
      </Modal>
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