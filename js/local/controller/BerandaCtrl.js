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
            getData: function (idProvinsi, idKabupaten, idKecamatan, Year, Bulan) {
                var url = config.apiSKPG + "data/" + idProvinsi + "/" + idKabupaten + "/" + null + "/" + Year
                if (Bulan) {
                    url = url + '/' + Bulan.no
                }

                return $http.get(url);
            },

            getProvinsi: function () {
                var url = config.apiSKPG + "provinsi"
                return $http.get(url);
            },

            getKabupaten: function (idProvinsi) {
                var url = config.apiSKPG + "kab/" + idProvinsi
                return $http.get(url);
            },
            getKecamatan: function (idProvinsi, idKab) {
                var url = config.apiSKPG + "kec/" + idProvinsi + '/' + idKab
                return $http.get(url);
            }

        };
    });

    app.controller('BerandaCtrl', function ($uibModal, $sce, $compile, toastr, $filter, $loading, BerandaSvc, $q, $stateParams, $timeout, $window, $scope, $http, config, $rootScope, $localStorage, $state, Flash) {


        $scope.listYear = [];
        $scope.isActiveTab = "provinsi";
        $scope.dataResult = [];
        $scope.listMonth = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        $scope.listBulan = [
            { no: 1, name: 'Januari' },
            { no: 2, name: 'Februari' },
            { no: 3, name: 'Maret' },
            { no: 4, name: 'April' },
            { no: 5, name: 'Mei' },
            { no: 6, name: 'Juni' },
            { no: 7, name: 'Juli' },
            { no: 8, name: 'Agustus' },
            { no: 9, name: 'September' },
            { no: 10, name: 'Oktober' },
            { no: 11, name: 'November' },
            { no: 12, name: 'Desember' }
        ]

        $scope.datasetOverride = {
            backgroundColor: ['#383a4e', '#A04d4d', '#ff8c00', '#413041', '#7b6888', '#6b486b', '#d68c5b', '#d0743c'],
            hoverBackgroundColor: ['#22243a', '#822e2e', '#c66d00', '#2d1a2d', '#634d72', '#533253', '#B66734', '#AF561E'],
            hoverBorderColor: ['#22243a', '#822e2e', '#c66d00', '#2d1a2d', '#634d72', '#533253', '#B66734', '#AF561E']
        };

        $scope.getListYear = function () {
            let thisYear = new Date().getFullYear();

            for (let definedYear = 2010; definedYear <= thisYear; thisYear--) {
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
            color: 'white',
            fill: true,
            fillColor: '#006bff',
            fillOpacity: 1,
            dashArray: '3',
            zIndex: 99999
        }

        $("#mapid").height($(window).height() - $(".tg-header").height() - 50 - 63).width($(window).width());
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
            '&copy; <a href="https://carto.com/attribution">CARTO</a>';

        var positron = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.light',
            accessToken: 'pk.eyJ1Ijoic2VwdGlhbnNjcCIsImEiOiJjanpiZXBqb2gwMDhuM3ByejM3eG9lM2k2In0.LSUBm24srpVlD2CE_bhUKg'
        }).addTo(map);


        var positronLabels = L.tileLayer(
            'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                attribution: cartodbAttribution,
                pane: 'labels'
            }).addTo(map);
        var geojson = null;
        var initKabupaten = (data) => {
            console.log
            geojson = L.geoJson(data, {
                style: myCustomStyle
            }).addTo(map);
            geojson.eachLayer(function (layer) {
                //  initMaps(data);
                layer.addEventListener("click", function () {
                    if ($scope.isDataKabupaten) {
                        $scope.showLaporan = false
                        // var user = _.findWhere($scope.users, {
                        //     id_kab: layer.feature.properties.ID
                        // });
                        // if (user == null) {
                        //     alert('Data Map Tidak Ditemukan')
                        //     return;
                        // }
                        $scope.current_laporan = {
                            // id_user: user.id,
                            // nama_user: user.name,
                            id_kab: layer.feature.properties.ID,
                            id_prov: $scope.id_prov_kab
                        };
                        $scope.country = {}
                        $scope.showLaporan = false
                        for (var i = 0; i < $scope.provinsi.length; i++) {
                            if ($scope.provinsi[i].id == $scope.id_prov_kab) {
                                $scope.country.provinsiNama = $scope.provinsi[i].name
                            }
                        }
                        for (var i = 0; i < $scope.kabupaten.length; i++) {
                            if ($scope.kabupaten[i].id == layer.feature.properties.ID) {
                                $scope.country.provinsiNama = $scope.kabupaten[i].name
                            }
                        }
                        $scope.country.kabupatenNama = layer.feature.properties.KABKOT
                        if (document.querySelector('.leaflet-control-fullscreen-button').title == "Exit Fullscreen") {
                            document.querySelector('.leaflet-control-fullscreen-button').click();
                        }

                        $scope.openModal();
                    }
                });
                layer.addEventListener("mouseover", function (event) {

                    layer.bindTooltip(layer.feature.properties.KABKOT).openTooltip();
                    this.setStyle({ fillColor: '#61AB01', fillOpacity: 1 })
                });
                layer.addEventListener("mouseout", function (event) {

                    this.setStyle({ fillColor: '#006bff', fillOpacity: 1 })

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
                        // var user = _.findWhere($scope.users, {
                        //     id_prov: layer.feature.properties.ID,
                        //     id_kab: "0"
                        // });
                        // if (user == null) {
                        //     alert('User Tidak Ditemukan')
                        //     return;
                        // }
                        $scope.country = {}
                        $scope.showLaporan = false
                        for (var i = 0; i < $scope.provinsi.length; i++) {
                            if ($scope.provinsi[i].id == layer.feature.properties.ID) {
                                $scope.country.provinsiNama = $scope.provinsi[i].name
                            }
                        }

                        $scope.country.kabupatenNama = ""
                        console.log(layer.feature.properties)
                        $scope.current_laporan = {
                            // id_user: user.id,
                            nama_user: layer.feature.properties.PROVINSI,
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
                        $scope.id_prov_kab = layer.feature.properties.ID
                        $http.get('json/' + layer.feature.properties.ID + '.json').then(function (res) {
                            geojson.remove();
                            map.fitBounds(layer.getBounds());
                            initKabupaten(res.data);
                            $scope.getKabupaten($scope.id_prov_kab);
                            $scope.loadingMap = false;
                        })
                    }
                });
                layer.addEventListener("mouseover", function (event) {

                    this.setStyle({ fillColor: '#61AB01', fillOpacity: 1 })
                    layer.bindTooltip(layer.feature.properties.PROVINSI).openTooltip();
                });
                layer.addEventListener("mouseout", function (event) {

                    this.setStyle({ fillColor: '#006bff', fillOpacity: 1 })

                });
            });

        }
        $scope.users = [];
        $scope.provinsi = [];
        $scope.kabupaten = [];
        $scope.kecamatan = [];
        $scope.getUsers = () => {
            return BerandaSvc.getUsers().then((res) => {
                $scope.users = res.data.users;
            })
        }
        $scope.getProvinsi = () => {
            return BerandaSvc.getProvinsi().then((res) => {
                $scope.provinsi = res.data.response.data;

                $scope.kecamatan = [];

                $scope.kabupaten = [];
                $scope.dash.selectedProvinsi = undefined;
                $scope.dash.selectedKecamatan = undefined;
                $scope.dash.selectedKabupaten = undefined;

            })
        }
        $scope.getKabupaten = (selectedProvinsi) => {
            return BerandaSvc.getKabupaten(selectedProvinsi.id).then((res) => {
                $scope.kabupaten = res.data.response.data;

                $scope.kecamatan = [];
                $scope.dash.selectedKecamatan = undefined;
                $scope.dash.selectedKabupaten = undefined;

            })
        }
        $scope.getKecamatan = (selectedKabupaten) => {
            return BerandaSvc.getKecamatan(selectedKabupaten.id_prov, selectedKabupaten.id_kab).then((res) => {
                $scope.kecamatan = res.data.response.data;

                $scope.dash.selectedKecamatan = undefined;

            })
        }
        $scope.showPeta = function (jenis) {
            $scope.petaHeader = jenis;
            $scope.peta = {}
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/page/laporan/modal-peta.html",
                size: "lg",
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
        }
        $scope.getData = async (daerah) => {
            // if ($scope.users.length == 0) {
            //     await $scope.getUsers();
            // }
            if ($scope.provinsi.length == 0) {
                await $scope.getProvinsi();
            }
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


        $scope.openModal = function () {

            $scope.form = {};
            $scope.form.jenis_laporan = "-";
            $scope.form.laporan = [];
            $scope.current_item = {};

            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/page/laporan/modal.html",
                size: "lg",
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
        $scope.popupModal = function () {

            var modal = $uibModal.open({
                animation: true,
                templateUrl: "view/page/laporan/modal-hello.html",
                size: "md",
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
        // $scope.popupModal();
        $scope.getData('provinsi');
        // $scope.getUsers();
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
        $scope.dash = {}
        $scope.searchBox = function () {
            $scope.showLaporan = false

            if ($scope.dash.selectedKecamatan) {
                $scope.country = angular.copy($scope.dash.selectedKecamatan)

            } else if ($scope.dash.selectedKabupaten) {
                $scope.country = angular.copy($scope.dash.selectedKabupaten)
                $scope.country.kec = "0"
                $scope.country.id_kab = $scope.dash.selectedKabupaten.id
                $scope.country.id = $scope.dash.selectedKabupaten.province_id
                $scope.country.provinsiNama = $scope.dash.selectedProvinsi.name
                $scope.country.kabupatenNama = $scope.dash.selectedKabupaten.name

            } else if ($scope.dash.selectedProvinsi) {
                $scope.country = angular.copy($scope.dash.selectedProvinsi)
                $scope.country.provinsiNama = $scope.dash.selectedProvinsi.name
                $scope.country.id_kab = "0"
                $scope.country.id_kec = "0"
            } else {
                alert("Provinsi tidak boleh kosong")
                return
            }
            console.log($scope.country.id)
            console.log($scope.country)


            console.log($scope.country, 'country')
            $scope.filterCountry = null;
            $scope.showNoResult = false;

            var kab = $scope.country.id_kab == "0" ? null : $scope.country.id_kab
            var kec = $scope.country.id_kec == "0" ? null : $scope.country.id_kec
            $scope.current_laporan = {
                id_prov: $scope.country.id,
                id_kab: kab,
                id_user: $scope.country.id,
                id_kec: kec,
                nama_user: $scope.country.name
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

            })
        }
        $scope.redirectToPost = (id) => {

            $state.go("app.blogDetail", {
                id: id
            });
        }
        $scope.showLaporan = false
        $scope.getDataDetail = function (idProvinsi, idKabupaten, idKecamatan, tahun) {
            console.log(idProvinsi);
            $scope.isLoading = true;
            $scope.showLaporan = false
            return BerandaSvc.getData(idProvinsi, idKabupaten, idKecamatan, tahun).then((res) => {
                $scope.isLoading = false;

                $scope.dataResult = res.data.response.data.hasil;
                console.log($scope.dataResult, 'data resu')

                $scope.indeksAkses = []
                $scope.indeksKetersediaan = []
                $scope.indeksPemanfaatan = []
                $scope.indeksKomposit = []

                for (var i = 0; i < 12; i++) {
                    if ($scope.dataResult[i] !== undefined) {
                        $scope.indeksAkses.push($scope.dataResult[i].indeks_akses)
                        $scope.indeksKetersediaan.push($scope.dataResult[i].indeks_ketersediaan)
                        $scope.indeksPemanfaatan.push($scope.dataResult[i].indeks_pemanfaatan)
                        $scope.indeksKomposit.push($scope.dataResult[i].indeks_komposit)
                    } else {
                        $scope.indeksAkses.push("0");
                        $scope.indeksKetersediaan.push("0");
                        $scope.indeksPemanfaatan.push("0");
                        $scope.indeksKomposit.push("0");
                    }
                }
                console.log($scope.indeksAkses, 'indeks akses')
                // var data = [];
                // var dummy1 = [];
                $scope.showLaporan = true;
               

            })
        }

        $scope.legendLuasTanam = ['Luas Tanam Padi', 'Luas Tanaman Padi Rata-rata'];






        $scope.downloadChart = function () {
            html2canvas(document.querySelector("#download-graph")).then(canvas => {

                var link = document.createElement('a');
                link.style.cssText = 'z-index:99999';
                link.href = canvas.toDataURL();
                link.download = $scope.current_laporan.nama_user + '-' + $scope.current_laporan.jenis_laporan + $scope.current_laporan.tahun + '.png';

                //Firefox requires the link to be in the body
                document.body.appendChild(link);

                //simulate click
                link.click();

                //remove the link when done
                document.body.removeChild(link);


            });
        }
        $scope.isShowDropdown = false
        $scope.showDropdown = function () {
            $scope.isShowDropdown = !$scope.isShowDropdown
        }
        $scope.jenisData = ['nasional', 'provinsi']

        $scope.peta = {}
        $scope.isLoading = false
        $scope.getDataPeta = function () {
            if ($scope.peta.tahun == undefined) {
                alert('Tahun tidak boleh kosong')
                return
            }
            if ($scope.peta.bulan == undefined) {
                alert('Bulan tidak boleh kosong')
                return
            }
            if ($scope.peta.jenisData == undefined) {
                alert('Jenis data tidak boleh kosong')
                return
            }
            if ($scope.peta.jenisData == 'provinsi') {
                if ($scope.peta.selectedProvinsi == undefined) {
                    alert('Provinsi tidak boleh kosong')
                    return
                }
            }

            $scope.isLoading = true
            var idProvinsi = ''
            var idKabupaten = ''
            var tahun = ''
            var idKecamatan = ''

            if ($scope.peta.jenisData == 'nasional') {
                idProvinsi = 'all'
                idKabupaten = null
                idKecamatan = null
            } else if ($scope.peta.jenisData == 'provinsi') {
                idProvinsi = $scope.peta.selectedProvinsi.id
                idKabupaten = 'all'
                idKecamatan = null
            } else {
                idProvinsi = $scope.peta.selectedKabupaten.province_id
                idKabupaten = $scope.peta.selectedKabupaten.id
                idKecamatan = null
            }
            return BerandaSvc.getData(idProvinsi, idKabupaten, idKecamatan, $scope.peta.tahun, $scope.peta.bulan).then((res) => {
                $scope.isLoading = false;
                $scope.dataResultPeta = res.data.response.data.hasil;
                if ($scope.dataResultPeta.length == 0) {
                    alert('Data tidak ditemukan')
                } else {
                    var data = [];
                    var dummy1 = [];

                    $scope.dataIndex = [];
                    $scope.labels = [];
                    $scope.luasTanam = [];
                    $scope.luasPusoPadi = [];
                    $scope.dataDummy = [];

                    for (var i = 0; i < $scope.dataResultPeta.length; i++) {
                        $scope.labels.push($scope.listMonth[$scope.dataResultPeta[i].bulan - 1])
                        if ($scope.petaHeader == 'Ketersediaan') {
                            data.push($scope.dataResultPeta[i].indeks_ketersediaan)
                        } else if ($scope.petaHeader == 'Akses') {
                            data.push($scope.dataResultPeta[i].indeks_akses)
                        } else if ($scope.petaHeader == 'Pemanfaatan') {
                            data.push($scope.dataResultPeta[i].indeks_pemanfaatan)
                        }
                        dummy1.push(0)
                    }
                    $scope.dataIndex.push(data);

                    $scope.dataDummy.push(dummy1);
                    $scope.dataDummy.push(dummy1);
                    $scope.showPetaDetail(data)
                }
            })
        }


        $scope.showPetaDetail = async function (data) {
            // $("#mapDetail").height($(window).height() - $(".tg-header").height() - 50 - 63).width($(window).width());
            // map.invalidateSize();



            if ($scope.map2 != null) {
                $scope.map2.remove();
                $scope.map2 = null;
            }

            $scope.map2 = L.map('mapPopup');

            $scope.map2.createPane('labels');
            // This pane is above markers but below popups
            $scope.map2.getPane('labels').style.zIndex = 650;
            $scope.map2.addControl(new L.Control.Fullscreen({
                title: {
                    'false': 'View Fullscreen',
                    'true': 'Exit Fullscreen'
                }
            }));
            // Layers in this pane are non-interactive and do not obscure mouse/touch events
            $scope.map2.getPane('labels').style.pointerEvents = 'none';

            var cartodbAttribution =
                '&copy; <a href="https://carto.com/attribution">CARTO</a>';

            var positron = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.light',
                accessToken: 'pk.eyJ1Ijoic2VwdGlhbnNjcCIsImEiOiJjanpiZXBqb2gwMDhuM3ByejM3eG9lM2k2In0.LSUBm24srpVlD2CE_bhUKg'
            }).addTo($scope.map2);


            var positronLabels = L.tileLayer(
                'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                    attribution: cartodbAttribution,
                    pane: 'labels'
                }).addTo($scope.map2);
            var geojson = null;

            if ($scope.peta.jenisData == 'nasional') {

                return $http.get('json/provinsi.json').then(function (res) {
                    if (geojson != null) {
                        geojson.remove();
                    }

                    $scope.map2.setView({
                        lat: -1.1949571,
                        lng: 120.8230631
                    }, 4);
                    $scope.loadingMap = false;

                    for (var i = 0; i < $scope.dataResultPeta.length; i++) {
                        for (var j = 0; j < res.data.features.length; j++) {
                            if ($scope.dataResultPeta[i].id_prov == res.data.features[j].properties.ID) {
                                if ($scope.petaHeader == 'Akses') {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_akses
                                } else if ($scope.petaHeader == 'Ketersediaan') {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_ketersediaan
                                } else {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_pemanfaatan
                                }

                            }
                        }
                    }



                    geojson = L.geoJson(res.data, {
                        style: getStyle
                    }).addTo($scope.map2);


                    geojson.eachLayer(function (layer) {
                        //  initMaps(data);
                        layer.addEventListener("mouseover", function (event) {
                            layer.bindTooltip("<div>" + layer.feature.properties.PROVINSI + "<br> skor: " + layer.feature.properties.value + "</div>").openTooltip();
                        });

                    });

                    function getStyle(feature) {
                        return {
                            weight: 2,
                            opacity: 0.1,
                            color: 'black',
                            fillOpacity: 0.7,
                            fillColor: getColor(feature.properties.value),

                        };
                    }


                    function getColor(d) {
                        return d == 1 ? '#61AB01' :
                            d == 2 ? 'yellow' : d == 3 ? 'red' : '#2af0e1';
                    }
                    var legend = L.control({ position: "topright" });

                    legend.onAdd = function (map) {
                        var div = L.DomUtil.create("div", "legend");
                        div.innerHTML += "<h4>Keterangan</h4>";
                        div.innerHTML += '<i style="background: #669100"></i><span>Aman</span><br>';
                        div.innerHTML += '<i style="background: yellow"></i><span>Waspada</span><br>';
                        div.innerHTML += '<i style="background: red"></i><span>Rentan</span><br>';
                        return div;
                    };

                    legend.addTo($scope.map2);



                })
            } else {

                return $http.get('json/' + $scope.dataResultPeta[0].id_prov + '.json').then(function (res) {
                    if (geojson != null) {
                        geojson.remove();
                    }


                    // $scope.map2.setView({
                    //     lat: -1.1949571,
                    //     lng: 120.8230631
                    // }, 4);
                    $scope.loadingMap = false;


                    for (var i = 0; i < $scope.dataResultPeta.length; i++) {
                        for (var j = 0; j < res.data.features.length; j++) {
                            var ProvKab = ""
                            if ($scope.dataResultPeta[i].id_kab < 10) {
                                ProvKab = ProvKab + $scope.dataResultPeta[i].id_prov + '0' + $scope.dataResultPeta[i].id_kab
                            } else {
                                ProvKab = ProvKab + $scope.dataResultPeta[i].id_prov + $scope.dataResultPeta[i].id_kab
                            }
                            ProvKab = parseInt(ProvKab)

                            if (ProvKab == res.data.features[j].properties.ID) {
                                if ($scope.petaHeader == 'Akses') {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_akses
                                } else if ($scope.petaHeader == 'Ketersediaan') {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_ketersediaan
                                } else if ($scope.petaHeader == 'Pemanfaatan') {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_pemanfaatan
                                } else {
                                    res.data.features[j].properties.value = $scope.dataResultPeta[i].indeks_komposit
                                }

                            }
                        }
                    }

                    geojson = L.geoJson(res.data, {
                        style: getStyle
                    }).addTo($scope.map2);

                    var gjsonfit = geojson.getBounds()
                    $scope.map2.fitBounds(gjsonfit)

                    geojson.eachLayer(function (layer) {
                        //  initMaps(data);
                        layer.addEventListener("mouseover", function (event) {
                            layer.bindTooltip("<div>" + layer.feature.properties.KABKOT + "<br> skor: " + layer.feature.properties.value + "</div>").openTooltip();
                        });

                    });
                    function getStyle(feature) {
                        return {
                            weight: 2,
                            opacity: 0.1,
                            color: 'black',
                            fillOpacity: 0.7,
                            fillColor: getColor(feature.properties.value),

                        };
                    }


                    function getColor(d) {
                        return d == 1 ? '#61AB01' :
                            d == 2 ? 'yellow' : d == 3 ? 'red' : '#2af0e1';
                    }
                    var legend = L.control({ position: "topright" });

                    legend.onAdd = function (map) {
                        var div = L.DomUtil.create("div", "legend");
                        div.innerHTML += "<h4>Keterangan</h4>";
                        div.innerHTML += '<i style="background: #669100"></i><span>Aman</span><br>';
                        div.innerHTML += '<i style="background: yellow"></i><span>Waspada</span><br>';
                        div.innerHTML += '<i style="background: red"></i><span>Rentan</span><br>';
                        return div;
                    };

                    legend.addTo($scope.map2);




                })

            }




        }
    });
})();