import type { HTMLAttributes } from "react"
import type { SalonDTO } from "../../../data/dto/post"
import { Card, CardBody } from "../../card"
import Text from "../../text"
import Row from "../../row"
import { Notebook } from "lucide-react"

type SalonItemProps = HTMLAttributes<HTMLDivElement> & {
  salon : SalonDTO
}

export const SalonItem = ({salon, ...rest}:SalonItemProps)=>{

  return (
    <Card {...rest} style={{cursor:'pointer'}}>
      <CardBody>
        <Row style={{alignItems:'center'}} gap={4}>
          <Notebook size={20}/>
          <Text>{salon.title}</Text>
        </Row>
      </CardBody>
    </Card>
  )
}