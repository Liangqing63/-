$(function (route) {
    echarts_line_4('2020-07-15', 'Sta104', 24, 24);
    echarts_line_5('2020-07-15', '1号线', 24,);
})

function echarts_line_4(date, name, hour, longTime) {
    this.$.get("http://localhost:8080/job/predict/predictLongTime?date=" + date + "&&name=" + name + "&&hour=" + hour + "&&longTime=" + longTime).then(res => {
        console.log(res)
        var chartDom = document.getElementById('echart4');
        var myChart = echarts.init(chartDom);
        var option;
        var xT = new Array(24);
        var yT = new Array(0);
        res.data.forEach(data => {
            yT.push(data);
        });
        console.log(yT.length);
        console.log(yT);

        for (var i = 0; i <= 23; i++) {
            xT[i] = i + 10;
            if (xT[i] > 24) {
                xT[i] -= 24;
            }
        }
        option = {
            dataZoom: [
                {
                    id: 'dataZoomX',
                    type: 'slider',
                    xAxisIndex: [0],
                    filterMode: 'filter',
                    start: 0,
                    end: 50
                },
                // {
                //     id: 'dataZoomY',
                //     type: 'slider',
                //     yAxisIndex: [0],
                //     filterMode: 'empty'
                // }
            ],
            color: ['#6ab0b8', '#fc853e', '#8ac202', '#e5a214',],
            grid: {
                height: '250'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xT,
                name: '天数',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
            },
            yAxis: {
                max: 6,
                type: 'value',
                name: '人数',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
            },
            series: [{
                data: yT,
                type: 'line',
                smooth: true,
                areaStyle: {}
            }]
        };

        option && myChart.setOption(option);
    })

}

function echarts_line_5(date, routeName, hour) {
    this.$.get("http://localhost:8080/job/predict/predictByLine?date=" + date + "&&routeName=" + routeName + "&&hour=" + hour).then(res => {
        console.log("456");

        console.log(res);

        var chartDom = document.getElementById('echart5');
        var myChart = echarts.init(chartDom);
        var option;

        var yT = new Array();
        res.data.forEach(data => {
            yT.push(data);
        });
        var xT = new Array(yT.length - 1);
        for (var i = 0; i <= yT.length - 1; i++) {
            xT[i] = '第' + (i + 1) + '个站点';
        }
        var data = yT;

        var dataAxis = xT;
        var data = yT;
        var yMax = 20;
        var dataShadow = [];

        for (var i = 0; i < data.length; i++) {
            dataShadow.push(yMax);
        }

        option = {

            xAxis: {
                name: '站点',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
                data: dataAxis,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
                axisLabel: {
                    //inside: true,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },

                z: 10
            },
            yAxis: {
                name: '站点',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside'
                }
            ],
            series: [
                {
                    type: 'bar',
                    showBackground: true,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: '#83bff6' },
                                { offset: 0.5, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ]
                        )
                    },
                    emphasis: {
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#2378f7' },
                                    { offset: 0.7, color: '#2378f7' },
                                    { offset: 1, color: '#83bff6' }
                                ]
                            )
                        }
                    },
                    data: data
                }
            ]
        };

        // Enable data zoom when user click bar.
        var zoomSize = 6;
        myChart.on('click', function (params) {
            console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
            myChart.dispatchAction({
                type: 'dataZoom',
                startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
            });
        });

        option && myChart.setOption(option);
    });
}
















