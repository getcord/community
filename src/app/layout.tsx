import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cord Community",
  description: "Hub for Cord users to connect",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
          {children}
      </body>
    </html>
  );
}
