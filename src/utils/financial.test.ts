import { ReceivableStatus } from '@/generated/prisma/enums'
import { calculateRemainingAmountInCents, getReceivableStatus } from '@/utils/financial'

describe('financial utils', () => {
  it('calculates remaining amount without negative balances', () => {
    expect(calculateRemainingAmountInCents(30000, 10000)).toBe(20000)
    expect(calculateRemainingAmountInCents(30000, 35000)).toBe(0)
  })

  it('marks fully paid receivables as paid', () => {
    expect(
      getReceivableStatus({
        dueDate: new Date('2026-07-20T00:00:00'),
        paidInCents: 30000,
        totalInCents: 30000,
      }),
    ).toBe(ReceivableStatus.PAID)
  })

  it('marks unpaid past receivables as overdue', () => {
    expect(
      getReceivableStatus({
        dueDate: new Date('2026-07-20T00:00:00'),
        paidInCents: 0,
        totalInCents: 30000,
      }),
    ).toBe(ReceivableStatus.OVERDUE)
  })
})
