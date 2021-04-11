import React from 'react'
import { Line } from 'react-chartjs-2'
import * as Plugin from 'chartjs-plugin-annotation'
import { UserContest } from '@src/utils/api/User'
import * as chartjs from 'chart.js'
import { Box } from '@chakra-ui/layout'
import {
  ONE_DAY,
  ONE_MONTH,
  ONE_WEEK,
  ONE_YEAR,
} from '@src/utils/hooks/useTimer'

const ticks = [2500, 2000, 1800, 1650, 1500]
const annotations = [
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
    xScaleID: 'x-axis-0',
    yScaleID: 'y-axis-0',
    yMin: 2000,
    yMax: 2500,
    backgroundColor: 'rgba(174, 129, 255, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    xScaleID: 'x-axis-0',
    yScaleID: 'y-axis-0',
    yMin: 1800,
    yMax: 2000,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    xScaleID: 'x-axis-0',
    yScaleID: 'y-axis-0',
    yMin: 1650,
    yMax: 1800,
    backgroundColor: 'rgba(249, 38, 114, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    xScaleID: 'x-axis-0',
    yScaleID: 'y-axis-0',
    yMin: 1500,
    yMax: 1650,
    backgroundColor: 'rgba(166, 226, 46, 0.5)',
    borderWidth: 0,
  },
  {
    drawTime: 'beforeDatasetsDraw',
    type: 'box',
    xScaleID: 'x-axis-0',
    yScaleID: 'y-axis-0',
    yMin: 1000,
    yMax: 1500,
    backgroundColor: 'rgba(102, 217, 239, 0.5)',
    borderWidth: 0,
  },
]

type Point = {
  x: number
  y: number
}

const median = (arr: Point[]) => {
  if (arr.length === 0) return 1500
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a.y - b.y)
  return arr.length % 2 !== 0
    ? nums[mid].y
    : (nums[mid - 1].y + nums[mid].y) / 2
}

// assuming that points are sorted
const minX = (points: Point[]) =>
  points.length === 0
    ? null
    : points.length === 1
    ? points[0].x - ONE_DAY
    : points[0].x

const maxX = (points: Point[]) =>
  points.length === 0
    ? null
    : points.length === 1
    ? points[0].x + ONE_DAY
    : points[points.length - 1].x

const changeUnit = (points: Point[]) => {
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

function toPoints(graphData: UserContest[]) {
  return graphData.map(({ timeEnd, detail: { ratingAfterUpdate } }) => ({
    x: new Date(timeEnd).getTime(),
    y: ratingAfterUpdate,
  }))
}

function Data(graphData: UserContest[]): chartjs.ChartData {
  return {
    datasets: [
      {
        fill: false,
        lineTension: 0.1,
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
        data:
          graphData.length === 0 ? [{ x: Date.now() }] : toPoints(graphData),
      },
    ],
    labels: graphData.map((contest) => [
      `• ${contest.id} ${contest.name}`,
      `Rank: ${contest.detail.rank}`,
      `Rating: ${contest.detail.ratingAfterUpdate}`,
    ]),
  }
}

function option(graphData: UserContest[]) {
  const points = toPoints(graphData)
  return {
    legend: {
      display: false,
    },
    responsive: true,
    tooltips: {
      callbacks: {
        title: ([tooltipItem], { labels }) => {
          const label = (labels as string[][])[
            tooltipItem.index as number
          ] as string[]
          return label[0]
        },
        label: (tooltipItem, { labels }) => {
          const label = (labels as string[][])[
            tooltipItem.index as number
          ] as string[]
          return label.slice(1)
        },
      },
      backgroundColor: 'rgba(255,255,255,0.83)',
      titleFontSize: 16,
      titleFontColor: '#ff851b',
      bodyFontColor: '#000',
      bodyFontSize: 14,
      displayColors: false,
    },
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: changeUnit(points),
          },
          ticks: {
            min: minX(points),
            max: maxX(points),
          },
          gridLines: {
            lineWidth: 1,
            color: 'rgba(0,0,0,0.1)',
          },
        },
      ],
      yAxes: [
        {
          stacked: true,
          ticks: {
            autoSkip: false,
            min: 1200,
            suggestedMax: median(points) + 300,
          },
          afterBuildTicks: function (scale) {
            return (scale.ticks = ticks)
          },
          gridLines: {
            lineWidth: 0,
            color: 'rgba(0,0,0,0.1)',
          },
        },
      ],
    },
    annotation: {
      annotations,
    },
  } as chartjs.ChartOptions
}

export interface GraphProps {
  userContest: UserContest[]
}

export const Graph = ({ userContest }: GraphProps) => {
  return (
    <Box flex={1}>
      <Line
        data={Data(userContest)}
        options={option(userContest)}
        plugins={[Plugin]}
      />
    </Box>
  )
}
