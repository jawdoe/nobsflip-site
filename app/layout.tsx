export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-6xl px-6 py-4 flex justify-between items-center">
            <h1 className="font-bold tracking-wide">NOBSFLIP</h1>

            <nav className="flex gap-6 text-sm">
              <a href="/">Home</a>
              <a href="/fliplog">Flip Log</a>
              <a href="/about">About</a>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}