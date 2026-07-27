import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Plugin
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface PipelineDoughnutChartProps {
  stageValues?: number[];
  labels?: string[];
  totalValue?: number;
}

// Custom plugin to render text in the center of the Doughnut chart
const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerTextPlugin',
  beforeDraw: (chart) => {
    const { width, height, ctx } = chart;
    ctx.restore();

    // Get the total text from chart options or config
    const text = (chart.config.options?.plugins as any)?.centerTextPlugin?.text;
    
    if (text) {
      const fontSize = (height / 120).toFixed(2);
      ctx.font = `bold ${fontSize}em Inter, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;

      ctx.fillText(text, textX, textY);
    }
    ctx.save();
  }
};

export const PipelineDoughnutChart: React.FC<PipelineDoughnutChartProps> = ({
  stageValues = [0, 0, 0, 0, 0],
  labels = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
  totalValue = 0
}) => {
  const chartRef = useRef<any>(null);
  const [animatedValues, setAnimatedValues] = useState(() => stageValues.map(() => 0));
  const dataKey = stageValues.join(',');

  useEffect(() => {
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

  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        data: animatedValues,
        backgroundColor: [
          '#60a5fa', // Blue (Marketing Channels / Qualification)
          '#a78bfa', // Purple (Offline Channels / Proposal)
          '#fbbf24', // Amber (Direct Sales / Negotiation)
          '#34d399', // Emerald (Other Channels / Closed Won)
          '#f87171'  // Red (Closed Lost)
        ],
        hoverBackgroundColor: [
          '#3b82f6',
          '#8b5cf6',
          '#f59e0b',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 1,
        borderColor: '#18181b', // Add a slight border to separate slices
        hoverBorderWidth: 0,
        hoverOffset: 20 // Make the hovered slice pop out significantly
      }
    ]
  };

  const formattedTotal = totalValue >= 1000000 
    ? `$${(totalValue / 1000000).toFixed(1)}M`
    : totalValue >= 1000 
    ? `$${(totalValue / 1000).toFixed(0)}k`
    : `$${totalValue}`;

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Make it thin like the Figma design
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: false // We will render a custom HTML legend below
      },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const valueFormatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(context.parsed);
            return ` ${valueFormatted}`;
          }
        }
      },
      // Pass custom text to our plugin
      centerTextPlugin: {
        text: formattedTotal
      } as any
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-full h-[220px]">
        <Doughnut 
          ref={chartRef} 
          data={chartData} 
          options={options} 
          plugins={[centerTextPlugin]} 
        />
      </div>
      
      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 w-full text-[11px] font-medium text-zinc-400">
        {labels.map((label, idx) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: chartData.datasets[0].backgroundColor?.[idx] as string }}
              />
              <span className="truncate max-w-[100px]">{label}</span>
            </div>
            <span className="text-zinc-100 font-bold">
              ${(animatedValues[idx] >= 1000 ? (animatedValues[idx] / 1000).toFixed(1) + 'k' : animatedValues[idx])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
