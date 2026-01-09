import { useRef } from 'react'
import { UseAuth } from '../../../context/user'
import { useThemeColors } from '../../../hooks/theme'
import Button from '../../Button'
import Column from '../../column'
import Modal from '../../modal'
import { ModalBody } from '../../modal/body'
import { ModalFooter } from '../../modal/footer'
import ModalHeader from '../../modal/header'
import Row from '../../row'
import Text from '../../text'
import { styles } from '../styles'
import { type PostDTO, PostType } from '../../../data/dto/post'
import { UsePost } from '../../../context/post'
import postApi from '../../../services/api/post.api'

type CreatePostModalProps = {
  open: boolean
  onClose: () => void
}

export const CreatePostModal = ({ open, onClose }: CreatePostModalProps) => {
  const { user } = UseAuth()
  const { selectedSalon } = UsePost()
  const colors = useThemeColors()

  const contentRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!contentRef.current?.value.trim()) return
    const newPost: Partial<PostDTO> = {
      author: user,
      salon: selectedSalon,
      type: PostType.TEXT,
      content: contentRef.current?.value,
    }
    console.log({ newPost })
    postApi
      .createPost(newPost)
      .then(res => {
        console.log({ res })
      })
      .finally(() => {
        onClose()
      })
  }

  return (
    <Modal isOpen={open} onClose={onClose}>
      <form onSubmit={e => e.preventDefault()}>
        <ModalHeader>
          <Text variant="Headline">Créer une publication</Text>
        </ModalHeader>
        <ModalBody>
          <Column gap={16}>
            <Row gap={16}>
              <img
                src={user?.pdpUrl}
                width={40}
                height={40}
                style={{ borderRadius: '50%' }}
              />
              <Text style={{ alignContent: 'center' }}>
                {user?.firstName + ' ' + user?.lastName}
              </Text>
            </Row>
            <Row>
              <textarea
                required
                style={styles.textarea}
                placeholder="Quoi de neuf ?"
                ref={contentRef}
              />
            </Row>
          </Column>
        </ModalBody>
        <ModalFooter>
          <Row style={{ flex: 1 }}>
            <Button
              style={{
                flex: 1,
                padding: '1%',
                backgroundColor: colors.secondary,
              }}
              onClick={handleSubmit}
            >
              <Text variant="Headline" color="primaryBackground">
                Publier
              </Text>
            </Button>
          </Row>
        </ModalFooter>
      </form>
    </Modal>
  )
}
