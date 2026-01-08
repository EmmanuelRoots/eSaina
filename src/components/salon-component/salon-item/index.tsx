import { useState, type HTMLAttributes } from "react"
import type { SalonDTO } from "../../../data/dto/post"
import { useTheme } from "../../../hooks/theme"
import { Hash, TrendingUp } from "lucide-react"

type SalonItemProps = HTMLAttributes<HTMLDivElement> & {
  salon: SalonDTO
}

export const SalonItem = ({ salon, ...rest }: SalonItemProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { theme, colors } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      {...rest}
      style={{
        cursor: 'pointer',
        padding: '14px 16px',
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isHovered
          ? isDark
            ? `linear-gradient(135deg, ${colors.secondary}15 0%, ${colors.primary}10 100%)`
            : `linear-gradient(135deg, ${colors.secondary}12 0%, ${colors.primary}08 100%)`
          : 'transparent',
        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
        borderLeft: `3px solid ${isHovered ? colors.primary : 'transparent'}`,
        boxShadow: isHovered
          ? isDark
            ? `0 4px 16px ${colors.primary}20, 0 0 0 1px ${colors.secondary}15`
            : `0 4px 16px ${colors.primary}15, 0 0 0 1px ${colors.secondary}10`
          : 'none',
        ...rest.style
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark
                ? `linear-gradient(135deg, ${colors.primary}25 0%, ${colors.secondary}20 100%)`
                : `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}15 100%)`,
              transition: 'all 0.3s ease',
              transform: isHovered ? 'rotate(5deg) scale(1.05)' : 'rotate(0deg) scale(1)',
              boxShadow: isHovered ? `0 4px 12px ${colors.primary}30` : 'none'
            }}
          >
            <Hash
              size={20}
              color={isHovered ? colors.primary : colors.secondary}
              style={{ transition: 'color 0.3s ease' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: isHovered ? 600 : 500,
                color: isHovered ? colors.primary : colors.default,
                transition: 'all 0.3s ease',
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}
            >
              {salon.title}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: colors.secondaryText,
                fontWeight: 400
              }}
            >
              Salon actif
            </span>
          </div>
        </div>
        <div
          style={{
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateX(0)' : 'translateX(-8px)'
          }}
        >
          <TrendingUp size={16} color={colors.primary} />
        </div>
      </div>
    </div>
  )
}