import { createTheme, type MantineColorsTuple } from '@mantine/core'

/**
 * Dark, low-luminance by default (spec §2) — the device is on the table with
 * three other people around it, so the screen must not be a lamp.
 *
 * Sizing is deliberately generous: controls default to `lg` because the phone
 * may be lying flat and tapped at arm's length.
 */
const jade: MantineColorsTuple = [
  '#e6fbf3',
  '#d0f2e6',
  '#a3e3cb',
  '#72d3af',
  '#4bc697',
  '#33be88',
  '#22ba80',
  '#0fa46e',
  '#009260',
  '#007e50',
]

export const theme = createTheme({
  primaryColor: 'jade',
  colors: { jade },
  primaryShade: { light: 7, dark: 5 },
  defaultRadius: 'md',
  /**
   * A landscape phone gives about 400px of height. Everything is scaled down
   * so a section fits without paging through it (spec §2), while tap targets
   * stay large via explicit min-heights and `md` control sizes.
   */
  scale: 0.85,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", Roboto, sans-serif',
  headings: { fontWeight: '650' },
  components: {
    Button: { defaultProps: { size: 'md' } },
    SegmentedControl: { defaultProps: { size: 'sm' } },
    ActionIcon: { defaultProps: { size: 'lg' } },
    Card: { defaultProps: { padding: 'sm' } },
    Table: { defaultProps: { verticalSpacing: 'xs', horizontalSpacing: 'sm' } },
  },
})
