export interface Invoice {
  invoiceId?: string;
  supplierTaxId?: string;
  supplierName?: string;
  invoiceDate?: string;
  totalAmount?: number;
  currency?: string;
}
