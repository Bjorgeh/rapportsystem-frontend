import PropTypes from 'prop-types';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  SvgIcon
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';

const useChartOptions = () => {
  const theme = useTheme();
  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      show: false
    },
    plotOptions: {
      bar: {
        columnWidth: '40px'
      }
    },
    stroke: {
      show: true,
      width: 2
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        color: theme.palette.divider,
        show: true
      },
      axisTicks: {
        color: theme.palette.divider,
        show: true
      },
      labels: {
        offsetY: 5,
        style: {
          colors: theme.palette.text.secondary
        },
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toLocaleString('no-NO', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0
        }),
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary
        },
      }
    }
  };
};

export const OverviewSales = (props) => {
  const { chartSeries, title, categories, sx, refreshChartData } = props;
  const chartOptions = useChartOptions();
  const allChartTypes = ['line', 'bar', 'area'];
  const [chartType, setChartType] = useState(0);
  const router = useRouter();

  const handleRefreshButton = () => {
    const targetType = chartType + 1;
    if (chartSeries && chartSeries.length > 0) {
      setChartType(targetType < allChartTypes.length ? targetType : 0);
    }
    refreshChartData();
  }

  const handleReportButton = () => {
    router.push(`/read` + title);
  }

  return (
    <Card sx={sx}>
      <CardHeader
        action={(
          <Button
            onClick={handleRefreshButton}
            color="inherit"
            size="small"
            startIcon={(
              <SvgIcon fontSize="small">
                <ArrowPathIcon />
              </SvgIcon>
            )}
          >
            {chartSeries && chartSeries.length === 0 ? 'Synkroniser' : 'Vis som ' + `${allChartTypes[(chartType + 1) % allChartTypes.length] + ' (' + allChartTypes[chartType] + ")"}`}
          </Button>
        )}
        title={title && title.length > 0 ? title + " graf" : "Ingen data valgt"}
      />
      <CardContent>
        <Chart
          height={350}
          options={{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories: categories } }}
          series={chartSeries}
          type={allChartTypes[chartType]}
          width="100%"
        />
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          onClick={handleReportButton}
          color="inherit"
          endIcon={(
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          )}
          size="small"
        >
          {title && title.length > 0 ? 'Se ' + title.toLowerCase() : 'Se rapport'}
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewSales.protoTypes = {
  chartSeries: PropTypes.array.isRequired,
  sx: PropTypes.object
};