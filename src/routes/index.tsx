import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/home/HomePage'

const title = 'BrathaMatu — Stock-taking, POS and inventory control in one workspace'
const description =
  'Accurate stock counts without slowing your business. Professional stock-taking, point of sale and inventory control for retail, wholesale and multi-branch businesses.'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
  }),
  component: HomePage,
})
