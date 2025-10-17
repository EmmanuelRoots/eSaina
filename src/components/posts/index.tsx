import type { HTMLAttributes } from "react"

import type { PostDTO } from "../../data/dto/post"
import PostItem from "./post-item"
import Column from "../column"
import Row from "../row"
import { Card, CardBody } from "../card"

type PostComponentProps = HTMLAttributes<HTMLDivElement> & {
  postsList : PostDTO[]
}

const PostComponent = ({postsList, ...rest}:PostComponentProps)=>{
  
  return (
    <Column {...rest} style={{gap:'3rem'}}>
      <Row style={{justifyContent : "center"}}>
        <Card style={{width : "600px"}}>
          <CardBody>
            <p>Test</p>
          </CardBody>
        </Card>
      </Row>
      {
        postsList.map(p=>(<PostItem key={p.id} post={p}/>))
      }
    </Column>
  ) 
}

export default PostComponent