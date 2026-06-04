import { ProductClient } from "./_components/product-client";
export default function ProductPage({ params }: { params: { id: string } }) { return <ProductClient id={params?.id ?? ""} />; }
