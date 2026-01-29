'use client'

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface RadarChartProps {
  counts: {
    positive: number
    negative: number
    sum: number
  }[]
  hidePercentLabels?: boolean
}

export interface RadarChartRef {
  getChartImage: () => string | null
}

const RadarChart = forwardRef<RadarChartRef, RadarChartProps>(({ counts, hidePercentLabels = false }, ref) => {
  const chartRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getChartImage: () => {
      if (chartRef.current) {
        return chartRef.current.toBase64Image()
      }
      return null
    }
  }))

  // 8개 축: R, P, S, C, E, L, O, T (시계방향)
  // 각 축은 25문항 중 해당 방향 응답 개수 / 25 * 100
  const labels = [
    'R', 
    'P',
    'S',
    'C',
    'E',
    'L',
    'O',
    'T'
  ]

  // 원본 데이터 계산
  const rawData = [
    (counts[0].positive / 25) * 100, // R (A축 positive)
    (counts[2].positive / 25) * 100, // P (C축 positive)
    (counts[1].positive / 25) * 100, // S (B축 positive)
    (counts[3].positive / 25) * 100, // C (D축 positive)
    (counts[0].negative / 25) * 100, // E (A축 negative)
    (counts[1].negative / 25) * 100, // L (B축 negative)
    (counts[2].negative / 25) * 100, // O (C축 negative)
    (counts[3].negative / 25) * 100, // T (D축 negative)
  ]

  // 자연스럽게 강조: 1.6배 증폭하되 100을 넘으면 100으로 제한
  const data = rawData.map(v => Math.min(v * 1.6, 100))

  const chartData = {
    labels,
    datasets: [
      {
        label: '나의 반응 성향',
        data,
        backgroundColor: 'rgba(218, 171, 171, 0.2)',
        borderColor: 'rgba(218, 171, 171, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(218, 171, 171, 1)',
        pointBorderColor: 'rgba(218, 171, 171, 1)',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(218, 171, 171, 1)',
        pointHoverBorderColor: 'rgba(218, 171, 171, 1)',
      },
    ],
  }

  const options: any = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: !hidePercentLabels,
          stepSize: 20,
          color: '#F1F1F1',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '700',
          },
          callback: function(value: any) {
            return value + '%'
          }
        },
        pointLabels: {
          font: {
            size: 14,
            family: 'Pretendard, sans-serif',
          },
          color: '#3D3D3D',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + Math.round(context.parsed.r) + '%'
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true,
  }

  return (
    <div style={{ width: '296px', height: '296px', margin: '0 auto', borderRadius: '4px', border : '1px solid #F2F2F2' }}>
      <Radar ref={chartRef} data={chartData} options={options} />
    </div>
  )
})

RadarChart.displayName = 'RadarChart'

export default RadarChart
