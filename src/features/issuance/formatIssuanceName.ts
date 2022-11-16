import { format } from 'date-fns'
import { IssuanceDto } from '@affinidi/client-issuance'

export function formatIssuanceName(issuance: IssuanceDto): string {
  return `${issuance.template.schema.type} at ${format(
    new Date(issuance.createdAt),
    'yyyy-MM-dd HH:mm',
  )}`
}
