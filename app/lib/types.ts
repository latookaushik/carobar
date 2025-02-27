// Define the Bank type based on your Prisma schema
export type Bank = {
    account_number: string;
    bank_name: string;
    bank_branch: string | null;
    currency: string | null;
    description: string | null;
    is_default: boolean | null;
    is_active: boolean | null;
    company_id: string;
  };