import "./globals.css";

export const metadata = {
  title: "Sathi Admin",
  description: "Secure administration workspace for the Sathi service marketplace.",
    icons: {
    icon: "/logo_without_brandname.png",
    shortcut: "/logo_without_brandname.png",
    apple: "/logo_without_brandname.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
