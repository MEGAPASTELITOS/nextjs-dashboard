import { inter } from "./ui/fonts";
import "./ui/global.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body>
        {children}      
      <footer>
        <h2>modificado por MEGAPASTEITO</h2>
      </footer>
      </body>
    </html>
  );
}
