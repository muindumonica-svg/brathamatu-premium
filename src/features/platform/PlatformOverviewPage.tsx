import { PageHeader } from '../../components/ui'
import { PlatformDashboard } from '../dashboard/PlatformDashboard'

export function PlatformOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BrathaMatu operations"
        title="Operations overview"
        description="Marketplace-wide tenant, identity, stock-taking and audit signals for BrathaMatu operations."
      />
      <PlatformDashboard />
    </div>
  )
}
