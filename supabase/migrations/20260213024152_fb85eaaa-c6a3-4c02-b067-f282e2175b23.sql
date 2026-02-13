-- Add unique constraint on (user_id, alert_id) for upsert to work
-- First remove duplicate rows if any exist
DELETE FROM investor_alert_notifications a
USING investor_alert_notifications b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.alert_id = b.alert_id;

-- Add unique constraint
ALTER TABLE investor_alert_notifications
ADD CONSTRAINT investor_alert_notifications_user_alert_unique UNIQUE (user_id, alert_id);