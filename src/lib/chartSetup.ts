import { Chart, registerables, type TooltipOptions } from 'chart.js'

Chart.register(...registerables)
Chart.defaults.font.family = 'YekanBakh, sans-serif'
Chart.defaults.color = '#7e6c63'

export const CHART_COLORS = {
  blue: '#653825',
  navy: '#3b2217',
  green: '#1d9a6c',
  red: '#d64545',
  grid: '#eeeae7',
}

export const CATEGORY_PALETTE = ['#653825', '#3b2217', '#bc8b76', '#a6694e', '#4e2c1d', '#ceaea1', '#7e6c63', '#e2d2cb']

export const tooltipDefaults: Partial<TooltipOptions> = {
  backgroundColor: '#32221b',
  padding: 10,
  titleFont: { size: 12 },
  bodyFont: { size: 13 },
  displayColors: false,
}
