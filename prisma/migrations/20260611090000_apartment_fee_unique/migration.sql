-- Prevent duplicate fee invoices for the same apartment / period / name
-- (e.g. double-clicking "issue-all"). Must be applied before relying on
-- skipDuplicates in AdminFeesService.issueAll.
CREATE UNIQUE INDEX "apartment_fees_apartment_id_period_name_key"
  ON "apartment_fees" ("apartment_id", "period", "name");
