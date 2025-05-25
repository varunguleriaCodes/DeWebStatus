import { ThemeProvider } from '@/components/theme-provider'
import HomePage from '@/components/HomePage'

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HomePage />
    </ThemeProvider>
  )
}