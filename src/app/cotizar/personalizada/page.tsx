import { CotizacionWizard } from "@/components/CotizacionWizard";

export const metadata = {
  title: "Cotización a medida",
  description:
    "¿No encontrás la salida que buscás? Elegí tu destino soñado y nosotros lo hacemos realidad.",
};

export default function CotizacionPersonalizadaPage() {
  return <CotizacionWizard personalizada />;
}
