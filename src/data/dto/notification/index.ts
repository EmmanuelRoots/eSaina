export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_CONVERSATION = 'NEW_CONVERSATION',
  BROADCAST = 'BROADCAST',
  NOTIFICATION = 'NOTIFICATION',
  CONNECTED = 'CONNECTED',
  NEW_POST = 'NEW_POST',
  /** Un ticket a été assigné à l'utilisateur */
  ISSUE_ASSIGNED = 'ISSUE_ASSIGNED',
  /** Le statut d'un ticket a changé */
  ISSUE_STATUS_CHANGED = 'ISSUE_STATUS_CHANGED',
  /** Un commentaire a été posté sur un ticket */
  ISSUE_COMMENTED = 'ISSUE_COMMENTED',
  /** Un ticket a été mis à jour (priorité, titre, etc.) */
  ISSUE_UPDATED = 'ISSUE_UPDATED',
}

/** Payload d'envoi d'une notification (input). */
export interface NotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  read: boolean;
}

/** Notification persistée telle que retournée par l'API (inclut id et createdAt). */
export interface StoredNotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}
