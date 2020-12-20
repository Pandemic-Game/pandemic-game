import * as Highcharts from 'highcharts';
import { nFormatter } from '../lib/util';

export const buildCasesChart = (
    containerId: string,
    caseSeries: any[],
    totalCostSeries: any[],
    hospitalCapacity: number
) => {
    return Highcharts.chart(
        containerId,
        {
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            xAxis: {
                lineWidth: 0,
                minorGridLineWidth: 0,
                labels: {
                    enabled: false
                },
                minorTickLength: 0,
                tickLength: 0
            },
            yAxis: [
                {
                    title: {
                        text: 'Cases/day',
                        style: {
                            color: 'blue',
                            fontSize: '16px'
                        }
                    },
                    labels: {
                        style: {
                            color: 'blue',
                            fontSize: '16px'
                        },
                        formatter: function () {
                            return `${nFormatter(this.value, 1)}`
                        }
                    },
                    min: 0,
                    plotLines: [
                        {
                            value: hospitalCapacity,
                            color: '#C00000',
                            dashStyle: 'ShortDash',
                            width: 1,
                            label: {
                                text: 'hospital capacity'
                            }
                        }
                    ]
                },
                {
                    title: {
                        text: 'USD',
                        style: {
                            color: 'red',
                            fontSize: '16px'
                        }
                    },
                    labels: {
                        style: {
                            color: 'red',
                            fontSize: '16px'
                        },
                        formatter: function () {
                            return `${nFormatter(this.value, 1)}`
                        }
                    },
                    min: 0,
                    opposite: true
                }
            ],
            tooltip: {
                formatter: function () {
                    const date = (this.x as any).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    return this.points.reduce(function (prev, point) {
                        return `${prev}<br/> ${point.series.name}: ${nFormatter(point.y, 1)}`;
                    }, `<b>${date}<br/>`);
                },
                shared: true
            },
            series: [
                {
                    type: 'line',
                    name: 'Cases/day',
                    data: caseSeries,
                    yAxis: 0,
                    color: 'blue'
                },
                {
                    type: 'line',
                    name: 'Costs',
                    data: totalCostSeries,
                    yAxis: 1,
                    color: 'red'
                }
            ]
        },
        () => { }
    );
};

export const updateCasesChart = (casesChart: any, caseSeries: any[], totalCostSeries: any[]) => {
    casesChart.series[0].setData(caseSeries);
    casesChart.series[1].setData(totalCostSeries);
};
