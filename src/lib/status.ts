import { Ionicons } from '@expo/vector-icons';

import { BadgeTone } from '@/components/ui';
import { ContributionStatus, LoanStatus } from '@/data/types';

interface StatusMeta {
  label: string;
  tone: BadgeTone;
  icon: keyof typeof Ionicons.glyphMap;
}

export const CONTRIBUTION_STATUS: Record<ContributionStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'warning', icon: 'time-outline' },
  approved: { label: 'Approved', tone: 'success', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', tone: 'danger', icon: 'close-circle-outline' },
};

export const LOAN_STATUS: Record<LoanStatus, StatusMeta> = {
  pending_terms: { label: 'Awaiting terms', tone: 'warning', icon: 'construct-outline' },
  pending_members: { label: 'Member vote', tone: 'info', icon: 'people-outline' },
  approved: { label: 'Approved', tone: 'success', icon: 'checkmark-circle-outline' },
  active: { label: 'Active', tone: 'primary', icon: 'card-outline' },
  rejected: { label: 'Rejected', tone: 'danger', icon: 'close-circle-outline' },
  repaid: { label: 'Repaid', tone: 'success', icon: 'ribbon-outline' },
  defaulted: { label: 'Defaulted', tone: 'danger', icon: 'alert-circle-outline' },
};
