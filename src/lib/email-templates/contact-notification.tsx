import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  opportunityName?: string;
}

const Email = ({ name, email, phone, message, opportunityName }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nueva consulta desde GrowUp Investments</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nueva consulta recibida</Heading>
        <Text style={intro}>
          Alguien completó el formulario de contacto en el portal de GrowUp Investments.
        </Text>
        <Hr style={hr} />
        <Section>
          <Text style={row}><strong>Nombre:</strong> {name || "—"}</Text>
          <Text style={row}><strong>Email:</strong> {email || "—"}</Text>
          <Text style={row}><strong>Teléfono:</strong> {phone || "—"}</Text>
          {opportunityName ? (
            <Text style={row}><strong>Oportunidad:</strong> {opportunityName}</Text>
          ) : null}
        </Section>
        <Hr style={hr} />
        <Text style={label}>Mensaje</Text>
        <Text style={messageStyle}>{message || "(sin mensaje)"}</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Nueva consulta${data?.opportunityName ? ` — ${data.opportunityName}` : ""} — ${data?.name ?? "GrowUp"}`,
  displayName: "Notificación de contacto",
  to: "growupinvestmentllc@gmail.com",
  previewData: {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+1 555 123 4567",
    opportunityName: "329 NE 13th St",
    message: "Quiero más información sobre esta propiedad.",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "24px", maxWidth: "560px" };
const h1 = { color: "#1A1F18", fontSize: "22px", margin: "0 0 12px" };
const intro = { color: "#3E4A3C", fontSize: "14px", margin: "0 0 12px" };
const hr = { borderColor: "#E4E8DF", margin: "16px 0" };
const row = { color: "#1A1F18", fontSize: "14px", margin: "4px 0" };
const label = { color: "#3E4A3C", fontSize: "12px", textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: "0 0 6px" };
const messageStyle = { color: "#1A1F18", fontSize: "14px", whiteSpace: "pre-wrap" as const, margin: 0 };