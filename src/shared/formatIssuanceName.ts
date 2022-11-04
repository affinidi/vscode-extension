import { format } from "date-fns";
import { IssuanceEntity } from "../services/issuancesService";

export function formatIssuanceName(issuance: IssuanceEntity): string {
  return `${issuance.template.schema.type} at ${format(
    new Date(issuance.createdAt),
    "yyyy-MM-dd HH:mm"
  )}`;
}
