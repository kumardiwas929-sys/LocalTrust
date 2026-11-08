import AuditLog from '../models/AuditLog.js';

export const logAdminAction = async ({ adminId, action, targetType, targetId, details, req }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers['user-agent'] || '';

    await AuditLog.create({
      adminId,
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};
