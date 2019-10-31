     app.directive('uploadFiles', function () {
         return {
             scope: true, //create a new scope  
             link: function (scope, el, attrs) {
                 el.bind('change', function (event) {
                     var files = event.target.files;
                     var event = event.target;
                     //iterate files since 'multiple' may be specified on the element  
                     for (var i = 0; i < files.length; i++) {
                         //emit event upward  
                         scope.$emit("seletedFile", {
                             file: files[i],
                             event: event
                         });
                     }
                 });
             }
         };
     });
     app.factory('AuthSvc', function ($http, config) {
         return {
             //service
             login: function (data, isMember) {
                 if (isMember) {
                     var url = config.new + 'members/login';
                 } else {
                     var url = config.new + 'institutions/login';
                 }
                 return $http.post(url, data);
             },
             forgot: function (data) {
                 var url = config.new + 'members/forgotPass';
                 return $http.post(url, data);
             },
             provinsi: function () {
                 var url = config.new + 'enumeration/provinsi';
                 return $http.get(url);
             },
             kota: function () {
                 var url = config.new + 'enumeration/kota';
                 return $http.get(url);
             },
             kecamatan: function () {
                 var url = config.new + 'enumeration/kecamatan';
                 return $http.get(url);
             },
             desa: function () {
                 var url = config.new + 'enumeration/desa';
                 return $http.get(url);
             },
             daftar: function (data, files) {
                 data.foto = files;
                 var formData = new FormData();
                 formData.append("foto", files);
                 formData.append("nama", data.nama);
                 formData.append("nik", data.nik);
                 formData.append("gender", data.gender);
                 formData.append("telepon", data.telepon);
                 formData.append("email", data.email);
                 formData.append("password", data.password);
                 formData.append("alamat", data.alamat);
                 formData.append("id_desa", data.id_desa);
                 var url = config.new + "members/register"
                 var head = {
                     transformRequest: angular.identity,
                     headers: {
                         'upload': true,
                         'Content-Type': undefined
                     }
                 };
                 return $http.post(url, formData, head)
             },
         };
     });
     app.controller('AuthCtrl', function (toastr, $filter, $loading, AuthSvc, $q, $stateParams, $timeout, $window, $rootScope, $scope, $http, config, $rootScope, $localStorage, $state) {
         config.pageIsNotLogin();
         $scope.$on("seletedFile", function (event, args) {
             $scope.$apply(function () {
                 var p = args.file;
                 $scope.fileName = p.name;
                 $scope.filesPctr = p;
                 setTimeout(function () {
                     var oFReader = new FileReader();
                     oFReader.readAsDataURL(p);
                     oFReader.onload = function (oFREvent) {
                         angular.element('#studentPhoto').prop('src', oFREvent.target.result);
                         // $scope.UrlStudentProfil = oFREvent.target.result;
                     };
                 }, 500)
             })
         });
         $scope.initDaftar = () => {
             AuthSvc.provinsi().then((res) => {
                 $scope.provinsi = res.data
             });
             AuthSvc.kota().then((res) => {
                 $scope.kota = res.data
             });
             AuthSvc.kecamatan().then((res) => {
                 $scope.kecamatan = res.data
             });
             AuthSvc.desa().then((res) => {
                 $scope.desa = res.data
             });
         }
         $scope.changeProvinsi = () => {
             $scope.listKota = $filter('filter')($scope.kota, {
                 'id_provinsi': $scope.form.provinsi_id
             }, true)
             console.log($scope.listKota)
             $scope.listKecamatan = [];
             $scope.listDesa = [];
         }
         $scope.changeKota = () => {
             $scope.listKecamatan = $filter('filter')($scope.kecamatan, {
                 'id_kabupaten_kota': $scope.form.kota_id
             }, true);
             $scope.listDesa = [];
         }
         $scope.changeKecamatan = () => {
             $scope.listDesa = $filter('filter')($scope.desa, {
                 'id_kecamatan': $scope.form.kecamatan_id
             }, true);
         }
         $scope.form = {};
         $scope.doLogin = (isMember) => {
             $loading.start('save');
             return AuthSvc.login($scope.form, isMember).then((res) => {
                 $loading.finish('save');
                 if (res.data.results == undefined) {
                     toastr.error(res.data.message)
                 } else if (res.data.results && res.data.results.length == 1 && res.data.results[0].isverified == 0) {
                     toastr.error(res.data.message)
                 } else {
                     toastr.success(res.data.message)
                     $localStorage = angular.extend($localStorage, res.data.results[0])
                     $localStorage.token = res.data.token;
                     $state.go("app.index")
                 }
                 console.log(res, "res")
             }).catch((e) => {
                 $loading.finish('save');
                 console.log(e, "error")
             })
         }

         $scope.doDaftar = () => {
             $loading.start('save');
             $scope.form.id_desa = $scope.form.kelurahan_id;
             return AuthSvc.daftar($scope.form, $scope.filesPctr).then((res) => {
                 $loading.finish('save');
                 if (res.data.results) {
                     toastr.success(res.data.message)
                     // $state.go("app.index")
                 } else {
                     toastr.error(res.data.message)
                 }
                 console.log(res, "res")
             }).catch((e) => {
                 $loading.finish('save');
                 console.log(e, "error")
             })
         }

          $scope.doForgot = () => {
              $loading.start('save');
              return AuthSvc.forgot($scope.form).then((res) => {
                  $loading.finish('save');
                  if (res.data.results != undefined) {
                      toastr.success(res.data.message)
                      // $state.go("app.index")
                  } else {
                      toastr.error(res.data.message)
                  }
                  console.log(res, "res")
              }).catch((e) => {
                  $loading.finish('save');
                  console.log(e, "error")
              })
          }

     });