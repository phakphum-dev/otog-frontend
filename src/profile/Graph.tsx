import {
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  ScatterDataPoint,
  TimeScale,
  TooltipItem,
} from 'chart.js'
import { Tooltip } from 'chart.js'
import 'chartjs-adapter-luxon'
import { AnnotationOptions } from 'chartjs-plugin-annotation'
// shoule be import from 'chartjs-plugin-annotation'
import Annotation from 'node_modules/chartjs-plugin-annotation/dist/chartjs-plugin-annotation.esm.js'
import { Line } from 'react-chartjs-2'

import { UserContest } from '@src/user/types'
import { ONE_MONTH, ONE_WEEK, ONE_YEAR } from '@src/utils/time'

Chart.register(
  LineController,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Annotation
)
// Annotation_

const ticks = [2500, 2000, 1800, 1650, 1500]
const annotations: AnnotationOptions[] = [
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    xScaleID: 'x-axis-0',
    yScaleID: 'y-axis-0',
    yMin: 2500,
    backgroundColor: 'rgba(255, 133, 27, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    yMin: 2000,
    yMax: 2500,
    backgroundColor: 'rgba(174, 129, 255, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    yMin: 1800,
    yMax: 2000,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    yMin: 1650,
    yMax: 1800,
    backgroundColor: 'rgba(249, 38, 114, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    yMin: 1500,
    yMax: 1650,
    backgroundColor: 'rgba(166, 226, 46, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    yMin: 1000,
    yMax: 1500,
    backgroundColor: 'rgba(102, 217, 239, 0.5)',
    borderWidth: 0,
  },
]

const median = (arr: ScatterDataPoint[]) => {
  if (arr.length === 0) return 1500
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a.y - b.y)
  return arr.length % 2 !== 0
    ? nums[mid].y
    : (nums[mid - 1].y + nums[mid].y) / 2
}

// assuming that points are sorted
const minX = (points: ScatterDataPoint[]) => points[0]?.x
const maxX = (points: ScatterDataPoint[]) => points[points.length - 1]?.x

const getUnit = (points: ScatterDataPoint[]) => {
  if (points.length <= 1) return 'day'
  const mn = points[0].x
  const mx = points[points.length - 1].x
  const d = mx - mn
  if (d < ONE_WEEK) return 'day'
  else if (d < ONE_MONTH) return 'week'
  else if (d < 3 * ONE_MONTH) return 'month'
  else if (d < ONE_YEAR) return 'quarter'
  else return 'year'
}

function getPoints(graphData: UserContest[]) {
  return graphData.map((contest) => ({
    x: new Date(contest.timeEnd).getTime(),
    y: contest.detail.ratingAfterUpdate,
    label: {
      title: `• ${contest.id} ${contest.name}`,
      rank: `Rank: ${contest.detail.rank}`,
      rating: `Rating: ${contest.detail.ratingAfterUpdate}`,
    },
  }))
}

type PointData = ScatterDataPoint & {
  label: {
    title: string
    rank: string
    rating: string
  }
}

function getChartData(graphData: UserContest[]): ChartData<'line'> {
  return {
    datasets: [
      {
        fill: false,
        tension: 0.1,
        borderCapStyle: 'round',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 3,
        pointRadius: 5,
        pointHitRadius: 10,
        data: getPoints(graphData),
      },
    ],
    labels: graphData.map((contest) => ({
      title: `• ${contest.id} ${contest.name}`,
      rank: `Rank: ${contest.detail.rank}`,
      rating: `Rating: ${contest.detail.ratingAfterUpdate}`,
    })),
  }
}

function getChartOptions(graphData: UserContest[]): ChartOptions<'line'> {
  const points = getPoints(graphData)
  return {
    responsive: true,
    plugins: {
      annotation: { annotations },
      tooltip: {
        callbacks: {
          title: (tooltipItem: TooltipItem<'line'>[]) => {
            const data = tooltipItem[0].dataset.data[
              tooltipItem[0].dataIndex
            ] as PointData
            return data.label.title
          },
          label: (tooltipItem: TooltipItem<'line'>) => {
            const data = tooltipItem.dataset.data[
              tooltipItem.dataIndex
            ] as PointData
            return [data.label.rank, data.label.rating]
          },
        },
        backgroundColor: 'rgba(255,255,255,0.83)',
        titleFont: { size: 16 },
        titleColor: '#ff851b',
        bodyColor: '#000',
        bodyFont: { size: 14 },
        displayColors: false,
        enabled: true,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: getUnit(points) },
        offset: true,
        min: minX(points),
        max: maxX(points),
        grid: {
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
        },
      },
      y: {
        stacked: true,
        afterBuildTicks(axis) {
          axis.ticks = ticks.map((value) => ({ value }))
        },
        suggestedMin: 1200,
        suggestedMax: median(points) + 300,
        grid: {
          lineWidth: 1,
          color: 'rgba(0,0,0,0.1)',
        },
      },
    },
  }
}

export interface GraphProps {
  userContest: UserContest[]
}

export const Graph = ({ userContest }: GraphProps) => {
  return (
    <div className="flex-1">
      <Line
        data={getChartData(userContest)}
        options={getChartOptions(userContest)}
      />
    </div>
  )
}
