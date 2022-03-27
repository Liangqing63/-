
$(function () {
    var stationName = 23;
    var localdate = '2020-07-15';
    updateEchart(stationName, localdate);


})
function updateEchart(s, d) {
    var stationName = s;
    var localdate = d
    echarts_1();
    echarts_2();
    echarts_5();
    function echarts_1() {
        this.$.get("http://localhost:8080/job/analysis/station/getFromStationODPassengerFlowByStaOfDate?stationName=" + stationName + "&&date=" + localdate).then(res => {

            var xT = [];
            var yT = [];
            var i = 0;
            var x = {};
            x["name"] = stationName.toString()
            xT.push(x);
            res.data.forEach(item => {
                x = {};
                if (item.stationName.replace("Sta", "") != stationName) {
                    x["name"] = item.stationName.replace("Sta", "");
                    xT.push(x);
                    var y = {}
                    y["source"] = stationName.toString();
                    y["target"] = item.stationName.replace("Sta", "");
                    y["value"] = item.count;
                    yT.push(y);
                }
            })
            var chartDom = document.getElementById('echart1');
            var myChart = echarts.init(chartDom);
            var option;

            option = {
                color: ['#28cad8', '#fc853e', '#e5a214', '#8ac202', '#6ab0b8',],
                series: {
                    type: 'sankey',
                    layout: 'none',
                    emphasis: {
                        focus: 'adjacency'
                    },
                    data: xT,
                    links: yT,
                    label: { color: 'white' }
                },
                grid: {
                    height: 100,
                    width: '300',
                    textStyle: {
                        color: 'white'
                    },
                }
            };

            option && myChart.setOption(option);
        });

    }

    function echarts_2() {
        this.$.get("http://localhost:8080/job/analysis/station/getStationChannelWay?stationName=" + stationName).then(res => {
            var chartDom = document.getElementById('echart2');
            var myChart = echarts.init(chartDom);
            var option;

            function getJson() {
                var arr = [];
                var a = {};
                res.data.forEach(item => {
                    a["value"] = item.num;
                    a["name"] = item.channel;
                    arr.push(a);
                    a = {};
                })
                return arr;
            };
            option = {
                color: ['#e98f6f', '#61a0a8', '#c23531', '#e5a214',],
                title: {
                    text: '',
                    subtext: '',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left', textStyle: {
                        color: "white", // 图例文字颜色
                    }

                },
                series: [
                    {
                        name: '购票方式',
                        type: 'pie',
                        radius: '50%',
                        data: getJson(),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            option && myChart.setOption(option);
        });
    }

    function echarts_5() {
        this.$.get("http://localhost:8080/job/analysis/station/getStationPassengerFlowOfHour?stationName=" + stationName + "&&date=" + localdate).then(res => {
            var chartDom = document.getElementById('echart5');
            var myChart = echarts.init(chartDom);
            var option;
            var type = ['进站', '出站'];
            var xT = [];
            var yT = [];
            var arr = []
            for (var i = 0; i < 2; i++)
                yT.push(new Array());
            res.data.forEach(item => {
                yT[0][item.hour] = item.enteringCount;
                yT[1][item.hour] = item.leavingCount;
                xT[item.hour] = item.hour;
            })
            for (var i = 0; i < 2; i++) {
                var a = {};
                a["name"] = type[i];
                a["type"] = 'line';
                a["stack"] = '总量';
                a["data"] = yT[i];
                arr.push(a);
            }

            option = {
                color: ['#3efce4', '#fce43e', '#fc3e56', '#fc853e',],
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: type, textStyle: {
                        color: "white", // 图例文字颜色
                    }

                },
                grid: {
                    left: '3%',
                    right: '10%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    name: '时间',
                    type: 'category',
                    boundaryGap: false,
                    data: xT,
                    interval: 1,
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
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(255,255,255)",
                            width: 1,
                            type: "solid",
                        },
                    },
                },
                series: arr
            };
            option && myChart.setOption(option);
        });
    }

}















