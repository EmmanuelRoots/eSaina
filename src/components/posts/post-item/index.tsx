import { useState, type HTMLAttributes } from "react"

import { ReactionType, type PostDTO, type ReactionDTO } from "../../../data/dto/post"
import { Card, CardBody, CardFooter, CardHeader } from "../../card"
import Row from "../../row"
import { Globe, MessageCircle, ThumbsUp } from "lucide-react"
import Text from "../../text"
import Column from "../../column"
import { getTimeBetweenTwoDate } from "../../../services/utils/date.utils"
import { UseAuth } from "../../../context/user"
import postApi from "../../../services/api/post.api"
import Comments from "../comment"
import { useTheme } from "../../../hooks/theme"

type PostItemProps = HTMLAttributes<HTMLDivElement> & {
  post: PostDTO
}

const PostItem = ({ post, ...rest }: PostItemProps) => {
  const { user } = UseAuth()
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'
  const [reactions, setReactions] = useState<ReactionDTO[]>(post.reactions ?? [])
  const [myReaction, setMyReaction] = useState<ReactionDTO | undefined>(reactions.find(r => r.user?.id === user?.id) ?? undefined)
  const [showComments, setShowComments] = useState<boolean>(false)
  const [isLikeHovered, setIsLikeHovered] = useState(false)
  const [isCommentHovered, setIsCommentHovered] = useState(false)

  const isLikedByMe = (reactions: ReactionDTO[]) => {
    if (!reactions.length) return false

    return reactions.some(r => r.id === myReaction?.id)
  }
  const [liked, setLiked] = useState<boolean>(isLikedByMe(post.reactions))



  const deleteMyReaction = () => {
    const newReactions = reactions.filter(r => r.id !== myReaction?.id)
    console.log({ newReactions });

    setReactions(newReactions)
  }


  const handleLiked = () => {
    if (!liked) { //onliking
      const newReactions: Partial<ReactionDTO> = {
        post,
        type: ReactionType.LIKE
      }
      postApi.addRecation(newReactions).then(res => {
        setReactions(prev => [...prev, res])
      })
    } else { //on disliking
      deleteMyReaction()
      if (myReaction?.id) {
        postApi.deleteReaction(myReaction?.id).finally(() => {
          setMyReaction(undefined)
        })
      }
    }
    setLiked(prev => !prev)
  }


  return (
    <>
      <Card
        {...rest}
        style={{
          border: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
          background: isDark
            ? '#242b3d'
            : '#ffffff',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          marginBottom: '16px'
        }}
      >
        <CardHeader style={{ padding: '16px 20px' }}>
          <Row style={{ alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={post.author.pdpUrl}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${colors.primary}`,
                  boxShadow: `0 2px 8px ${colors.primary}30`
                }}
              />
            </div>
            <Column style={{ flex: 1 }}>
              <Text
                variant="subtitle1"
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: colors.default,
                  letterSpacing: '-0.01em'
                }}
              >
                {post.author.lastName} {post.author.firstName}
              </Text>
              <Row style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: colors.secondaryText,
                marginTop: '2px'
              }}>
                <Text variant="caption" style={{ color: colors.secondaryText }}>
                  {getTimeBetweenTwoDate(post.createdAt)}
                </Text>
                <span style={{ margin: '0 2px', color: colors.secondaryText }}>·</span>
                <Globe size={13} color={colors.secondaryText} />
              </Row>
            </Column>
          </Row>
        </CardHeader>
        <CardBody style={{ padding: '0 20px 16px 20px' }}>
          <Text style={{
            fontSize: '0.95rem',
            lineHeight: 1.5,
            color: colors.default
          }}>
            {post.content}
          </Text>
        </CardBody>

        {/* Stats Section */}
        {(reactions.length > 0 || post.comments.length > 0) && (
          <div style={{
            padding: '12px 20px',
            borderTop: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.15)' : 'rgba(86, 168, 221, 0.1)'}`,
            borderBottom: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.15)' : 'rgba(86, 168, 221, 0.1)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {reactions.length > 0 && (
              <Row style={{ alignItems: 'center', gap: 8 }}>
                <div style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 2px 8px ${colors.primary}40`
                }}>
                  <ThumbsUp size={13} color="white" fill="white" />
                </div>
                <Text style={{
                  fontSize: '0.9rem',
                  color: colors.secondaryText,
                  fontWeight: 500
                }}>
                  {reactions.length}
                </Text>
              </Row>
            )}
            {post.comments.length > 0 && (
              <Text style={{
                fontSize: '0.9rem',
                color: colors.secondaryText,
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}>
                {post.comments.length > 1
                  ? `${post.comments.length} commentaires`
                  : `${post.comments.length} commentaire`}
              </Text>
            )}
          </div>
        )}

        <CardFooter style={{
          borderRadius: '0 0 16px 16px',
          padding: '8px 12px',
          background: 'transparent'
        }}>
          <Row style={{ gap: '8px' }}>
            <button
              onClick={handleLiked}
              onMouseEnter={() => setIsLikeHovered(true)}
              onMouseLeave={() => setIsLikeHovered(false)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: isLikeHovered
                  ? isDark
                    ? `${colors.primary}15`
                    : `${colors.primary}10`
                  : 'transparent',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: liked ? colors.primary : colors.secondaryText,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isLikeHovered ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isLikeHovered
                  ? `0 2px 8px ${colors.primary}20`
                  : 'none'
              }}
            >
              <ThumbsUp
                size={20}
                fill={liked ? colors.primary : "none"}
                color={liked ? colors.primary : colors.secondaryText}
                style={{
                  transition: 'all 0.25s ease',
                  transform: isLikeHovered ? 'scale(1.1)' : 'scale(1)'
                }}
              />
              <span>J'aime</span>
            </button>
            <button
              onClick={() => setShowComments(prev => !prev)}
              onMouseEnter={() => setIsCommentHovered(true)}
              onMouseLeave={() => setIsCommentHovered(false)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                backgroundColor: isCommentHovered
                  ? isDark
                    ? `${colors.secondary}15`
                    : `${colors.secondary}10`
                  : 'transparent',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: showComments ? colors.secondary : colors.secondaryText,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isCommentHovered ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isCommentHovered
                  ? `0 2px 8px ${colors.secondary}20`
                  : 'none'
              }}
            >
              <MessageCircle
                size={20}
                color={showComments ? colors.secondary : colors.secondaryText}
                style={{
                  transition: 'all 0.25s ease',
                  transform: isCommentHovered ? 'scale(1.1)' : 'scale(1)'
                }}
              />
              <span>Commenter</span>
            </button>
          </Row>
        </CardFooter>
        {showComments && <Comments post={post} />}
      </Card>

    </>
  )
}

export default PostItem