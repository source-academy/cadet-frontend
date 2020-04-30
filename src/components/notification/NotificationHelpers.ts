import { AssessmentCategories } from '../assessment/assessmentShape';
import { Notification, NotificationFilterFunction } from './notificationShape';

type filterByTypeOptions = AssessmentCategories | 'Grading';

/**
 * @return A function that takes in an array of notification and filters it by assessment id.
 */
export function filterNotificationsByAssessment(assessmentId: number): NotificationFilterFunction {
  return (notifications: Notification[]) =>
    notifications.filter(n => !n.submission_id && n.assessment_id === assessmentId);
}

/**
 * @return A function that takes in an array of notification and filters it by submission id.
 */
export function filterNotificationsBySubmission(submissionId: number): NotificationFilterFunction {
  return (notifications: Notification[]) =>
    notifications.filter(n => n.submission_id === submissionId);
}

/**
 * Notifications will be filtered to either one of the Assessment Category, or the Grading Category.
 *
 * Notifications with a submission id belongs to the Grading category.
 *
 * @return A function that takes in an array of notification and filters it by the type of notification.
 */
export function filterNotificationsByType(
  assessmentType: filterByTypeOptions
): NotificationFilterFunction {
  return (notifications: Notification[]) =>
    notifications.filter(n => {
      if (assessmentType === 'Grading') {
        return n.submission_id !== undefined;
      }
      return !n.submission_id && assessmentType === n.assessment_type;
    });
}

/**
 * @return A function that takes in an array of notification and filters it by notification id.
 */
export function filterNotificationsById(id: number): NotificationFilterFunction {
  return (notifications: Notification[]) => notifications.filter(n => n.id === id);
}
