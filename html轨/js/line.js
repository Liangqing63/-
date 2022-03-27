$(function (route) {
    echarts_line_4(1);
    echarts_line_5(1);
}
)

function echarts_line_4(routeName) {
    this.$.get("http://localhost:8080/job/analysis/route/getRoutePassengerFlowByLine?routeName=" + routeName).then(res => {
        console.log(res)
        var chartDom = document.getElementById('echart4');

        var myChart
        if (myChart != null && myChart != "" && myChart != undefined) {
            myChart.dispose();
        }
        myChart = echarts.init(chartDom);
        var option;
        var xAxisData = [];
        var data1 = [];
        var data2 = [];
        for (var i = 0; i < res.data.length; i++) {
            xAxisData.push(res.data[i].enteringSationName.replace("Sta", ""));
            data1.push(res.data[i].positiveCount);
            data2.push(-res.data[i].reverseCount);
        }
        xAxisData.push(res.data[res.data.length - 1].leaveSationName.replace("Sta", ""))
        var emphasisStyle = {
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0,0,0,0.3)'
            }
        };
        option = {
            color: ['rgba(213, 58, 53,0.65)', 'rgba(233, 143, 111,0.8)', '#e5a214', '#28cad8',],
            legend: {
                data: ['上行', '下行'],
                left: '10%',
                textStyle: {
                    color: "white", // 图例文字颜色
                }

            },
            brush: {
                toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
                xAxisIndex: 0
            },
            toolbox: {
                feature: {
                    magicType: {
                        type: ['stack', 'tiled']
                    },
                    dataView: {}
                }
            },
            grid: {
                right: '16%'
            },
            tooltip: {},
            xAxis: {

                data: xAxisData,
                name: '站点',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },

                axisPointer: { snap: false },
                axisLabel: { align: 'right' },
                axisTick: { show: false }
            },
            yAxis: {
                name: '人数',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: "white",
                        width: .5,
                        type: "solid",
                    },
                }
            },
            grid: {
                height: '250',
                width: 620
            },
            series: [
                {
                    name: '上行',
                    type: 'bar',
                    stack: 'one',
                    emphasis: emphasisStyle,
                    data: data1
                },
                {
                    name: '下行',
                    type: 'bar',
                    stack: 'one',
                    emphasis: emphasisStyle,
                    data: data2
                },

            ]
        };
        option && myChart.setOption(option);
    });
}

function echarts_line_5(routeName) {
    this.$.get("http://localhost:8080/job/analysis/route/getRouteTimeFlowOfDay?routeName=" + routeName).then(res => {

        var xT = new Array(24);
        var yT = new Array(24);
        res.data.forEach(item => {
            yT[item.timeType] = item.num;
        });
        for (var i = 0; i < 24; i++) {
            xT[i] = i;
            if (yT[i] == null)
                yT[i] = 0;
        }

        var chartDom = document.getElementById('echart5');
        var myChart = echarts.init(chartDom);
        var option;

        option = {

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                name: '时间',
                type: 'category',
                boundaryGap: false,
                data: xT,
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
                name: '人数',
                type: 'value',
                axisLabel: {
                    formatter: '{value} '
                },
                axisPointer: {
                    snap: true
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "rgba(255,255,255)",
                        width: 1,
                        type: "solid",
                    },
                },
            },
            visualMap: {
                show: false,
                dimension: 0,
                pieces: [{
                    lte: 7,
                    color: 'rgba(32, 153, 222)'
                }, {
                    gt: 7,
                    lte: 9,
                    color: '#d40f34'
                }, {
                    gt: 9,
                    lte: 17,
                    color: 'rgba(32, 153, 222)'
                }, {
                    gt: 17,
                    lte: 20,
                    color: '#d40f34'
                }, {
                    gt: 20,
                    color: 'rgba(32, 153, 222)'
                }]
            },
            series: [
                {
                    name: '客流人数',
                    type: 'line',
                    smooth: true,
                    data: yT,
                    markArea: {
                        itemStyle: {
                            color: 'rgba(32, 153, 222, 0.2)',
                            textStyle: { color: 'white' },

                        },
                        data: [


                            [{
                                name: '早高峰',
                                xAxis: '7'
                            }, {
                                xAxis: '9'
                            }], [{
                                name: '晚高峰',
                                xAxis: '17'
                            }, {
                                xAxis: '20'
                            }]]
                    }
                }
            ]
        };

        option && myChart.setOption(option);


    })

}
















