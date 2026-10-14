import PublicBottomNav from '@/components/ui/PublicBottomNav'

export default function PublicLayout({ children }) {
  return (
    <div className="pb-20 lg:pb-0">
      {children}
      <PublicBottomNav />
    </div>
  )
}
