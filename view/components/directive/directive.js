(function (e) {
    var i;
    app.directive("rangeHarga", ["$timeout", function (t) {
        return {
            restrict: "A",
            scope: {
                ngModel: "=",
                min: "=",
                max: "="
            },
            link: function (n, a, o) {
                var r = false;
                var l = n.$watch("min", function (newValue, oldValue) {
                    if (newValue !== undefined) {
                        s();
                        l();
                        u();
                    }
                });

                function u() {
                    a[0].noUiSlider.on('update', function (values, handle) {
                        t(function () {
                            n.$apply(()=>{
                                n.ngModel = values;
                            });
                        });
                    });
                }

                function s() {
                    try {
                        var min = parseInt(n.min);
                        var max = parseInt(n.max);
                        console.log(min,"ini min");
                        console.log(max);
                        noUiSlider.create(a[0], {
                            start: [min, max],
                            // snap: true,
                            connect: true,
                            step: 5000,
                            // tooltips: [true, wNumb({ decimals: 2 })],
                            range: {
                                'min': min,
                                'max': max
                            },
                            format: wNumb({})
                        });

                        function ta(e) {
                            e.toLowerCase();
                            if ("true" === e || "false" === e) {
                                return JSON.parse(e)
                            }
                            return e
                        }
                    } catch (e) {

                    }
                }
            }
        }
    }]);

    app.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);
    app.directive('loading', function ($http, $timeout, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                scope.firstState = true;
                scope.isLoading = function () {
                    if ($http.pendingRequests.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                };

                scope.$watch(scope.isLoading, function (v) {
                    if (scope.firstState) {
                        if (v) {
                            elm.show();
                        } else {
                            $timeout(function () {
                                elm.hide();
                                scope.firstState = false;
                            }, 500);
                        }
                    }
                });
            }
        };

    });
    app.filter('trustAsResourceUrl', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsResourceUrl(val);
        };
    }]);
    app.directive('fallback', function () {
        var fallback = {
            link: function postLink(scope, iElement, iAttrs) {
                iElement.bind('load', function () {
                    angular
                        .element(this)
                        .css("background-image", "none");

                    console.log("loading");
                });
                iElement.bind('error', function () {
                    console.log("error");
                    angular.element(this).attr("src", iAttrs.fallback);
                    angular
                        .element(this)
                        .css("background-image", "none");
                });

            }
        }
        return fallback;
    });

    app.filter('rupiah', function () {
        return function (val) {
            if (val == null) {
                return null;
            } else {
                while (/(\d+)(\d{3})/.test(val.toString())) {
                    val = val.toString().replace(/(\d+)(\d{3})/, '$1' + '.' + '$2');
                }
                var val = 'Rp' + val;
                return val;
            }
        };
    });
    app.filter('ceil', function () {
        return function (input) {
            return Math.ceil(input);
        };
    });
    app.filter('addOneHours', function () {
        return function (input) {
            var x = input.split(':');
            var date = new Date();
            date.setHours(parseInt(x[0]) + 1);
            date.setMinutes(00);
            date.setSeconds(00);
            return date;
        };
    });
    app.filter('setTime', function () {
        return function (input) {
            var x = Date.parse(input);
            var xx = Date.now();
            var date = x - xx;
            return date;
        };
    });
    app.filter('range', function () {
        return function (input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++)
                input.push(i);
            return input;
        };
    });

    // -------------------------------------------------- //
    // -------------------------------------------------- //
    // I lazily load the images, when they come into view.
    app.directive(
        "bnLazySrc",
        function ($window, $document) {
            var lazyLoader = (function () {
                var images = [];
                var renderTimer = null;
                var renderDelay = 100;
                var win = $($window);
                var doc = $document;
                var documentHeight = doc.height();
                var documentTimer = null;
                var documentDelay = 2000;
                var isWatchingWindow = false;

                function addImage(image) {
                    images.push(image);
                    if (!renderTimer) {
                        startRenderTimer();
                    }
                    if (!isWatchingWindow) {
                        startWatchingWindow();
                    }
                }

                function removeImage(image) {
                    for (var i = 0; i < images.length; i++) {
                        if (images[i] === image) {
                            images.splice(i, 1);
                            break;
                        }
                    }
                    if (!images.length) {
                        clearRenderTimer();
                        stopWatchingWindow();
                    }
                }

                function checkDocumentHeight() {
                    if (renderTimer) {
                        return;
                    }
                    var currentDocumentHeight = doc.height();
                    if (currentDocumentHeight === documentHeight) {
                        return;
                    }
                    documentHeight = currentDocumentHeight;
                    startRenderTimer();
                }

                function checkImages() {
                    console.log("Checking for visible images...");
                    var visible = [];
                    var hidden = [];
                    var windowHeight = win.height();
                    var scrollTop = win.scrollTop();
                    var topFoldOffset = scrollTop;
                    var bottomFoldOffset = (topFoldOffset + windowHeight);
                    for (var i = 0; i < images.length; i++) {
                        var image = images[i];
                        if (image.isVisible(topFoldOffset, bottomFoldOffset)) {
                            visible.push(image);
                        } else {
                            hidden.push(image);
                        }
                    }
                    for (var i = 0; i < visible.length; i++) {
                        visible[i].render();
                    }
                    images = hidden;
                    clearRenderTimer();
                    if (!images.length) {
                        stopWatchingWindow();
                    }
                }

                function clearRenderTimer() {
                    console.log("clearRenderTimer");
                    clearTimeout(renderTimer);
                    renderTimer = null;
                }

                function startRenderTimer() {
                    console.log("start render");

                    renderTimer = setTimeout(checkImages, renderDelay);
                }

                function startWatchingWindow() {
                    console.log("start watching");

                    isWatchingWindow = true;
                    win.on("resize.bnLazySrc", windowChanged);
                    win.on("scroll.bnLazySrc", windowChanged);
                    documentTimer = setInterval(checkDocumentHeight, documentDelay);
                }

                function stopWatchingWindow() {
                    isWatchingWindow = false;
                    win.off("resize.bnLazySrc");
                    win.off("scroll.bnLazySrc");
                    clearInterval(documentTimer);

                }

                function windowChanged() {
                    if (!renderTimer) {
                        startRenderTimer();
                    }
                }
                return ({
                    addImage: addImage,
                    removeImage: removeImage
                });
            })();
            // ------------------------------------------ //
            // I represent a single lazy-load image.
            function LazyImage(element) {
                var source = null;
                var isRendered = false;
                var height = null;

                function isVisible(topFoldOffset, bottomFoldOffset) {
                    if (!element.is(":visible")) {
                        return (false);
                    }
                    if (height === null) {
                        height = element.height();
                    }
                    var top = element.offset().top;
                    var bottom = (top + height);
                    return (
                        (
                            (top <= bottomFoldOffset) &&
                            (top >= topFoldOffset)
                        ) ||
                        (
                            (bottom <= bottomFoldOffset) &&
                            (bottom >= topFoldOffset)
                        ) ||
                        (
                            (top <= topFoldOffset) &&
                            (bottom >= bottomFoldOffset)
                        )
                    );
                }

                function render() {
                    isRendered = true;
                    renderSource();
                }

                function setSource(newSource) {
                    source = newSource;
                    if (isRendered) {
                        renderSource();
                    }
                }

                function renderSource() {
                    element[0].src = source;
                    setTimeout(function () {
                        element[0].style = "background-image:url('undefined')";
                    }, 1000);
                    // console.log(element[0]);

                }
                return ({
                    isVisible: isVisible,
                    render: render,
                    setSource: setSource
                });
            }
            // ------------------------------------------ //
            // I bind the UI events to the scope.
            function link($scope, element, attributes) {

                var lazyImage = new LazyImage(element);
                lazyLoader.addImage(lazyImage);
                attributes.$observe(
                    "bnLazySrc",
                    function (newSource) {
                        lazyImage.setSource(newSource);
                    }
                );
                $scope.$on(
                    "$destroy",
                    function () {
                        lazyLoader.removeImage(lazyImage);
                    }
                );
            }
            return ({
                link: link,
                restrict: "A"
            });
        }
    );
})();