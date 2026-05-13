import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 w-full overflow-hidden">
        <div className="h-full overflow-y-auto px-4 sm:px-6 py-20 md:py-8 max-w-5xl mx-auto">{children}</div>
      </div>
    </div>
  )
}
