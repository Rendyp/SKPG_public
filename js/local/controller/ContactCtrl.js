app.factory('ContactSvc', function ($http, config, $localStorage) {
    return {
        //service
        save: function (data) {
            var url = config.url + 'ourcontact';
            return $http.post(url,data);
        }
    };
});
app.controller('ContactCtrl', function (toastr, $filter, $loading, ContactSvc, $q, $stateParams, $timeout, $window, $rootScope, $scope, $http, config, $rootScope, $localStorage, $state) {

    $scope.form = {}


    $scope.send = function () {
        console.log($scope.form);
        ContactSvc.save($scope.form).then(function (res) {
            //  console.log(res)
            // $loading.finish('save')
            if (res.data.ErrorCode == 0) {
                console.log(res);
                // toastr.success('Berhasil menambahkan user');
                // $scope.refreshTable();
                // $timeout(function () {
                //     angular.element('#hideButton').triggerHandler('click');
                // })
                $scope.form = {}
                alert('Pesan berhasil dikirim')
                toastr.success('Pesan berhasil dikirim')
            } else {

            }
        }).catch((e) => {
            $loading.finish('save')
            toastr.error('Pesan gagal dibuat')
            $scope.isLoading = false;
        });

    }
});