import { Conversations } from "../../components/conversation"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"
import { ConversationDetail } from "../../components/conversation/conversationDetail"
import {PlusCircle} from 'lucide-react'
import { useThemeColors } from "../../hooks/theme"
import Button from "../../components/Button"
import { useState, type CSSProperties } from "react"
import Text from "../../components/text"
import Modal from "../../components/modal"
import ModalHeader from "../../components/modal/header"
import { ModalBody } from "../../components/modal/body"
import { ModalFooter } from "../../components/modal/footer"
import AutoCompleteGeneric from "../../components/autoComplete"
import userApi from "../../services/api/user.api"
import type { UserDTO } from "../../data/dto/user"



const MessagePage = ()=> {
  const colors = useThemeColors()
  const buttonStyle : CSSProperties = {
    backgroundColor : colors.secondary,
    fontSize : '1rem',
    color : colors.primaryBackground
  }

  const [open,setOpen] = useState<boolean>(false)
  const UserAutoComplete = AutoCompleteGeneric<UserDTO>

  return (
    <>
      <SectionLayout>
        <LeftSection style={styles.leftStyle}>
          <Button icon={<PlusCircle color={colors.primaryBackground} size={30}/>} style={buttonStyle} onClick={()=>{setOpen(true)}}>
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
        <ModalHeader><Text variant="Headline">Créer une conversation</Text></ModalHeader>
        <ModalBody>
          <UserAutoComplete 
            fetchSuggestions={(page, limit, query) => userApi.searchUser({ page, limit, searchTerm: query })}
            getSuggestionLabel={(u)=>u.firstName + u.lastName}
            onSelect={(s)=>console.log(s)}
            getSuggestionKey={(u)=>u.id}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)} style={{padding:"2%", backgroundColor : colors.primary}}><Text color="primaryBackground">Annuler</Text></Button>
          <Button onClick={() => setOpen(false)} style={{padding:"2%", backgroundColor : colors.secondary}}><Text color="primaryBackground">Créer la conversation</Text></Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

const styles = {
  centerStyle : {
    flex : "1 1 60%",
    padding : 8
  },
  leftStyle : {
    flex : "1 1 20%", 
    height:"100vh",
    borderRightColor: "#f0f0f0",
    borderRightWidth:"1px",
    borderRightStyle : "solid",
    boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    paddingInline: '1%',
    gap : 8,
    paddingTop : 8
  },
  rightStyle : {
    flex : "1 1 20%",
    boxShadow: '-2px 0 6px rgba(0,0,0,.08)',
    padding : 8
  }

} satisfies Record<string, React.CSSProperties>

export default MessagePage