import prisma from '@/lib/prisma';
import { getSiteContent, defaultMlmSettings, MlmSettings } from '@/lib/site-content';

export type SlotCheckResult = {
  allowed: boolean;
  reason?: 'HEAVEN1_COMPLETE' | 'SLOTS_FULL';
  message?: string;
};

export async function canJoinUnderReferrer(referrerId: string): Promise<SlotCheckResult> {
  const { dormantSlotExpiryDays } = await getSiteContent<MlmSettings>(
    'mlm_settings',
    defaultMlmSettings
  );

  const directMembers = await prisma.user.findMany({
    where: { referrerId },
    select: { is7thHeaven: true, createdAt: true },
  });

  const activeCount = directMembers.filter(m => m.is7thHeaven).length;

  if (activeCount >= 5) {
    return {
      allowed: false,
      reason: 'HEAVEN1_COMPLETE',
      message: "This member's Heaven 1 team is complete. Their invite code is no longer accepting new members.",
    };
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - dormantSlotExpiryDays);

  const validDormantCount = directMembers.filter(
    m => !m.is7thHeaven && m.createdAt > expiryDate
  ).length;

  if (activeCount + validDormantCount >= 5) {
    return {
      allowed: false,
      reason: 'SLOTS_FULL',
      message: `All 5 slots are currently filled. Slots may open after ${dormantSlotExpiryDays} days if members remain inactive.`,
    };
  }

  return { allowed: true };
}