export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_CONVERSATION = 'NEW_CONVERSATION',
  BROADCAST = 'BROADCAST',
  NOTIFICATION = 'NOTIFICATION'
}

export interface NotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  read: boolean;
}