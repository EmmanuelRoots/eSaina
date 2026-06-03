/**
 * Utilitaire pour les notifications navigateur (Web Notifications API) et le son.
 *
 * Fournit :
 * - requestNotificationPermission() : demande la permission à l'utilisateur
 * - showBrowserNotification()       : affiche une notification OS + joue un son
 * - playNotificationSound()         : joue uniquement le chime via Web Audio API
 *
 * La notification est affichée quel que soit l'état de focus de la fenêtre.
 * Le son est généré dynamiquement sans fichier externe (Web Audio API).
 */

/**
 * Demande au navigateur l'autorisation d'afficher des notifications.
 * Retourne la permission actuelle sans re-demander si déjà tranchée.
 *
 * @returns La permission accordée : `'granted'`, `'denied'` ou `'default'`.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied'
  if (window.Notification.permission !== 'default') return window.Notification.permission
  return window.Notification.requestPermission()
}

/**
 * Joue un court chime de notification via Web Audio API (aucun fichier audio requis).
 * Deux notes enchaînées produisent un son proche des notifications Gmail/Slack.
 * Échoue silencieusement si le contexte audio est indisponible.
 */
export const playNotificationSound = (): void => {
  try {
    const AudioCtx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()

    /**
     * Joue une note sinusoïdale avec une enveloppe gain fade-in/fade-out.
     *
     * @param freq      - Fréquence en Hz.
     * @param startTime - Instant de départ (secondes depuis ctx.currentTime).
     * @param duration  - Durée de la note en secondes.
     * @param peak      - Volume maximum (0–1).
     */
    const playNote = (freq: number, startTime: number, duration: number, peak: number): void => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(peak, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    // Accord deux notes : La5 (880 Hz) puis Ré6 (1108 Hz) — proche du chime Gmail
    playNote(880, now, 0.18, 0.28)
    playNote(1108.73, now + 0.14, 0.22, 0.22)

    // Ferme le contexte audio après la fin des notes pour libérer les ressources
    setTimeout(() => { void ctx.close() }, 700)
  } catch {
    // Web Audio API indisponible ou bloquée par le navigateur — silence
  }
}

export interface BrowserNotificationOptions {
  /** Titre principal affiché en gras dans la notification OS. */
  title: string
  /** Corps du message. */
  body: string
  /** URL de l'icône (défaut : /favicon.ico). */
  icon?: string
  /**
   * Tag de déduplication — une nouvelle notification avec le même tag
   * remplace la précédente au lieu d'en créer une nouvelle.
   */
  tag?: string
}

/**
 * Affiche une notification navigateur (OS) et joue le son de notification.
 *
 * Ne fait rien si la permission n'est pas accordée ou si l'API est absente.
 * Un clic sur la notification ramène le focus sur la fenêtre.
 * La notification se ferme automatiquement après 5 secondes.
 *
 * @param options - Titre, corps, icône et tag optionnels.
 */
export const showBrowserNotification = (options: BrowserNotificationOptions): void => {
  if (!('Notification' in window)) return
  if (window.Notification.permission !== 'granted') return

  // `silent: true` car on gère le son nous-mêmes via Web Audio API
  const notif = new window.Notification(options.title, {
    body: options.body,
    icon: options.icon ?? '/favicon.ico',
    tag: options.tag,
    silent: true,
  })

  playNotificationSound()

  notif.onclick = () => {
    window.focus()
    notif.close()
  }

  setTimeout(() => notif.close(), 5000)
}
