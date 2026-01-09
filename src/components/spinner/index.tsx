import type { CSSProperties } from 'react'

import type { Logo } from '../../interfaces/components/form'
import './index.css'

type LoadingSpinnerProps = {
  size?: number
  logo?: Logo
  color?: string
  speed?: number
  style?: CSSProperties
}

const Spinner = ({
  size = 40,
  logo,
  color,
  speed = 1,
}: LoadingSpinnerProps) => {
  const bars: number = 12

  return (
    <div className={`loading-spinner-container`}>
      <div
        className="loading-spinner"
        style={
          {
            '--spinner-size': `${size}px`,
            '--spinner-color': color,
            '--animation-speed': `${speed}s`,
          } as React.CSSProperties
        }
      >
        {/* Barres rotatives */}
        {Array.from({ length: bars }).map((_, index: number) => (
          <div
            key={index}
            className="spinner-bar"
            style={
              {
                '--bar-index': index,
                '--total-bars': bars,
                '--bar-delay': `${(index / bars) * speed}s`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Logo au centre */}
        <div className="spinner-logo">
          <img
            src={logo?.logoUrl}
            width={logo?.logoWidth}
            height={logo?.logoHeight}
          />
        </div>
      </div>
    </div>
  )
}

export default Spinner
