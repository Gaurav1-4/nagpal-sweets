import './globals.css';

export const metadata = {
  title: 'Nagpal Sweets & Namkeen',
  description: 'Pure Veg | Since Generations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Intercept the extension's addListener error before Next.js catches it
                window.addEventListener('error', function(e) {
                  if (e.message && e.message.includes('addListener')) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true); // use capture phase
                
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && e.reason.message && e.reason.message.includes('addListener')) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true); // use capture phase
              }
            `
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
