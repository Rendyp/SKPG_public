  app.controller('sliderCtrl', function($scope, $http, config, $timeout) {
      var vm = this;
      vm.default = [{
          url: config.url + "global_banner/slide-1.png"
      }, {
          url: config.url + "global_banner/slide-2.png"
      }, {
          url: config.url + "global_banner/slide-3.png"
      }];
      //   vm.getData = function() {
      //       var signature = config.api_v+"/banner";
      //       $http.get(config.api + signature, config.headers(getSignature(signature))).then(function(res) {
      //           if (res.data.status) {
      //               vm.slider = res.data.data;
      //           } else {
      //               // console.log(res.data.msg);
      //           }
      //           // console.log(res.data);
      //       });
      //   }
  });
  app.directive('sisewSlider', xxx);
  /** @ngInject */
  function xxx() {
      return {
          restrict: 'E',
          transclude: true,
          templateUrl: 'view/components/slider/slider.html',
          controllerAs: '$Slider',
          controller: 'sliderCtrl',
          link: function($scope, $element, $attrs, slider) {
              //   slider.getData();
          }
      };
  }