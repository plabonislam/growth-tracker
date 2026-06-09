import { describe, it, expect } from 'vitest';
import {
  MembershipStatus,
  ModuleProgressStatus,
  CertificationStatus,
  NotificationType,
  SessionType,
} from '../enums';

describe('MembershipStatus', () => {
  it('has exactly 5 values', () => {
    const values = Object.values(MembershipStatus);
    expect(values).toHaveLength(5);
    expect(values).toContain('pending');
    expect(values).toContain('active');
    expect(values).toContain('on_break');
    expect(values).toContain('dropped_out');
    expect(values).toContain('rejected');
  });
});

describe('ModuleProgressStatus', () => {
  it('has exactly 4 values', () => {
    const values = Object.values(ModuleProgressStatus);
    expect(values).toHaveLength(4);
    expect(values).toContain('to_do');
    expect(values).toContain('in_progress');
    expect(values).toContain('pending_confirmation');
    expect(values).toContain('completed');
  });
});

describe('CertificationStatus', () => {
  it('has exactly 3 values', () => {
    const values = Object.values(CertificationStatus);
    expect(values).toHaveLength(3);
    expect(values).toContain('not_required');
    expect(values).toContain('pending');
    expect(values).toContain('obtained');
  });
});

describe('NotificationType', () => {
  it('has exactly 7 values', () => {
    const values = Object.values(NotificationType);
    expect(values).toHaveLength(7);
    expect(values).toContain('enrollment_approved');
    expect(values).toContain('enrollment_rejected');
    expect(values).toContain('membership_changed');
    expect(values).toContain('task_completed');
    expect(values).toContain('session_reminder');
    expect(values).toContain('certification_updated');
    expect(values).toContain('new_module');
  });
});

describe('SessionType', () => {
  it('has exactly 2 values', () => {
    const values = Object.values(SessionType);
    expect(values).toHaveLength(2);
    expect(values).toContain('weekly');
    expect(values).toContain('monthly');
  });
});
