// app/layout.tsx


export const metadata = {
  title: "Geo Alertas Web",
  description: "Sistema de infraestructura de agua y saneamiento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}