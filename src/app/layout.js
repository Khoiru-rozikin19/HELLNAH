import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://validation.transactions.payment-dana-rewards.my.id'),
  title: {
    default: "DANA Rewards",
    template: "%s | DANA",
  },
  description: "DANA Indonesia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
