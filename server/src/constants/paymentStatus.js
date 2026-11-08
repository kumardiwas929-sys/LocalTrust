export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHOD = {
  CASH: 'cash',
  ONLINE: 'online',
};

export const ALL_PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);
export const ALL_PAYMENT_METHODS = Object.values(PAYMENT_METHOD);
