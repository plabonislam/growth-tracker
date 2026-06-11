import { z } from 'zod';

export const membershipStatusSchema = z.enum([
  'pending',
  'active',
  'on_break',
  'dropped_out',
  'rejected',
]);
export type MembershipStatus = z.infer<typeof membershipStatusSchema>;
export const MembershipStatus = membershipStatusSchema.Values;

export const enrollmentStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
]);
export type EnrollmentStatus = z.infer<typeof enrollmentStatusSchema>;
export const EnrollmentStatus = enrollmentStatusSchema.Values;

export const moduleProgressStatusSchema = z.enum([
  'to_do',
  'in_progress',
  'pending_confirmation',
  'completed',
]);
export type ModuleProgressStatus = z.infer<typeof moduleProgressStatusSchema>;
export const ModuleProgressStatus = moduleProgressStatusSchema.Values;

export const taskSubmissionStatusSchema = z.enum([
  'not_started',
  'submitted',
  'completed',
]);
export type TaskSubmissionStatus = z.infer<typeof taskSubmissionStatusSchema>;
export const TaskSubmissionStatus = taskSubmissionStatusSchema.Values;

export const certificationStatusSchema = z.enum([
  'not_required',
  'pending',
  'obtained',
]);
export type CertificationStatus = z.infer<typeof certificationStatusSchema>;
export const CertificationStatus = certificationStatusSchema.Values;

export const sessionTypeSchema = z.enum(['weekly', 'monthly']);
export type SessionType = z.infer<typeof sessionTypeSchema>;
export const SessionType = sessionTypeSchema.Values;

export const notificationTypeSchema = z.enum([
  'enrollment_approved',
  'enrollment_rejected',
  'membership_changed',
  'task_completed',
  'session_reminder',
  'certification_updated',
  'new_module',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export const NotificationType = notificationTypeSchema.Values;
