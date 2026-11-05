import ClassicTheme from './ClassicTheme'
import ModernTheme from './ModernTheme'
import CompactTheme from './CompactTheme'
import MinimalTheme from './MinimalTheme'

// `atsSafe` is not decoration: multi-column layouts genuinely confuse older
// parsers, which read across columns and scramble the text. The builder says
// so rather than letting someone pick a layout that quietly costs them.
export const THEMES = [
  {
    key: 'classic',
    name: 'Classic',
    description: 'Serif, centred header, ruled sections. The standard engineering resume.',
    component: ClassicTheme,
    atsSafe: true,
  },
  {
    key: 'modern',
    name: 'Modern',
    description: 'Sans-serif with a single accent colour. Contemporary but restrained.',
    component: ModernTheme,
    atsSafe: true,
  },
  {
    key: 'minimal',
    name: 'Minimal',
    description: 'No rules or colour. Typography alone, with generous spacing.',
    component: MinimalTheme,
    atsSafe: true,
  },
  {
    key: 'compact',
    name: 'Compact',
    description: 'Sidebar layout. Fits more on one page, but two columns can confuse older ATS.',
    component: CompactTheme,
    atsSafe: false,
  },
]

export const getTheme = (key) => THEMES.find((t) => t.key === key) || THEMES[0]
