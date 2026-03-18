import { OfferEditor } from "@/components/offer-editor";

export default function OfferPage({ params }: { params: { id: string } }) {
  return <OfferEditor offerId={params.id} />;
}
