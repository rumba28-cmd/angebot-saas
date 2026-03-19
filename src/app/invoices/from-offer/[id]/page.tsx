import { InvoiceFromOffer } from "@/components/invoice-from-offer";

export default function InvoiceFromOfferPage({
  params
}: {
  params: { id: string };
}) {
  return <InvoiceFromOffer offerId={params.id} />;
}