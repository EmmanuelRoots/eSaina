import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"

const MessagePage = ()=> {

  return (
      <SectionLayout>
        <LeftSection style={{flex : "1 1 20%"}}>
          <h1>Message liste</h1>
        </LeftSection>
        <CenterSection style={{flex : "1 1 60%"}}>
          <h1>Message detail</h1>
        </CenterSection>
        <RightSection style={{flex : "1 1 20%"}}>
          <h1>Message menu</h1>
        </RightSection>
      </SectionLayout>
  )
}

export default MessagePage