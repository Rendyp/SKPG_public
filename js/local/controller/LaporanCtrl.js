app.factory('LaporanSvc', function ($http, config, $localStorage) {
    return {
        //service
        laporan: function () {
            var url = config.api + "laporan"
            return $http.get(url);
        },
        getUsers: function () {
            var url = config.api + "users"
            return $http.get(url);
        },
        chart: function (id_user, tahun, status) {
            var url = config.api + 'grafik/' + id_user + '/' + tahun + '/' + status;
            return $http.get(url);
        }

    };
});
app.controller('LaporanCtrl', function (toastr, $filter, $loading, LaporanSvc, $q, $stateParams, $timeout, $window, $rootScope, $scope, $http, config, $rootScope, $localStorage, $state) {
    $scope.laporan = {
        nbm: [],
        pph: []
    }
    $scope.users = [];
    $scope.getUsers = () => {
        return LaporanSvc.getUsers().then((res) => {
            $scope.users = res.data.users;
        })
    }
    $scope.getLaporan = () => {
        $scope.isLoading = true;
        return LaporanSvc.laporan().then((res) => {
            $scope.laporan = res.data;
            $scope.isLoading = false;
        }).catch(e =>{
            $scope.isLoading = false;
            toastr.error('Harap Refresh Kembali')
        });
    }
    $scope.toDetail = (item,laporan) => {
        if(laporan == 'nbm'){
            $state.go("app.laporan-nbm-detail", {
                tahun: item.tahun,
                id_user: item.id_user,
                status: item.status
            })
        }else if(laporan == 'pph'){
            // $state.go("app.laporan-pph-detail", {
            //     tahun: item.tahun,
            //     id_user: item.id_user,
            //     status: item.status
            // })
            window.open(
                config.api + "../api_pdf/pph/" + item.id_user + "/" + item.tahun + "/" + (item.status == 'sangat sementara' ? 'sangat_sementara' : item.status),
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }
    $scope.toPdf = (params) => {
        window.open(
            config.api + "../api_pdf/nbm/" + params.id_user + "/" + params.tahun + "/" + (params.status == 'sangat sementara' ? 'sangat_sementara' : params.status),
            '_blank' // <- This is what makes it open in a new window.
        );
    }
    $scope.params = $stateParams;
    var formatNumber = function (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.user = {};
    $scope.getChart = async function () {
         await $scope.getUsers();
         console.log($scope.users, "users")
         $scope.user = _.findWhere($scope.users, {
             id: $stateParams.id_user.toString()
         });
         console.log($scope.user, "user")
        return LaporanSvc.chart($stateParams.id_user, $stateParams.tahun, ($stateParams.status == 'sangat sementara' ? 'sangat_sementara' : $stateParams.status)).then((res) => {
            console.log(res.data);
           
            var grafikType = res.data.grafik_type;
            var max = _.max(grafikType, function (item) {
                return item.tahun;
            });
            $scope.tahunChart = max.tahun;
            grafikType = _.where(grafikType, {
                tahun: max.tahun
            });
            grafikType.map(item => {
                item.jenis = item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1);
                item.energi = parseFloat(item.energi).round(2);
                item.lemak = parseFloat(item.lemak).round(2);
                item.protein = parseFloat(item.protein).round(2);
            })
            $scope.generateChart(grafikType, "Energi", "EnergiChart", "energi");
            $scope.generateChart(grafikType, "Protein", "ProteinChart", "protein");
            $scope.generateChart(grafikType, "Lemak", "LemakChart", "lemak");
            var grafikKomoditas = res.data.grafik_komoditas;
            var max = _.max(grafikKomoditas, function (item) {
                return item.tahun;
            });
            $scope.tahunKomoditas = max.tahun;
            grafikKomoditas = _.where(grafikKomoditas, {
                tahun: max.tahun
            });
            grafikKomoditas.map(item => {
                item.energi = parseFloat(item.energi).round(2);
                item.lemak = parseFloat(item.lemak).round(2);
                item.protein = parseFloat(item.protein).round(2);
            })
            $scope.generateChartKomoditas(grafikKomoditas, "Energi", "KomoditasEnergiChart", "energi");
            $scope.generateChartKomoditas(grafikKomoditas, "Protein", "KomoditasProteinChart", "protein");
            $scope.generateChartKomoditas(grafikKomoditas, "Lemak", "KomoditasLemakChart", "lemak");
            var lemakLineChart = [];
            var proteinLineChart = [];
            var energiLineChart = [];
            res.data.grafik_histori.map(item => {
                var findIndex = lemakLineChart.findIndex(x => x.year == item.tahun);
                if (findIndex == -1) {
                    lemakLineChart.push({
                        year: item.tahun
                    });
                }
                findIndex = lemakLineChart.findIndex(x => x.year == item.tahun);
                if (item.status == "tetap") {
                    lemakLineChart[findIndex].tetap = parseFloat(item.lemak);
                }
                if (item.status == "sangat sementara") {
                    lemakLineChart[findIndex].sangat_sementara = parseFloat(item.lemak);
                }
                if (item.status == "sementara") {
                    lemakLineChart[findIndex].sementara = parseFloat(item.lemak);
                }
                findIndex = proteinLineChart.findIndex(x => x.year == item.tahun);
                if (findIndex == -1) {
                    proteinLineChart.push({
                        year: item.tahun
                    });
                }
                findIndex = proteinLineChart.findIndex(x => x.year == item.tahun);
                if (item.status == "tetap") {
                    proteinLineChart[findIndex].tetap = parseFloat(item.protein);
                }
                if (item.status == "sangat sementara") {
                    proteinLineChart[findIndex].sangat_sementara = parseFloat(item.protein);
                }
                if (item.status == "sementara") {
                    proteinLineChart[findIndex].sementara = parseFloat(item.protein);
                }
                findIndex = energiLineChart.findIndex(x => x.year == item.tahun);
                if (findIndex == -1) {
                    energiLineChart.push({
                        year: item.tahun
                    });
                }
                findIndex = energiLineChart.findIndex(x => x.year == item.tahun);
                if (item.status == "tetap") {
                    energiLineChart[findIndex].tetap = parseFloat(item.energi);
                }
                if (item.status == "sangat sementara") {
                    energiLineChart[findIndex].sangat_sementara = parseFloat(item.energi);
                }
                if (item.status == "sementara") {
                    energiLineChart[findIndex].sementara = parseFloat(item.energi);
                }
            })
            $scope.generateLineChart(lemakLineChart, "Lemak", "LemakLineChart", "gr/kapita/hari");
            $scope.generateLineChart(proteinLineChart, "Protein", "ProteinLineChart", "gr/kapita/hari");
            $scope.generateLineChart(energiLineChart, "Energi", "EnergiLineChart", "kkal/hari");
        });
    }
    //CHART (Grafik berdasarkan Energi, Protein & Lemak)
    $scope.generateChart = (data, judul, idElement, property) => {
        am4core.ready(function () {
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create(idElement, am4charts.PieChart);
            chart.data = data;
            var jumlah = 0;
            chart.data.map(item => {
                jumlah += item[property];
            });
            chart.innerRadius = 85;
            chart.logo.hidden = true
            var title = chart.titles.create();
            title.text = judul;
            title.fontSize = 15;
            var label = chart.seriesContainer.createChild(am4core.Label);
            label.text = formatNumber(jumlah.round(2));
            label.horizontalCenter = "middle";
            label.verticalCenter = "middle";
            label.fontSize = 15;
            var pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = property;
            pieSeries.dataFields.category = "jenis";
            // Disable ticks and labels
            pieSeries.labels.template.disabled = true;
            pieSeries.ticks.template.disabled = true;
            pieSeries.colors.list = [
                am4core.color("#32ff7e"),
                am4core.color("#ff4d4d"),
            ];
            // Add a legend
            chart.legend = new am4charts.Legend();
            chart.legend.position = "bottom";
        });
    }
    //CHART (Grafik berdasarkan Komoditas)
    $scope.generateChartKomoditas = (data, judul, idElement, property) => {
        am4core.ready(function () {
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create(idElement, am4charts.PieChart);
            chart.data = data;
            var jumlah = 0;
            chart.data.map(item => {
                jumlah += item[property];
            });
            chart.innerRadius = 85;
            chart.logo.hidden = true
            var title = chart.titles.create();
            title.text = judul;
            title.fontSize = 15;
            var label = chart.seriesContainer.createChild(am4core.Label);
            label.text = formatNumber(jumlah.round(2));
            label.horizontalCenter = "middle";
            label.verticalCenter = "middle";
            label.fontSize = 15;
            var pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = property;
            pieSeries.dataFields.category = "jenis";
            pieSeries.colors.list = [
                am4core.color("#c56cf0"),
                am4core.color("#ffb8b8"),
                am4core.color("#ff3838"),
                am4core.color("#ff9f1a"),
                am4core.color("#fff200"),
                am4core.color("#32ff7e"),
                am4core.color("#7efff5"),
                am4core.color("#18dcff"),
                am4core.color("#7d5fff"),
                am4core.color("#4b4b4b"),
                am4core.color("#ff9f1a"),
            ];
            // Disable ticks and labels
            pieSeries.labels.template.disabled = true;
            pieSeries.ticks.template.disabled = true;
            // Add a legend
            chart.legend = new am4charts.Legend();
            chart.legend.position = "bottom";
            chart.legend.layout = "vertical";
            console.log(chart.legend, "legend")
        });
    }

    //LINE CHART
    $scope.generateLineChart = (data, judul, idElement, satuan) => {
        am4core.ready(function () {
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create(idElement, am4charts.XYChart);
            chart.data = data;
            chart.logo.hidden = true
            var title = chart.titles.create();
            title.text = judul;
            title.fontSize = 15;
            // Create category axis
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "year";
            categoryAxis.renderer.opposite = true;

            // Create value axis
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.inversed = true;
            valueAxis.title.text = "Ketersediaan " + judul;
            valueAxis.renderer.minLabelPosition = 0.01;

            // Create series
            var series1 = chart.series.push(new am4charts.LineSeries());
            series1.dataFields.valueY = "sangat_sementara";
            series1.dataFields.categoryX = "year";
            series1.name = "Sangat Sementara";
            series1.strokeWidth = 3;
            series1.bullets.push(new am4charts.CircleBullet());
            series1.tooltipText = "Ketersediaan " + judul + " {categoryX} {name} : {valueY} " + satuan;
            series1.legendSettings.valueText = "{valueY}";
            series1.visible = false;
            series1.fill = "#32ff7e";
            series1.stroke = "#32ff7e";
            console.log(series1, "series1")

            var series2 = chart.series.push(new am4charts.LineSeries());
            series2.dataFields.valueY = "sementara";
            series2.dataFields.categoryX = "year";
            series2.name = 'Sementara';
            series2.strokeWidth = 3;
            series2.bullets.push(new am4charts.CircleBullet());
            series2.tooltipText = "Ketersediaan " + judul + " {categoryX} {name} : {valueY} " + satuan;
            series2.legendSettings.valueText = "{valueY}";
            series2.fill = "#ff4d4d";
            series2.stroke = "#ff4d4d";
            var series3 = chart.series.push(new am4charts.LineSeries());
            series3.dataFields.valueY = "tetap";
            series3.dataFields.categoryX = "year";
            series3.name = 'Tetap';
            series3.strokeWidth = 3;
            series3.bullets.push(new am4charts.CircleBullet());
            series3.tooltipText = "Ketersediaan " + judul + " {categoryX} {name} : {valueY} " + satuan;
            series3.legendSettings.valueText = "{valueY}";
            series3.fill = "yellow";
            series3.stroke = "yellow";
            // Add chart cursor
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "zoomY";

            // Add legend
            chart.legend = new am4charts.Legend();

        }); // end am4core.ready()
    }

});