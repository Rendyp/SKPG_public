  app.directive('appFooterAtas', x);
  app.directive('appFooterBawah', xx);
  /** @ngInject */
  function x() {
      return {
          restrict: 'E',
          transclude: true,
          templateUrl: 'view/components/pageBottom/bottomAtas.html',
      };
  }
  /** @ngInject */
  function xx() {
      return {
          restrict: 'E',
          transclude: true,
          templateUrl: 'view/components/pageBottom/bottomBawah.html',
      };
  }