import { InvoiceEditor } from "@/components/invoice-editor";

export default function InvoicePage({ params }: { params: { id: string } }) {
  return <InvoiceEditor invoiceId={params.id} />;
}