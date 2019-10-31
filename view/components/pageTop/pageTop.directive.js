  app.directive('appPageTop', x);
  /** @ngInject */
  function x() {
      return {
          restrict: 'E',
          transclude: true,
          templateUrl: 'view/components/pageTop/pageTop.html',
      };
  }
