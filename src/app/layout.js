import "./globals.css";

export const metadata = {
  title: "InterPoli",
  description: "Project Inter Poli",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
