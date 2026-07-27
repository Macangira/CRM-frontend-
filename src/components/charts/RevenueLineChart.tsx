import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface RevenueLineChartProps {
  data?: number[];
  labels?: string[];
  colorTheme?: 'blue' | 'green';
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({
  data = [],
  labels = [],
  colorTheme = 'blue'
}) => {
  const [animatedData, setAnimatedData] = useState(() => data.map(() => 0));
  const dataKey = data.join(',');

  useEffect(() => {
    if (data.every(v => v === 0)) {
      setAnimatedData(data);
      return;
    }

    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 1,
      duration: 1.25,
      ease: 'power3.out',
      onUpdate: () => setAnimatedData(data.map(value => Math.round(value * progress.value)))
    });
    return () => tween.kill();
  }, [dataKey, data]);

  const themeColors = {
    blue: {
      line: '#3b82f6',
      bgStart: 'rgba(59, 130, 246, 0.25)',
      hover: '#60a5fa'
    },
    green: {
      line: '#10b981',
      bgStart: 'rgba(16, 185, 129, 0.25)',
      hover: '#34d399'
    }
  };
  const currentTheme = themeColors[colorTheme];

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Value',
        data: animatedData,
        borderColor: currentTheme.line,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, currentTheme.bgStart);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.45, // very smooth curves like Figma
        fill: true,
        pointBackgroundColor: currentTheme.line,
        pointBorderColor: '#090a0f',
        pointBorderWidth: 2,
        pointRadius: 0, // hide points by default
        pointHoverRadius: 6,
        pointHoverBackgroundColor: currentTheme.hover,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        pointHitRadius: 10
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 0
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
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 11,
          weight: 500,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 700,
        },
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            if (context.parsed.y !== null) {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return '';
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
          color: '#71717a',
          font: {
            size: 11,
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
    <div className="w-full h-full min-h-[200px] relative">
      <Line data={chartData} options={options} />
    </div>
  );
};
