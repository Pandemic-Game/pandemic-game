import * as Highcharts from 'highcharts';

export const buildCasesChart = (containerId: string, caseSeries: any[], deathsSeries: any[]) => {
    Highcharts.chart(
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
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: [
                {
                    title: {
                        text: 'Infections/month'
                    }
                },
                {
                    title: {
                        text: 'Deaths/month'
                    },
                    opposite: true
                }
            ],
            series: [
                {
                    type: 'line',
                    name: 'Cases/month',
                    data: caseSeries,
                    yAxis: 0
                },
                {
                    type: 'line',
                    name: 'Deaths/month',
                    data: deathsSeries,
                    yAxis: 1
                }
            ]
        },
        () => {}
    );
};

export const buildCostChart = (
    containerId: string,
    totalCostSeries: any[],
    medicalCostSeries: any[],
    deathCostSeries: any[],
    economicCostSeries: any[]
) => {
    Highcharts.chart(
        containerId,
        {
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: 'USD'
                }
            },
            series: [
                {
                    type: 'line',
                    name: 'Total costs/month',
                    data: totalCostSeries
                },
                {
                    type: 'line',
                    name: 'Economic costs/month',
                    data: economicCostSeries
                },
                {
                    type: 'line',
                    name: 'Medical costs/month',
                    data: medicalCostSeries
                },
                {
                    type: 'line',
                    name: 'Death costs/month',
                    data: deathCostSeries
                }
            ]
        },
        () => {}
    );
};
