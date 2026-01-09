import React from 'react'
import { Card, CardBody } from '../../../components/card'
import { UseAuth } from '../../../context/user'
import { useThemeColors } from '../../../hooks/theme'
import { User, Bookmark, Calendar, Settings } from 'lucide-react'

export const ProfileCard = () => {
  const { user } = UseAuth()
  const colors = useThemeColors()

  return (
    <Card
      style={{
        border: 'none',
        boxShadow: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <CardBody style={{ padding: 0 }}>
        {/* User Mini Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
            padding: '0 4px',
            transition: 'transform 0.2s ease',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={user?.pdpUrl}
              alt="Profile"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${colors.primary}`,
                boxShadow: `0 4px 12px ${colors.primary}40`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: `2px solid ${colors.primaryBackground}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: colors.default,
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {user?.firstName} {user?.lastName}
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                color: colors.secondaryText,
                fontWeight: 500,
              }}
            >
              @{user?.firstName?.toLowerCase()}
              {user?.lastName?.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SidebarItem
            icon={<User size={20} color={colors.secondary} />}
            label="Mon Profil"
            colors={colors}
          />
          <SidebarItem
            icon={<Bookmark size={20} color={colors.secondary} />}
            label="Posts Sauvegardés"
            colors={colors}
          />
          <SidebarItem
            icon={<Calendar size={20} color={colors.secondary} />}
            label="Événements"
            colors={colors}
          />

          <div
            style={{
              marginTop: '16px',
              borderTop: `1px solid ${colors.secondary}25`,
              paddingTop: '16px',
            }}
          >
            <SidebarItem
              icon={<Settings size={20} color={colors.secondary} />}
              label="Paramètres"
              colors={colors}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

const SidebarItem = ({
  icon,
  label,
  colors,
}: {
  icon: React.ReactNode
  label: string
  colors: any
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 10px',
        borderRadius: '12px',
        cursor: 'pointer',
        color: isHovered ? colors.primary : colors.default,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '0.95rem',
        fontWeight: isHovered ? 600 : 500,
        backgroundColor: isHovered ? `${colors.secondary}18` : 'transparent',
        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
        boxShadow: isHovered ? `0 2px 8px ${colors.secondary}20` : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          transition: 'transform 0.25s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {icon}
      </div>
      <span>{label}</span>
    </div>
  )
}
