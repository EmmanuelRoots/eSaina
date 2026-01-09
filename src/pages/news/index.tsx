import PostComponent from '../../components/posts'
import SalonComponent from '../../components/salon-component'
import { ProfileCard } from './components/profile-card'
import { Card } from '../../components/card'
import { useTheme } from '../../hooks/theme'

import {
  CenterSection,
  LeftSection,
  RightSection,
  SectionLayout,
} from '../layout/section'

const NewsPage = () => {
  const { theme, colors } = useTheme()

  // const {user} = UseAuth()
  // const {isConnected} = useSSE(user?.id ?? '')
  // console.log(isConnected);

  const isDark = theme === 'dark'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark ? '#1a1f2e' : '#f5f7fa',
        paddingTop: '24px',
        paddingBottom: '48px',
      }}
    >
      <SectionLayout
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          gap: '28px',
          paddingLeft: '24px',
          paddingRight: '24px',
          position: 'relative',
        }}
      >
        {/* Left Sidebar - Profile & Nav */}
        <LeftSection
          style={{
            flex: '1 1 22%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: '280px',
          }}
        >
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              style={{
                background: isDark ? '#242b3d' : '#ffffff',
                borderRadius: '20px',
                border: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
                boxShadow: isDark
                  ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                  : '0 2px 12px rgba(0, 0, 0, 0.08)',
                padding: '24px',
                transition: 'all 0.3s ease',
              }}
            >
              <ProfileCard />
            </div>
          </div>
        </LeftSection>

        {/* Center - Feed */}
        <CenterSection
          style={{
            flex: '1 1 50%',
            maxWidth: '780px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <PostComponent />
        </CenterSection>

        {/* Right Sidebar - Salons/Trending */}
        <RightSection
          style={{
            flex: '1 1 28%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: '320px',
          }}
        >
          <div style={{ position: 'sticky', top: '90px' }}>
            <Card
              style={{
                border: `1px solid ${isDark ? 'rgba(167, 200, 92, 0.2)' : 'rgba(0, 0, 0, 0.06)'}`,
                background: isDark ? '#242b3d' : '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isDark
                  ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                  : '0 2px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  background: isDark
                    ? `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`
                    : `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}08 100%)`,
                  borderBottom: `1px solid ${isDark ? 'rgba(86, 168, 221, 0.2)' : 'rgba(86, 168, 221, 0.15)'}`,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: colors.default,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Salons Populaires
                </h3>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.85rem',
                    color: colors.secondaryText,
                    fontWeight: 400,
                  }}
                >
                  Rejoignez la conversation
                </p>
              </div>
              <div style={{ padding: '12px 0' }}>
                <SalonComponent />
              </div>
            </Card>
          </div>
        </RightSection>
      </SectionLayout>
    </div>
  )
}

export default NewsPage
