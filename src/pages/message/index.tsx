import { Suspense } from "react"
import { Conversations } from "../../components/conversation"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"
import { LoadingPage } from "../loading"
import { useThemeColors } from "../../hooks/theme"
import { logoFactory } from "../../services/factory/logo.factory"
import { ConversationDetail } from "../../components/conversation/conversationDetail"

const MessagePage = ()=> {
  const colors = useThemeColors()
  const logo = logoFactory(80,80)

  return (
      <SectionLayout>
        <LeftSection style={{flex : "1 1 20%"}}>
          <Suspense fallback={<LoadingPage color={colors.primary} logo={logo} height="100vh" spinnerSize={100}/>}>
            <Conversations />
          </Suspense>
        </LeftSection>
        <CenterSection style={{flex : "1 1 60%"}}>
          <h1>Message detail</h1>
          <ConversationDetail />
        </CenterSection>
        <RightSection style={{flex : "1 1 20%"}}>
          <h1>Message menu</h1>
        </RightSection>
      </SectionLayout>
  )
}

export default MessagePage