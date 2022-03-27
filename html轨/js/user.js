$(function () {
    var ageT = ['0-20岁', '20-30岁', '30-40岁', '40-50岁', '50-60岁', '>60岁'];

    function getFormatDate(d) {
        var date = d;
        var seperator = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var nowDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (nowDate >= 0 && nowDate <= 9) {
            nowDate = "0" + nowDate;
        }
        var newDate = year + seperator + month + seperator + nowDate;
        return newDate;
    };
    echarts_1();
    echarts_2();
    echarts_3();

    echarts_4();
    echarts_5();
    echarts_6();

    function echarts_1() {
        this.$.get("http://localhost:8080/job/analysis/customer/getAllAge").then(
            (res) => {
                var chartDom = document.getElementById("echart1");
                var myChart = echarts.init(chartDom);
                var option;

                function getJson(res) {
                    var json = [];
                    var array = {};
                    for (var i = 0; i < res.data.length; i++) {
                        array["value"] = res.data[i].num;
                        array["name"] = ageT[res.data[i].ageType];
                        json.push(array);
                        array = {};
                    }
                    return json;
                }

                option = {
                    tooltip: {
                        trigger: "item",
                    },
                    legend: {
                        top: "5%",
                        left: "center",
                        textStyle: {
                            color: "white", // 图例文字颜色
                        }
                    },
                    series: [
                        {
                            name: "访问来源",
                            type: "pie",
                            radius: ["40%", "70%"],
                            avoidLabelOverlap: false,
                            itemStyle: {
                                borderRadius: 333,
                                borderColor: "#0C164B",
                                borderWidth: 2,
                            },
                            label: {
                                show: false,
                                position: "center",
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: "30",
                                    fontWeight: "bold",
                                },
                            },
                            labelLine: {
                                show: false,
                            },
                            data: getJson(res),
                        },
                    ],
                };
                option && myChart.setOption(option);
            }
        );
    }

    function echarts_2() {
        this.$.get("http://localhost:8080/job/analysis/customer/getAllChannel").then(
            (res) => {
                var app = {};
                var chartDom = document.getElementById("echart2");
                var myChart = echarts.init(chartDom);
                var option;

                function getJson() {
                    var arr = new Array();
                    for (var i = 0; i < 3; i++)
                        arr[i] = new Array();
                    res.data.forEach(function (value) {
                        if (value.ageType >= 1 && value.ageType <= 2)
                            arr[value.channelType - 1][value.ageType] = parseInt(value.num / 2);

                        else
                            arr[value.channelType - 1][value.ageType] = value.num;
                    });
                    var s = [];
                    var array = {};
                    for (var i = 0; i < 3; i++) {
                        array["name"] = i + 1
                        array["type"] = "bar";
                        array["barGap"] = 0;
                        array["label"] = labelOption;
                        array["emphasis"] = { focus: "series", };
                        array["data"] = arr[i];
                        s.push(array);
                        array = {};
                    }
                    return s;
                }

                var posList = [
                    "left",
                    "right",
                    "top",
                    "bottom",
                    "inside",
                    "insideTop",
                    "insideLeft",
                    "insideRight",
                    "insideBottom",
                    "insideTopLeft",
                    "insideTopRight",
                    "insideBottomLeft",
                    "insideBottomRight",
                ];

                app.configParameters = {
                    rotate: {
                        min: -90,
                        max: 90,
                    },
                    align: {
                        options: {
                            left: "left",
                            center: "center",
                            right: "right",
                        },
                    },
                    verticalAlign: {
                        options: {
                            top: "top",
                            middle: "middle",
                            bottom: "bottom",
                        },
                    },
                    position: {
                        options: posList.reduce(function (map, pos) {
                            map[pos] = pos;
                            return map;
                        }, {}),
                    },
                    distance: {
                        min: 0,
                        max: 100,
                    },
                };

                app.config = {
                    rotate: 90,
                    align: "left",
                    verticalAlign: "middle",
                    position: "insideBottom",
                    distance: 15,
                    onChange: function () {
                        var labelOption = {
                            normal: {
                                rotate: app.config.rotate,
                                align: app.config.align,
                                verticalAlign: app.config.verticalAlign,
                                position: app.config.position,
                                distance: app.config.distance,
                            },
                        };
                        myChart.setOption({
                            series: [
                                {
                                    label: labelOption,
                                },
                                {
                                    label: labelOption,
                                },
                                {
                                    label: labelOption,
                                },
                                {
                                    label: labelOption,
                                },
                            ],
                        });
                    },
                };

                var labelOption = {
                    show: true,
                    position: app.config.position,
                    distance: app.config.distance,
                    align: app.config.align,
                    verticalAlign: app.config.verticalAlign,
                    rotate: app.config.rotate,
                    formatter: "{c}  {name|{a}}",
                    fontSize: 16,
                    rich: {
                        name: {},
                    },
                };

                option = {
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                        },
                    },
                    legend: {
                        data: ["1", "2", "3"],
                        textStyle: {
                            color: "white", // 图例文字颜色
                        },
                    },
                    toolbox: {
                        show: true,
                        orient: "vertical",
                        left: "right",
                        top: "center",
                        feature: {
                            mark: { show: true },
                            dataView: { show: true, readOnly: false },
                            magicType: { show: true, type: ["line", "bar", "stack", "tiled"] },
                            restore: { show: true },
                            saveAsImage: { show: true },
                        },
                    },
                    xAxis: [
                        {
                            name: '年龄段',
                            type: "category",
                            axisTick: { show: false },
                            data: ['0-20', '20-30', '30-40', '40-50', '50-60', '>60'],//加东西
                            axisLine: {
                                show: true,
                                lineStyle: {
                                    color: "rgba(255,255,255)",
                                    width: 1,
                                    type: "solid",
                                },
                            },
                        },
                    ],
                    yAxis: [
                        {
                            name: '人数',
                            type: "value",
                            axisLine: {
                                show: true,
                                lineStyle: {
                                    color: "rgba(255,255,255)",
                                    width: 1,
                                    type: "solid",
                                },
                            },
                        },
                    ],
                    series: getJson()
                };
                option && myChart.setOption(option);
            }
        );
    }

    function echarts_3() {
        this.$.get("http://localhost:8080/job/analysis/customer/getPeopOutTimeGroup").then(
            (res) => {
                var xT = [];
                for (var i = 0; i < 24; i++)
                    xT.push(i.toString());

                function getJson() {
                    var arr = new Array();
                    for (var i = 0; i < 6; i++)
                        arr[i] = new Array();
                    res.data.forEach(function (value) {
                        arr[value.ageType][value.outtimeType] = value.num;
                    });
                    for (var i = 0; i < arr.length; i++) {
                        var arr1 = arr[i];
                        for (var j = 0; j < arr1.length; j++) {
                            if (arr[i][j] == null)
                                arr[i][j] = 0;
                        }
                    }
                    var s = [];
                    var array = {};
                    for (var i = 0; i < 6; i++) {
                        array["name"] = ageT[i];
                        array["type"] = 'line';
                        array["stack"] = '总量';
                        array["data"] = arr[i];
                        s.push(array);
                        array = {};
                    }
                    return s;
                }

                var chartDom = document.getElementById('echart3');
                var myChart = echarts.init(chartDom);
                var option;

                option = {
                    color: ['#e5a214', '#8ac202', '#fc853e', '#6ab0b8', '#28cad8',],
                    title: { text: '' },
                    tooltip: { trigger: 'axis' },
                    legend: {
                        data: ageT,//['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎'],
                        textStyle: {
                            color: "white", // 图例文字颜色
                            fontSize: 12,
                        },
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
                        textStyle: {
                            color: 'white',
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(255,255,255)",
                                width: 1,
                                type: "solid",
                            },
                        },
                        data: xT,
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
                        type: 'value'
                    },
                    series: getJson()
                };
                option && myChart.setOption(option);


            });
    }

    function echarts_4() {
        var localDate = new Date('2020/7/15');
        var stringDate = getFormatDate(localDate);
        this.$.get("http://localhost:8080/job/analysis/customer/getPeopleLocalOutFlowByWeek?date=" + stringDate).then(res => {
            var date = new Date(stringDate);
            var category = [];
            var dottedBase = +new Date();
            var lineData = [];
            var barData = [];
            for (var i = 7; i > 0; i--) {
                category.push([
                    date.getFullYear(),
                    date.getMonth() + 1,
                    date.getDate() - i
                ].join('-'));
            }
            res.data.forEach(item => {
                if (item.localOrout == 0)
                    barData[item.day - 1] = item.num;
                else
                    lineData[item.day - 1] = item.num;
            })
            var chartDom = document.getElementById('echart4');
            var myChart = echarts.init(chartDom);
            var option;
            option = {
                backgroundColor: '',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['外省', '本省'],
                    textStyle: {
                        color: '#ccc'
                    }
                },
                xAxis: {
                    name: '日期',
                    data: category,
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    }
                },
                yAxis: {
                    name: '人数',
                    splitLine: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    }
                },
                series: [{
                    name: '外省',
                    type: 'line',
                    smooth: true,
                    showAllSymbol: true,
                    symbol: 'emptyCircle',
                    symbolSize: 15,
                    data: lineData
                }, {
                    name: '本省',
                    type: 'bar',
                    barWidth: 10,
                    itemStyle: {
                        barBorderRadius: 5,
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                { offset: 0, color: '#14c8d4' },
                                { offset: 1, color: '#43eec6' }
                            ]
                        )
                    },
                    data: barData
                },
                    // {
                    // name: '外省',
                    // type: 'bar',
                    // barGap: '-100%',
                    // barWidth: 10,
                    // itemStyle: {
                    //     color: new echarts.graphic.LinearGradient(
                    //         0, 0, 0, 1,
                    //         [
                    //             { offset: 0, color: 'rgba(20,200,212,0.5)' },
                    //             { offset: 0.2, color: 'rgba(20,200,212,0.2)' },
                    //             { offset: 1, color: 'rgba(20,200,212,0)' }
                    //         ]
                    //     )
                    // },
                    // z: -12,
                    // data: lineData
                    // },
                ]
            };

            option && myChart.setOption(option);

        }
        )
    }

    function echarts_5() {
        this.$.get("http://localhost:8080/job/analysis/customer/getSexGroup").then(
            res => {
                var chartDom = document.getElementById('echart5');
                var myChart = echarts.init(chartDom);
                var option;
                var arr = [];
                var as = {};
                as["value"] = res.data.sexType[0];
                as["name"] = '女';
                arr.push(as);
                as = {};
                as["value"] = res.data.sexType[1];
                as["name"] = '男'
                arr.push(as);
                option = {
                    color: ['#28cad8', '#fc853e', '#e5a214', '#8ac202',],
                    legend: {
                        top: 'bottom',
                        textStyle: {
                            color: "white", // 图例文字颜色
                        }
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: { show: true },
                            dataView: { show: true, readOnly: false },
                            restore: { show: true },
                            saveAsImage: { show: true }
                        }
                    },
                    series: [
                        {
                            name: '面积模式',
                            type: 'pie',
                            radius: [40, 130],
                            center: ['50%', '50%'],
                            roseType: 'area',
                            // width: 20,
                            // height: 20,
                            itemStyle: {
                                borderRadius: 8
                            },
                            data: arr
                        }
                    ]
                };

                option && myChart.setOption(option);
            });
    }

    function echarts_6() {
        this.$.get("http://localhost:8080/job/analysis/customer/getPeopleDistAndAgeGroup").then(
            (res) => {
                option && myChart.setOption(option);
                var chartDom = document.getElementById("echart6");
                var myChart = echarts.init(chartDom);
                var option;

                function getY() {
                    var y = new Array();
                    for (var i = 1; i <= 10; i++)
                        y[i - 1] = i.toString();
                    return y;
                }

                function getJson() {
                    var arr = new Array();
                    for (var i = 0; i < 6; i++)
                        arr[i] = new Array();
                    res.data.forEach(function (value) {
                        arr[value.ageType][value.dist - 1] = value.num;
                    });
                    for (var i = 0; i < arr.length; i++) {
                        var arr1 = arr[i];
                        for (var j = 0; j < arr1.length; j++) {
                            if (arr[i][j] == null)
                                arr[i][j] = 0;
                        }
                    }
                    var s = [];
                    var array = {};
                    for (var i = 0; i < 6; i++) {
                        array["name"] = ageT[i];
                        array["type"] = "bar";
                        array["stack"] = "total";
                        array["label"] = { show: true };
                        array["emphasis"] = { focus: "series" };
                        array["data"] = arr[i];
                        s.push(array);
                        array = {};
                    }
                    return s;
                }

                option = {
                    // tooltip: {
                    //     trigger: 'axis',
                    //     axisPointer: {            // Use axis to trigger tooltip
                    //         type: 'shadow'        // 'shadow' as default; can also be 'line' or 'shadow'
                    //     }
                    // },
                    legend: {
                        data: ageT,
                        textStyle: {
                            color: "white", // 图例文字颜色
                        },
                    },
                    label: {
                        formatter: function (value) {
                            it = value.value / 10000
                            it = Math.floor(it * 10) / 10
                            return it + 'w'
                        }
                    },
                    grid: {
                        left: "3%",
                        right: "8%",
                        bottom: "3%",
                        containLabel: true,
                    },
                    xAxis: {
                        name: '人数',
                        type: "value",
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(255,255,255)",
                                width: 1,
                                type: "solid",
                            },
                        },
                        axisLabel: {
                            formatter: function (value, index) {
                                return value / 10000 + 'w'
                            }
                        }
                    },
                    yAxis: {
                        name: '地区',
                        type: "category",
                        data: getY(),
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "rgba(255,255,255)",
                                width: 1,
                                type: "solid",
                            },
                        },

                    },
                    series: getJson()
                };
                option && myChart.setOption(option);
                // window.setInterval(function () {
                //     myChart.clear();
                //     echarts_6();
                // }, 3000);
            })
    }

})
    ;
