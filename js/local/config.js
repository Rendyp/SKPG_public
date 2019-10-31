app.service("config", function($location, $localStorage, $state) {
    this.url = "http://153.92.4.174/nbm/api/";
    this.api = "http://jhimaster.com/nbm/api/";
    this.apiSKPG = "http://pi-dev.co.id/skpg/api/";
    this.assetReport = this.url + "reports/";
    this.assetMember = this.url + "members/profile/";
    this.new = "http://localhost:3000/api/";
    this.pageIsNotLogin = ()=>{
        if($localStorage.token){
            $state.go("app.index");
        }
    }
    this.pageIsLogin = () => {
        if (!$localStorage.token) {
            alert('Anda Harus Login')
            $state.go("app.index");
        }
    }
});

app.config(function (toastrConfig) {
    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass: 'toast-top-right',
        preventDuplicates: false,
        preventOpenDuplicates: false,
        target: 'body'
    });
});