import { Card, CardBody } from "../../components/card"
import Column from "../../components/column"
import Row from "../../components/row"
import { CenterSection, LeftSection, RightSection, SectionLayout } from "../layout/section"

const NewsPage = ()=> {


  return (
    <SectionLayout style={{height:"100vh"}}>
      <RightSection style={{flex : "1 1 15%"}}>
        <aside style={{ background: "#333", color: "#fff" }}>
          <button >Test</button>
        </aside>
      </RightSection>
      <CenterSection style={{flex : "1 1 70%", overflowY:"auto"}}>
        <Column style={{flex:1,padding:10}}>
          <Row style={{justifyContent : "center"}}>
            <Card style={{width : "600px"}}>
              <CardBody>
                <p>Test</p>
              </CardBody>
            </Card>
          </Row>
          {
            [...Array(200)].map((_, index) => (
              <Row key={index}>
                <h1>Test {index+1}</h1>
              </Row>
            ))
          }
        </Column>
      </CenterSection>
      <LeftSection style={{flex : "1 1 15%"}}>
        <Column ></Column>
      </LeftSection>
    </SectionLayout>
    
  )
}

export default NewsPage