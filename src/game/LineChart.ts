import * as Highcharts from 'highcharts';


export const buildCasesChart = (containerId: string, values: number[]) => {
    Highcharts.chart(containerId, {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Number of infected'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Number of infected'
            }
        },
        series: [{
            name: 'Cases per month',
            data: values
        },]
    });
}

export const buildCostChart = (containerId: string, values: number[]) => {
    Highcharts.chart(containerId, {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Costs'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'USD'
            }
        },
        series: [{
            name: 'Costs per month',
            data: values
        },]
    });
}