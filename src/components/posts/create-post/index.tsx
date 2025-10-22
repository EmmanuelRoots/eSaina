import { useState } from "react"
import { UseAuth } from "../../../context/user"
import { Card, CardBody } from "../../card"
import Row from "../../row"
import { CreatePostModal } from "./create-post-modal"
import { styles } from "../styles"

export const CreatePost = ()=>{
  const {user} = UseAuth()
  const [open, setOpen] = useState<boolean>(false)
  

  return (
    <Row style={{justifyContent : "center"}}>
      <Card style={{width : "600px"}}>
        <CardBody>
          <Row gap={16}>
            <img src={user?.pdpUrl} width={40} height={40} style={{borderRadius:'50%'}}/>
            <button style={styles.createPostInput} onClick={()=>setOpen(true)}>Quoi de neuf, {user?.firstName}? </button>
          </Row>
        </CardBody>
      </Card>
      {open && <CreatePostModal open={open} onClose={()=>setOpen(false)}/>}
    </Row>
  )
}