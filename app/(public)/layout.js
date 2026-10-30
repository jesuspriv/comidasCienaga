import PublicBottomNav from '@/components/ui/PublicBottomNav'
import SiteFooter from '@/components/ui/SiteFooter'

export default function PublicLayout({ children }) {
  return (
    <div className="pb-20 lg:pb-0">
      {children}
      <SiteFooter />
      <PublicBottomNav />
    </div>
  )
}
