import { useRef } from "react"

import { UseAuth } from "../../../../context/user"
import Row from "../../../row"
import { styles } from "../../styles"

type InputCommentProps = {
  onPublish : (comment :string)=>void
}

export const InputComment = ({onPublish}:InputCommentProps)=> {
  const {user} = UseAuth()
  console.log('rerender input component');
  
  const contentRef = useRef<HTMLInputElement>(null)

  const handlePublish = () => {
    const value = contentRef.current?.value ?? ''
    if (value.trim()) {
      onPublish(value)
      contentRef.current!.value = '' // 👈 reset ici
    }
  }

  return (
    <Row gap={16} style={{padding:'16px 12px'}}>
      <img src={user?.pdpUrl} width={40} height={40} style={{borderRadius:'50%'}}/>
      <Row style={styles.commentInputContainer}>
        <input
          ref={contentRef} 
          placeholder="Écrivez un commentaire..." 
          style={styles.commentInput}
          onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
        />
        {/* {commentText && (
          <button
            onClick={()=>onPublish(commentText)}
            style={styles.sendCommentButton}
          >
            Publier
          </button>
        )} */}
      </Row>
    </Row>
  )
}