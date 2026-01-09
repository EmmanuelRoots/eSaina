import { useState } from 'react'
import { UseAuth } from '../../../context/user'
import { Card, CardBody } from '../../card'
import Row from '../../row'
import { CreatePostModal } from './create-post-modal'
import { useTheme } from '../../../hooks/theme'
import { Edit3 } from 'lucide-react'

export const CreatePost = () => {
  const { user } = UseAuth()
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'
  const [open, setOpen] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Row style={{ justifyContent: 'center' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '780px',
          border: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
          background: isDark ? '#242b3d' : '#ffffff',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          marginBottom: '16px',
        }}
      >
        <CardBody style={{ padding: '16px 20px' }}>
          <Row gap={16} style={{ alignItems: 'center' }}>
            <img
              src={user?.pdpUrl}
              width={48}
              height={48}
              style={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${colors.primary}`,
                boxShadow: `0 2px 8px ${colors.primary}30`,
              }}
            />
            <button
              style={{
                flex: 1,
                background: isDark
                  ? isHovered
                    ? `${colors.secondary}15`
                    : `${colors.secondaryBackground}`
                  : isHovered
                    ? `${colors.secondary}10`
                    : '#f0f2f5',
                border: `1px solid ${isHovered ? colors.secondary : 'transparent'}`,
                borderRadius: '24px',
                padding: '14px 20px',
                textAlign: 'left',
                color: colors.secondaryText,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isHovered
                  ? `0 2px 12px ${colors.secondary}20`
                  : 'none',
                transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
              }}
              onClick={() => setOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Edit3
                size={18}
                color={isHovered ? colors.secondary : colors.secondaryText}
                style={{ transition: 'color 0.25s ease' }}
              />
              <span>Quoi de neuf, {user?.firstName}?</span>
            </button>
          </Row>
        </CardBody>
      </Card>
      {open && <CreatePostModal open={open} onClose={() => setOpen(false)} />}
    </Row>
  )
}
