(function () {
    'use strict';
    Number.prototype.round = function (p) {
        p = p || 10;
        return parseFloat(this.toFixed(p));
    };
    app.factory('BerandaSvc', function ($http, config, $localStorage) {
        return {
            //service
            berita: function () {
                var url = config.url + 'information?limit=9&SortBy=Id:desc&Criteria=Published:true';
                return $http.get(url);
            },
            chartNasional: function () {
                var url = config.api + 'grafik/nasional';
                return $http.get(url);
            },
            laporan: function () {
                var url = config.api + 'laporan';
                return $http.get(url);
            },
            chart: function (id_user, tahun, status) {
                var url = config.api + 'grafik/' + id_user + '/' + tahun + '/' + status;
                return $http.get(url);
            },
            getUsers: function () {
                var url = config.api + "users"
                return $http.get(url);
            },
            getAllMap: function () {
                var url = config.apiSKPG + "locations"
                return $http.get(url);
            },
            getData: function (idProvinsi, idKabupaten, Year) {
                var url = config.apiSKPG + "data/" + idProvinsi + "/" + idKabupaten + "/" + Year
                return $http.get(url);
            },

        };
    });

    app.controller('BerandaCtrl', function ($uibModal, $sce, $compile, toastr, $filter, $loading, BerandaSvc, $q, $stateParams, $timeout, $window, $scope, $http, config, $rootScope, $localStorage, $state) {

        $scope.listYear = [];
        $scope.isActiveTab = "provinsi";
        $scope.dataResult = [];
        $scope.listMonth = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        $scope.getListYear = function () {
            let thisYear = new Date().getFullYear();

            for (let definedYear = 1990; definedYear <= thisYear; thisYear--) {
                $scope.listYear.push(thisYear)
            }
        }
        $scope.getListYear();
        $scope.changeYear = function () {
            $scope.current_laporan.jenis_laporan = ''
        }

        var formatNumber = function (num) {
            return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }

        //MAPSSS
        var myCustomStyle = {
            stroke: true,
            color: 'green',
            fill: true,
            fillColor: 'white',
            fillOpacity: 0.5,
            dashArray: '3'
        }

        $("#mapid").height($(window).height() - $(".impx-header").height() - 50).width($(window).width());
        // map.invalidateSize();
        var map = L.map('mapid');
        map.createPane('labels');
        // This pane is above markers but below popups
        map.getPane('labels').style.zIndex = 650;
        map.addControl(new L.Control.Fullscreen({
            title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
            }
        }));
        // Layers in this pane are non-interactive and do not obscure mouse/touch events
        map.getPane('labels').style.pointerEvents = 'none';

        var cartodbAttribution =
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';

        var positron = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1Ijoic2VwdGlhbnNjcCIsImEiOiJjanpiZXBqb2gwMDhuM3ByejM3eG9lM2k2In0.LSUBm24srpVlD2CE_bhUKg'
        }).addTo(map);


        var positronLabels = L.tileLayer(
            'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                attribution: cartodbAttribution,
                pane: 'labels'
            }).addTo(map);
        var geojson = null;
        var initKabupaten = (data) => {
            geojson = L.geoJson(data, {
                style: myCustomStyle
            }).addTo(map);
            geojson.eachLayer(function (layer) {
                //  initMaps(data);
                layer.addEventListener("click", function () {
                    if ($scope.isDataKabupaten) {
                        var user = _.findWhere($scope.users, {
                            id_kab: layer.feature.properties.ID
                        });
                        if (user == null) {
                            alert('Data Map Tidak Ditemukan')
                            return;
                        }
                        $scope.current_laporan = {
                            id_user: user.id,
                            nama_user: user.nama,
                            id_kab: layer.feature.properties.ID
                        };
                        if (document.querySelector('.leaflet-control-fullscreen-button').title == "Exit Fullscreen") {
                            document.querySelector('.leaflet-control-fullscreen-button').click();
                        }

                        $scope.openModal();
                    }
                });
                layer.addEventListener("mouseover", function (event) {
                    console.log(layer.feature.properties.KABKOT)
                    layer.bindTooltip(layer.feature.properties.KABKOT).openTooltip();
                });
            });
        }

        var initMaps = (data) => {
            geojson = L.geoJson(data, {
                style: myCustomStyle
            }).addTo(map);
            geojson.eachLayer(function (layer) {
                //  initMaps(data);
                layer.addEventListener("click", function () {
                    if ($scope.isDataProvinsi) {
                        var user = _.findWhere($scope.users, {
                            id_prov: layer.feature.properties.ID,
                            id_kab: "0"
                        });
                        if (user == null) {
                            alert('User Tidak Ditemukan')
                            return;
                        }
                        $scope.current_laporan = {
                            id_user: user.id,
                            nama_user: user.nama,
                            id_prov: layer.feature.properties.ID,
                            id_kab: null
                        };
                        if (document.querySelector('.leaflet-control-fullscreen-button').title == "Exit Fullscreen") {
                            document.querySelector('.leaflet-control-fullscreen-button').click();
                        }
                        $scope.openModal();
                    } else if ($scope.isDataKabupaten) {
                        $scope.loadingMap = true;
                        $scope.current_laporan = {
                            id_prov: layer.feature.properties.ID,
                        };
                        $http.get('json/' + layer.feature.properties.ID + '.json').then(function (res) {
                            geojson.remove();
                            console.log(layer)
                            map.fitBounds(layer.getBounds());
                            initKabupaten(res.data);
                            $scope.loadingMap = false;
                        })
                    }
                });
                layer.addEventListener("mouseover", function (event) {
                    console.log(layer.feature.properties.PROVINSI)
                    layer.bindTooltip(layer.feature.properties.PROVINSI).openTooltip();
                });
            });

        }
        $scope.users = [];
        $scope.provinsi = [];
        $scope.getUsers = () => {
            return BerandaSvc.getUsers().then((res) => {
                $scope.users = res.data.users;
            })
        }
        // $scope.getProvinsi = () => {
        //     return BerandaSvc.getProvinsi().then((res) => {
        //         $scope.provinsi = res.data;
        //         console.log($scope.provinsi)
        //     })
        // }
        $scope.getData = async (daerah) => {
            if ($scope.users.length == 0) {
                await $scope.getUsers();
            }
            // if ($scope.provinsi.length == 0) {
            //     await $scope.getProvinsi();
            // }
            $scope.isDataNasional = false;
            $scope.isDataProvinsi = false;
            $scope.isDataKabupaten = false;
            if (daerah == 'nasional') {
                $scope.isDataNasional = true;
                myCustomStyle.stroke = false;
            } else if (daerah == 'provinsi') {
                $scope.isDataProvinsi = true;
                myCustomStyle.stroke = true;
            } else if (daerah == 'kabupaten') {
                $scope.isDataKabupaten = true;
                myCustomStyle.stroke = true;
                // return;
            }
            $scope.loadingMap = true;
            return $http.get('json/provinsi.json').then(function (res) {
                if (geojson != null) {
                    geojson.remove();
                }
                initMaps(res.data);
                map.setView({
                    lat: -1.1949571,
                    lng: 120.8230631
                }, 5);
                $scope.loadingMap = false;
            })
        }
        $scope.toDetail = (item) => {
            if ($scope.form.jenis_laporan == 'NBM') {
                $scope.current_item = item;
                $scope.getChart(item);
            } else if ($scope.form.jenis_laporan == 'PPH') {
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

        $scope.openModal = function () {

            $scope.form = {};
            $scope.form.jenis_laporan = "-";
            $scope.form.laporan = [];
            $scope.current_item = {};
            console.log($scope)
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/page/laporan/modal.html",
                size: "xl",
                scope: $scope,
                controller: function ($scope, $uibModalInstance, $rootScope) {
                    $rootScope.closeAlert = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                },
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            })
        };
        $scope.getData('provinsi');
        $scope.getUsers();
        $scope.showNoResult = false;
        $scope.country = undefined;
        $scope.complete = function (string) {
            var output = [];
            angular.forEach($scope.users, function (country) {
                if (country.nama.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
                    output.push(country);
                }
            });
            if (output.length == 0) {
                $scope.showNoResult = true;
            } else {
                $scope.showNoResult = false;
            }
            $scope.filterCountry = output;
        }
        $scope.searchBox = function (item) {
            $scope.country = angular.copy(item);
            $scope.filterCountry = null;
            $scope.showNoResult = false;
            console.log($scope.country,'isi country')
            var kab = $scope.country.id_kab == "0" ? null : $scope.country.id_kab  
            $scope.current_laporan = {
                id_prov:$scope.country.id_prov,
                id_kab:kab,
                id_user: item.id,
                nama_user: item.nama
            };
            $scope.openModal()
        }
        $scope.closeSearch = function () {
            $scope.country = undefined;
            $scope.filterCountry = null;
            $scope.showNoResult = false;
        }
        $scope.berita = [];
        $scope.html = '';
        $scope.trustedHtml = $sce.trustAsHtml($scope.html);
        $scope.getInformasi = () => {
            return BerandaSvc.berita().then((res) => {
                $scope.berita = res.data.Data;
                $timeout(() => {
                    $scope.setToHtml();
                })
                console.log($scope.berita)
            })
        }
        $scope.redirectToPost = (id) => {
            console.log("redirect to post")
            $state.go("app.blogDetail", {
                id: id
            });
        }

        $scope.getDataDetail = function (idProvinsi, idKabupaten, tahun) {
            $scope.isLoading = true;
            return BerandaSvc.getData(idProvinsi, idKabupaten, tahun).then((res) => {
                $scope.isLoading = false;
                $scope.dataResult = res.data.response.data;
                if ($scope.dataResult.length == 0) {
                    // alert('Data tidak ditemukan')
                } else {
                    var data = [];
                    var dummy1 = [];

                    $scope.dataIndex = [];
                    $scope.labels = [];
                    $scope.luasTanam = [];
                    $scope.luasPusoPadi = [];
                    $scope.dataDummy = [];

                    for (var i = 0; i < $scope.dataResult.length; i++) {
                        $scope.labels.push($scope.listMonth[$scope.dataResult[i].bulan - 1])
                        if ($scope.current_laporan.jenis_laporan == 'Ketersediaan') {
                            data.push($scope.dataResult[i].indeks_ketersediaan)
                        } else if ($scope.current_laporan.jenis_laporan == 'Akses') {
                            data.push($scope.dataResult[i].indeks_akses)
                        } else if ($scope.current_laporan.jenis_laporan == 'Pemanfaatan') {
                            data.push($scope.dataResult[i].indeks_pemanfaatan)
                        }
                        dummy1.push(0)
                    }
                    $scope.dataIndex.push(data);

                    $scope.dataDummy.push(dummy1);
                    $scope.dataDummy.push(dummy1);
                }
            })
        }

        $scope.legendLuasTanam = ['Luas Tanam Padi', 'Luas Tanaman Padi Rata-rata'];

        // doesn't work 
        $scope.colours = [{
            fillColor: "rgba(255,0,0,1)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,0.8)"
        }];

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    });
})();