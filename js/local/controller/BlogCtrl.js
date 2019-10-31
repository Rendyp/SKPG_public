app.factory('BlogSvc', function ($http, config, $localStorage) {
    return {
        //service api/information?mode=get-tags&tag-ids=1,2
        get: function () {
            var url = config.url + 'information?sortby=id:desc';
            return $http.get(url);
        },
        getById: function (id) {
            var url = config.url + 'information?id=' + id;
            return $http.get(url)
        },
        getTags: function () {
            var url = config.url + 'tag';
            return $http.get(url);
        },
        createComments: function (data) {
            var url = config.url + 'comments';
            return $http.post(url, data);
        },
        getComments: function (id) {
            var url = config.url + 'comments?criteria=informationId:' + id + ',Approved:true';
            return $http.get(url);
        }
    };
});
app.controller('BlogCtrl', function (toastr, $filter, $loading, BlogSvc, $q, $stateParams, $timeout, $window, $rootScope, $scope, $http, config, $rootScope, $localStorage, $state) {
    $scope.filteredTodos = [];
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    $scope.form = []


    $scope.listMonth = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    $scope.reformatDate = function (dateStr) {
        var dArr = dateStr.split("-");  // ex input "2010-01-18"
        var month = parseInt(dArr[1])
        return dArr[2] + " " + $scope.listMonth[month - 1] + ", " + dArr[0]; //ex out: "18/01/10"
    }
    $scope.form = {}
    $scope.getInformation = function () {
        BlogSvc.get($scope.form).then(function (res) {

            if (res.data.ErrorCode == 0) {
                console.log(res.data.Data);
                $scope.form = res.data.Data
                $scope.figureOutTodosToDisplay();
                for (var i = 0; i < $scope.form.length; i++) {
                    $scope.form[i].CreatedDate = $scope.reformatDate($scope.form[i].CreatedDate);
                }
                $
            }
        }).catch((e) => {
            toastr.error('Harap Refresh Kembali')
        });

    }
    $scope.getInformation();
    $scope.figureOutTodosToDisplay = function () {
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        console.log($scope.form,'isi form')
        $scope.filteredTodos = $scope.form.slice(begin, end);
    };
    $scope.getTags = function () {
        BlogSvc.getTags($scope.form).then(function (res) {

            if (res.data.ErrorCode == 0) {

                $scope.listTags = res.data.Data

            }
        }).catch((e) => {
            toastr.error('Harap Refresh Kembali')
        });

    }
    $scope.getTags();
    $scope.pageChanged = function () {
        $scope.figureOutTodosToDisplay();
    };
});


app.controller('Blog2Ctrl', function (toastr, $filter, $loading, BlogSvc, $q, $stateParams, $timeout, $window, $rootScope, $scope, $http, config, $rootScope, $localStorage, $state) {
    $scope.form = {}
    $scope.comment2 = {}
    $scope.listMonth = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    $scope.getInformation = function (id) {
        BlogSvc.getById(id).then(function (res) {

            if (res.data.ErrorCode == 0) {
                $scope.form = res.data.Data
                $scope.Content = $scope.form.Content
                $scope.form.CreatedDate = $scope.reformatDate($scope.form.CreatedDate);

            }
        }).catch((e) => {
            toastr.error('Harap Refresh Kembali')
        });

    }
    $scope.getInformations = function () {
        BlogSvc.get($scope.form).then(function (res) {

            if (res.data.ErrorCode == 0) {
                console.log(res.data.Data);
                $scope.newpost = res.data.Data
                for (var i = 0; i < $scope.newpost.length; i++) {
                    $scope.newpost[i].CreatedDate = $scope.reformatDate($scope.newpost[i].CreatedDate);

                }

                // var newpost = res.data.Data
                // $scope.newpost = {}
                // for (var i = 0; i < newpost.length; i++) {
                //     newpost[i].CreatedDate = $scope.reformatDate(newpost[i].CreatedDate);
                //     if (newpost[i].Id !== $stateParams.Id) {
                //         $scope.newpost.push(newpost[i])
                //     }
                // }
            }
        }).catch((e) => {
            toastr.error('Harap Refresh Kembali')
        });

    }
    $scope.getInformations();
    $scope.createComments = function () {
        $scope.comment2.InformationId = $stateParams.id
        console.log($scope.comment2)
        BlogSvc.createComments($scope.comment2).then(function (res) {

            if (res.data.ErrorCode == 0) {
                alert('Komentar berhasil dibuat, akan tampil ketika sudah disetujui oleh admin')
                // toastr.success('Komentar berhasil dibuat, akan tampil ketika sudah disetujui oleh admin')
                $scope.comment2 = {}
            } else {
                // toastr.error('Komentar gagal dibuat')
                alert('Komentar gagal dibuat')
            }
        }).catch((e) => {
            // toastr.error('Komentar gagal dibuat')
            alert('Komentar gagal dibuat')
        });
    }
    $scope.getComments = function (id) {
        BlogSvc.getComments(id).then(function (res) {

            if (res.data.ErrorCode == 0) {
                $scope.comments = res.data.Data
            }
        }).catch((e) => {
            // toastr.error('Komentar gagal dibuat')
            // alert('Komentar gagal dibuat')
        });

    }

    if ($stateParams.id !== undefined) {
        $scope.getInformation($stateParams.id);
        $scope.getComments($stateParams.id)
    }

    $scope.reformatDate = function (dateStr) {
        var dArr = dateStr.split("-");  // ex input "2010-01-18"
        var month = parseInt(dArr[1])
        return dArr[2] + " " + $scope.listMonth[month - 1] + ", " + dArr[0]; //ex out: "18/01/10"
    }

    // $scope.getInformation();
    // $scope.getTags = function () {
    //     BlogSvc.getTags($scope.form).then(function (res) {

    //         if (res.data.ErrorCode == 0) {

    //             $scope.listTags = res.data.Data

    //         } 
    //     }).catch((e) => {
    //         alert('gagal ambil data')
    //     });

    // }
    // $scope.getTags();

});