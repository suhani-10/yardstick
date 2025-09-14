import './globals.css'
import UpgradeButton from '../components/UpgradeButton'

export const metadata = {
  title: 'Notes SaaS',
  description: 'Multi-tenant Notes Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
        <UpgradeButton />
      </body>
    </html>
  )
}