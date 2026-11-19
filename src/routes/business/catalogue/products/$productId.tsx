import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/app/routeGuards'
import { AppShell } from '@/components/AppShell'
import { RequireTenant } from '@/components/Guards'
import { ProductDetailPage } from '@/features/catalogue/ProductDetailPage'

// Client-only: guards and pages read the stored session from the browser.
export const Route = createFileRoute('/business/catalogue/products/$productId')({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => (
    <AppShell>
      <RequireTenant>
        <ProductDetailPage />
      </RequireTenant>
    </AppShell>
  ),
})
