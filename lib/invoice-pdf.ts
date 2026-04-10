import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/components/pdf/InvoiceDocument";
import type { Order } from "@/lib/types";

export async function buildInvoicePdfBuffer(
  order: Order,
  invoiceNumber: string,
): Promise<Buffer> {
  const doc = React.createElement(InvoiceDocument, {
    order,
    invoiceNumber,
  }) as React.ReactElement<DocumentProps>;
  return renderToBuffer(doc);
}
