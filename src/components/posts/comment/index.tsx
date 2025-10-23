import type { HtmlHTMLAttributes } from "react"
import { Card, CardBody } from "../../card"
import type { CommentDTO } from "../../../data/dto/post"

type CommentsProps = HtmlHTMLAttributes<HTMLDivElement> & {
  comments : CommentDTO []
}
const Comments = ({comments, ...rest}:CommentsProps)=>{
  console.log({comments});
  

  return (
    <Card {...rest} style={{border:'none', borderRadius: '0 0 8px 8px'}}>
      <CardBody>
        <div>Liste des commentaires</div>
      </CardBody>
    </Card>
  )
}

export default Comments