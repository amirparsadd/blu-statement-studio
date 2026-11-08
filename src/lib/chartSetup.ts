import { Chart, registerables, type TooltipOptions } from 'chart.js'

Chart.register(...registerables)
Chart.defaults.font.family = 'YekanBakh, sans-serif'
Chart.defaults.color = '#6b7689'

export const CHART_COLORS = {
  blue: '#4e91e6',
  navy: '#1d3d6b',
  green: '#1d9a6c',
  red: '#d64545',
  grid: '#e8edf5',
}

export const CATEGORY_PALETTE = ['#4e91e6', '#1d3d6b', '#8db8ef', '#a9b4c6', '#2f6fbf', '#c9d6ea', '#6b7689', '#dbe6f7']

export const tooltipDefaults: Partial<TooltipOptions> = {
  backgroundColor: '#1d2535',
  padding: 10,
  titleFont: { size: 12 },
  bodyFont: { size: 13 },
  displayColors: false,
}
