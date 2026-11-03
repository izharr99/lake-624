import { defineConfig } from 'vite'
import content from './src/content.json' with { type: 'json' }

// Injects brand copy from content.json into index.html so the title and
// social meta are correct before any JavaScript runs.
export default defineConfig({
  plugins: [
    {
      name: 'content-meta',
      transformIndexHtml(html) {
        return html
          .replaceAll('%FULLNAME%', content.brand.fullName)
          .replaceAll('%BRAND%', content.brand.name)
          .replaceAll('%TAGLINE%', content.brand.tagline)
          .replaceAll('%DESCRIPTION%', content.brand.description)
          .replaceAll('%THEME%', content.theme.paper)
      },
    },
  ],
})
