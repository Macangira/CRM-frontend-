import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface PipelineFunnelChartProps {
  stageValues?: number[];
  stageCounts?: number[];
  labels?: string[];
}

export const PipelineFunnelChart: React.FC<PipelineFunnelChartProps> = ({
  stageValues = [0, 0, 0, 0, 0], // Replaced fake defaults with 0s
  stageCounts = [0, 0, 0, 0, 0],
  labels = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
}) => {
  const [animatedValues, setAnimatedValues] = useState(() => stageValues.map(() => 0));
  const dataKey = stageValues.join(',');

  useEffect(() => {
    // If all values are 0 (no data), don't animate to avoid unnecessary rerenders
    if (stageValues.every(v => v === 0)) {
      setAnimatedValues(stageValues);
      return;
    }

    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 1,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => setAnimatedValues(stageValues.map(value => Math.round(value * progress.value)))
    });
    return () => tween.kill();
  }, [dataKey, stageValues]);

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Stage Total Value ($)',
        data: animatedValues,
        backgroundColor: [
          'rgba(59, 130, 246, 1)',   // Blue
          'rgba(139, 92, 246, 1)',   // Purple
          'rgba(245, 158, 11, 1)',   // Amber
          'rgba(16, 185, 129, 1)',   // Emerald
          'rgba(239, 68, 68, 1)'     // Red
        ],
        hoverBackgroundColor: [
          '#60a5fa',
          '#a78bfa',
          '#fbbf24',
          '#34d399',
          '#f87171'
        ],
        borderRadius: {
          topLeft: 12,
          topRight: 12,
          bottomLeft: 4,
          bottomRight: 4
        },
        borderSkipped: false,
        barThickness: 35,
        minBarLength: 5,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'x', // Changed to vertical bars
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // We handle animation via GSAP
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 16,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13,
        },
        displayColors: true,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const valueFormatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(context.parsed.y); // using y for vertical chart
            const count = stageCounts[index] || 0;
            return ` Value: ${valueFormatted} (${count} deals)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#a1a1aa',
          font: {
            size: 12,
            weight: 500,
            family: 'Inter, sans-serif'
          },
          padding: 10
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false,
          tickLength: 0
        },
        border: {
          dash: [5, 5]
        },
        ticks: {
          color: '#71717a',
          font: {
            size: 11,
            weight: 500,
            family: 'Inter, sans-serif'
          },
          callback: (value) => {
            const num = Number(value);
            if (num === 0) return '$0';
            return num >= 1000000 ? `$${num / 1000000}M` : `$${num / 1000}k`;
          },
          padding: 15
        }
      }
    }
  };

  return (
    <div className="w-full h-[320px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
};

