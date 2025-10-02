import "./globals.css";

export const metadata = {
  title: "Inter Poli",
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
