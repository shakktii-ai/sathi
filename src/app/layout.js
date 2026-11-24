import "./globals.css";

export const metadata = {
  title: "Sathi Admin",
  description: "Secure administration workspace for the Sathi service marketplace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
