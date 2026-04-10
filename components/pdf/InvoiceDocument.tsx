import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Order } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  h1: { fontSize: 20, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  cell: { flex: 1 },
  cellQty: { width: 40 },
  cellPrice: { width: 80, textAlign: "right" },
  line: { flexDirection: "row", marginBottom: 6 },
  total: { marginTop: 12, textAlign: "right", fontSize: 12 },
});

export function InvoiceDocument({
  order,
  invoiceNumber,
}: {
  order: Order;
  invoiceNumber: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Facture Tekach</Text>
        <View style={styles.row}>
          <Text>N° {invoiceNumber}</Text>
          <Text>
            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text>Client : {order.contactEmail}</Text>
          {order.contactPhone ? (
            <Text>Tél. : {order.contactPhone}</Text>
          ) : null}
          {order.shippingAddress ? (
            <Text>Livraison : {order.shippingAddress}</Text>
          ) : null}
        </View>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { flex: 2 }]}>Article</Text>
          <Text style={styles.cellQty}>Qté</Text>
          <Text style={styles.cellPrice}>Prix</Text>
        </View>
        {order.items.map((line, i) => (
          <View key={i} style={styles.line}>
            <Text style={[styles.cell, { flex: 2 }]}>{line.title}</Text>
            <Text style={styles.cellQty}>{line.quantity}</Text>
            <Text style={styles.cellPrice}>
              {(line.unitPrice * line.quantity).toFixed(2)} €
            </Text>
          </View>
        ))}
        <Text style={styles.total}>
          Total TTC : {order.total.toFixed(2)} €
        </Text>
        <Text style={{ marginTop: 24, color: "#666" }}>
          Tekach — Agent e-commerce omnicanal. Merci pour votre commande.
        </Text>
      </Page>
    </Document>
  );
}
