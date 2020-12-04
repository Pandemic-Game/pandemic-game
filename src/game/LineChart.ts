import * as Highcharts from 'highcharts';
import { nFormatter } from '../lib/util';

export const buildCasesChart = (containerId: string, caseSeries: any[], totalCostSeries: any[]) => {
    Highcharts.chart(containerId, {
        chart: {
            type: 'line'
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 1000 * 3600 * 24 * 30 // 1 month
        },
        yAxis: [
            {
                title: {
                    text: 'Cases/Deaths/day',
                    style: {
                        color: 'blue'
                    }
                },
                labels: {
                    style: {
                        color: 'blue'
                    }
                }
            },
            {
                title: {
                    text: 'USD',
                    style: {
                        color: 'red'
                    }
                },
                labels: {
                    style: {
                        color: 'red'
                    }
                },
                opposite: true
            }
        ],
        tooltip: {
            formatter: function () {
                return `${this.x.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}: ${nFormatter(this.y, 1)}`;
            }
        },
        series: [
            {
                type: 'line',
                name: 'Cases/month',
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
    });
};
