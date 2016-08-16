var myApp = angular.module('sepaApp', ['angular.filter', 'ngStorage', 'localytics.directives']);
var TAM_PAG = 50;
myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['x-api-key'] = API_KEY;
}
]);
myApp.controller('SepaController', ['$scope', '$localStorage', '$http', 'APIServices', function($scope, $localStorage, $http, api, localStorageService) {
    $scope.init = function() {
        var location = getInitialLocation();
        $scope.localizacion = {
            lat: location.lat || -34.571076,
            lng: location.lng || -58.4458738
        };
        $scope.spinner = false;
        $scope.localizado = false;
        $scope.falloEnAPI = false;
        $scope.fecha = (new Date()).getDate() + '/' + ((new Date()).getMonth() + 1) + '/' + ((new Date()).getYear() - 100);
        $scope.pagina = []
        $scope.paginaActual = 0;
        $scope.totalPaginas = 2;
        $scope.lista = $localStorage.lista || [];
        $scope.$watch('lista', function() {
            $localStorage.lista = $scope.lista;
        });
        $scope.sucursales = [];
        $scope.sucursalesSeleccionadas = [];
        $scope.sucursalFiltro = null ;
        $scope.comparativa = [];
        $scope.productosEnComparativa = [];
        $scope.preciosEnComparativa = [];
        $scope.detalleProducto = null ;
        $scope.detalleSucursales = [];
        $scope.ordenamiento = '-cant_sucursales_disponible';
        $scope.ordenamientosDisponiblesComparativa = [{
            descripcion: 'Comercios más cercanos',
            value: null
        }, {
            descripcion: 'Menor precio',
            value: '+Suma_precio_lista_disponible'
        }];
        $scope.ordenamientoComparativa = null ;
        $scope.ordenamientoDetalle = '+distancia';
        $localStorage.cachedAt = {};
        $scope.loaded = false;
    }
    ;
    $scope.init();
    $scope.getPaginas = function(pagina, total) {
        var paginas = [];
        for (var i = pagina - 2; i <= pagina + 5 && paginas.length < 5; i++) {
            if (i > 0 && i <= total) {
                paginas.push(i);
            }
        }
        return paginas;
    }
    ;
    $scope.cambiarPagina = function(pagina) {
        $scope.spinner = true;
        cambiarPagina(pagina);
    }
    ;
    $scope.cambiarOrdenamiento = function(ordenamiento) {
        $scope.spinner = true;
        var orden = $scope.ordenamiento ? $scope.ordenamiento.charAt(0) : '-';
        var ordenamientoAnterior = $scope.ordenamiento ? $scope.ordenamiento.substr(1) : '';
        orden = (ordenamiento == ordenamientoAnterior && orden == '+') ? '-' : '+';
        $scope.ordenamiento = orden + ordenamiento;
        cambiarPagina($scope.paginaActual);
    }
    ;
    $scope.cambiarOrdenamientoEnDetalle = function(ordenamiento) {
        $scope.ordenamientoDetalle = $scope.ordenamientoDetalle == '+' + ordenamiento ? '-' + ordenamiento : '+' + ordenamiento;
    }
    $scope.filtrarPorCategoria = function(categoria) {
        $scope.spinner = true;
        $scope.categorias.forEach(function(c) {
            c.seleccionada = false;
        });
        $scope.categoriaSeleccionada = categoria;
        categoria.seleccionada = true;
        cambiarPagina(1);
    }
    ;
    $scope.filtrarPorQuery = function() {
        trackSearchActive();
        $scope.spinner = true;
        cambiarPagina(1);
    }
    $scope.agregarProducto = function(producto) {
        track('Buscar productos', 'Agregar producto', producto.nombre);
        producto.enLista = true;
        $scope.lista.push(producto);
        $scope.pagina.filter(function(p) {
            return p.id == producto.id
        })[0].enLista = true;
    }
    ;
    $scope.quitarProducto = function(producto) {
        track('Buscar productos', 'Quitar producto', producto.id);
        producto.enLista = false;
        productoEnPagina = $scope.pagina.filter(function(p) {
            return p.id == producto.id;
        });
        if (productoEnPagina.length > 0) {
            productoEnPagina[0].enLista = false;
        }
        _.remove($scope.lista, function(p) {
            return p.id == producto.id;
        });
        _.remove($scope.productosEnComparativa, function(p) {
            return p.id == producto.id;
        });
        _.remove($scope.preciosEnComparativa, function(precio) {
            return precio.productoId == producto.id;
        });
        if ($scope.lista.length == 0) {
            $scope.comparativa = [];
            $scope.productosEnComparativa = [];
            $scope.preciosEnComparativa = [];
        }
    }
    ;
    $scope.vaciarLista = function() {
        $scope.lista = [];
        angular.forEach($scope.pagina, function(producto) {
            producto.enLista = false;
        });
        $scope.comparativa = [];
        $scope.productosEnComparativa = [];
        $scope.preciosEnComparativa = [];
    }
    ;
    $scope.comparar = function(fromSelectChange, force) {
        var productoIds = $scope.lista.map(function(producto) {
            return producto.id;
        });
        var sucursalIds;
        if (!fromSelectChange) {
            if ($scope.ordenamientoComparativa == null ) {
                $scope.sucursales = _.sortBy($scope.sucursales, function(s) {
                    return s.distanciaNumero;
                });
            }
            sucursalIds = $scope.sucursales.map(function(sucursal) {
                return sucursal.id;
            });
        } else {
            sucursalIds = $scope.sucursalesSeleccionadas.map(function(sucursal) {
                return sucursal.id;
            });
        }
        if (fromSelectChange) {
            track('Buscar productos', 'Cambiar comercio', sucursalIds);
        }
        var parametrosComparativa = {
            productos: productoIds,
            sucursales: sucursalIds
        };
        if (!force && angular.equals(parametrosComparativa, $scope.parametrosComparativaPrevia)) {
            return;
        }
        $scope.parametrosComparativaPrevia = parametrosComparativa;
        $scope.spinner = true;
        comparativa = compararProductos(productoIds, sucursalIds, $scope.ordenamientoComparativa, function(comparativa) {
            var idsSucursalesOrdenadas = comparativa.sucursales.slice(0, 4).map(function(s) {
                return s.id;
            });
            if (fromSelectChange) {
                idsSucursalesOrdenadas = sucursalIds;
            }
            idsSucursalesOrdenadas.forEach(function(element, index) {
                $scope.sucursalesSeleccionadas[index] = _.find($scope.sucursales, function(s) {
                    return s.id == element;
                });
            });
            var productos = [];
            a = [].concat.apply([], comparativa.sucursales.map(function(o) {
                return o.productos.map(function(p) {
                    return {
                        id: p.id,
                        marca: p.marca,
                        nombre: p.nombre,
                        presentacion: p.presentacion,
                        precios: []
                    };
                })
            }));
            a.forEach(function(element) {
                if (productos.filter(function(e) {
                    return e.id == element.id;
                }).length == 0)
                    productos.push(element);
            });
            var todosLosPrecios = [].concat.apply([], comparativa.sucursales.slice(0, 4).map(function(s) {
                return s.productos.map(function(p) {
                    return {
                        sucursalId: s.id,
                        productoId: p.id,
                        precioLista: p.precioLista,
                        seleccionado: true,
                        promo1: p.promo1,
                        promo2: p.promo2,
                        referencia: p.referencia
                    };
                })
            }));
            productos.forEach(function(producto) {
                var preciosDelProducto = todosLosPrecios.filter(function(precio) {
                    return precio.productoId == producto.id && precio.precioLista > 0
                });
                if (preciosDelProducto.length == _.uniqBy($scope.sucursalesSeleccionadas, 'id').length) {
                    producto.comparar = true;
                    _.find($scope.lista, function(pr) {
                        return pr.id == producto.id;
                    }).comparar = true;
                    preciosDelProducto.forEach(function(precio) {
                        precio.comparar = true;
                    });
                }
            });
            $scope.comparativa = comparativa;
            $scope.productosEnComparativa = productos;
            $scope.preciosEnComparativa = todosLosPrecios;
            $scope.spinner = false;
        });
    }
    ;
    $scope.seleccionarPrecio = function(precio, seleccion) {
        precio.seleccionado = false;
        precio.promo1.seleccionado = false;
        precio.promo2.seleccionado = false;
        seleccion.seleccionado = true;
    }
    $scope.esElMenorPrecio = function(sucursalId) {
        if ($scope.sucursalesSeleccionadas == undefined)
            return false;
        var preciosTotales = [];
        $scope.sucursalesSeleccionadas.forEach(function(s) {
            preciosTotales.push($scope.getTotalPorSucursal(s.id))
        });
        return $scope.getTotalPorSucursal(sucursalId) != 0 && _.min(preciosTotales) == $scope.getTotalPorSucursal(sucursalId);
    }
    $scope.getTotalPorSucursal = function(sucursalId) {
        precios = $scope.preciosEnComparativa.filter(function(precio) {
            return precio.sucursalId == sucursalId
        });
        selecciones = precios.map(function(p) {
            if (!p.comparar)
                return 0;
            if (p != undefined && p.seleccionado)
                return p.precioLista;
            if (p.promo1 != undefined && p.promo1.seleccionado)
                return p.promo1.precio;
            if (p.promo2 != undefined && p.promo2.seleccionado)
                return p.promo2.precio;
            return 0;
        });
        if (selecciones.length == 0)
            return 0;
        return selecciones.reduce(function(a, b) {
            return a + b
        });
    }
    ;
    $scope.getTotalGeneralPorSucursal = function(sucursalId) {
        precios = $scope.preciosEnComparativa.filter(function(precio) {
            return precio.sucursalId == sucursalId
        });
        selecciones = precios.map(function(p) {
            if (p != undefined && p.seleccionado && p.precioLista != undefined)
                return p.precioLista;
            if (p.promo1 != undefined && p.promo1.seleccionado && p.promo1.precio != undefined)
                return p.promo1.precio;
            if (p.promo2 != undefined && p.promo2.seleccionado && p.promo2.precio != undefined)
                return p.promo2.precio;
            return 0;
        });
        if (selecciones.length == 0)
            return 0;
        return selecciones.reduce(function(a, b) {
            return a + b
        });
    }
    ;
    $scope.getPrecio = function(productoId, sucursalId) {
        a = $scope.preciosEnComparativa.filter(function(precio) {
            return precio.productoId == productoId && precio.sucursalId == sucursalId
        })[0]
        if (a != undefined && a.precioLista != undefined)
            return a;
        return {
            precioLista: 0
        };
    }
    ;
    $scope.totalProductosComparados = function() {
        return $scope.productosEnComparativa.filter(function(p) {
            return p.comparar;
        }).length;
    }
    ;
    $scope.esElMasBaratoPara = function(precio, productoId) {
        var producto = $scope.productosEnComparativa.filter(function(pr) {
            return pr.id == productoId;
        })[0];
        if (producto == undefined)
            return false;
        miMejor = masBaratoEnPrecio(precio);
        precios = $scope.preciosEnComparativa.filter(function(precio) {
            return precio.productoId == productoId
        }).map(function(p) {
            return masBaratoEnPrecio(p)
        });
        masBajo = _.min(precios);
        if (masBajo == Number.MAX_SAFE_INTEGER)
            return false;
        return precio.masBarato = masBajo == miMejor;
    }
    ;
    $scope.masBaratosPorSucursal = function(sucursalId) {
        return $scope.preciosEnComparativa.filter(function(precio) {
            return precio.sucursalId == sucursalId && precio.masBarato;
        }).length;
    }
    $scope.totalProductosPorSucursal = function(sucursalId) {
        return $scope.preciosEnComparativa.filter(function(precio) {
            return precio.sucursalId == sucursalId && precio.precioLista != undefined;
        }).length;
    }
    $scope.verDetalleProducto = function(producto) {
        track('Buscar productos', 'Detalle producto', producto.id + ' - ' + producto.nombre);
        $scope.spinner = true;
        return api.detalleProducto($scope.sucursales.map(function(s) {
            return s.id;
        }), producto.id).success(function(response) {
            siResultadoExitoso(response, function(response) {
                $scope.detalleProducto = response.producto;
                $scope.detalleProducto.enLista = $scope.lista.map(function(p) {
                    return p.id;
                }).indexOf($scope.detalleProducto.id) >= 0;
                $scope.detalleSucursales = response.sucursales;
                var sucursalMasBarata = null ;
                $scope.detalleSucursales.forEach(function(sucursal) {
                    if (sucursal.preciosProducto && (!sucursalMasBarata || sucursal.preciosProducto.precioLista < sucursalMasBarata.preciosProducto.precioLista)) {
                        sucursalMasBarata = sucursal;
                    }
                    var sucursalDeReferencia = _.find($scope.sucursales, function(s) {
                        return s.id == sucursal.comercioId + '-' + sucursal.banderaId + '-' + sucursal.id;
                    });
                    sucursal.banderaDescripcion = sucursalDeReferencia.banderaDescripcion;
                    sucursal.direccion = sucursalDeReferencia.direccion;
                    sucursal.localidad = sucursalDeReferencia.localidad;
                    sucursal.distanciaDescripcion = sucursalDeReferencia.distanciaDescripcion;
                    sucursal.distancia = parseFloat(sucursal.distanciaDescripcion);
                });
                $scope.detalleSucursales.filter(function(s) {
                    return s.preciosProducto && s.preciosProducto.precioLista == sucursalMasBarata.preciosProducto.precioLista;
                }).forEach(function(s) {
                    s.masBarata = true;
                });
                $scope.spinner = false;
            });
        }).error(handleError);
    }
    ;
    function agregarProductosPorParametro(lista) {
        if (lista.length > 0)
            $scope.lista = [];
        lista.forEach(function(productoId, idx, array) {
            api.detalleProducto($scope.sucursales.map(function(s) {
                return s.id;
            }), parseInt(productoId)).success(function(response) {
                siResultadoExitoso(response, function(response) {
                    $scope.lista.push(response.producto);
                    if (array.length - 1 === idx) {
                        $scope.comparar();
                        mostrarComparativa();
                    }
                });
            }).error(function(error) {
                $scope.falloEnAPI = true;
            });
        });
    }
    $scope.cambiarUbicacion = function(lat, lng) {
        $scope.localizacion.lat = lat;
        $scope.localizacion.lng = lng;
        $scope.localizado = true;
        nuevaUbicacion();
    }
    ;
    $scope.refrescarSucursales = function() {
        $scope.spinner = true;
        cargarSucursales(true);
    }
    ;
    $scope.sucursalSeleccionada = function(sucursal, idx) {
        if (sucursal == undefined)
            return false;
        return !_.includes($scope.sucursalesSeleccionadas.map(function(s, index) {
            return index == idx ? '0' : s.id
        }), sucursal.id);
    }
    function handleError(error) {
        if (error.errorType) {
            track('Error', 'API', error.errorType, error);
        } else {
            track('Error', 'API', 'Generico', error);
        }
        if (error.errorType == 'InvalidCoordinates') {
            $scope.init();
            return;
        }
        $scope.falloEnAPI = true;
        $scope.spinner = false;
    }
    function siResultadoExitoso(response, callback) {
        if (response.status == 200) {
            callback(response);
        } else {
            handleError(response);
        }
    }
    function cacheValido(clave) {
        return $localStorage.cachedAt[clave] > Date.now() - 1000 * 60 * 60 * 1;
    }
    function marcarCache(clave) {
        $localStorage.cachedAt[clave] = Date.now();
    }
    function cargarFiltros() {
        if ($localStorage.tiposSucursal && cacheValido('tiposSucursal')) {
            $scope.tiposSucursal = $localStorage.tiposSucursal;
        } else {
            api.getTiposSucursal().success(function(response) {
                siResultadoExitoso(response, function(response) {
                    $scope.tiposSucursal = response.valoresFiltrables;
                    $localStorage.tiposSucursal = $scope.tiposSucursal;
                    marcarCache('tiposSucursal');
                })
            });
        }
        if ($localStorage.banderasComercio && cacheValido('banderasComercio')) {
            $scope.banderasComercio = $localStorage.banderasComercio;
        } else {
            api.getBanderasComercio().success(function(response) {
                siResultadoExitoso(response, function(response) {
                    $scope.banderasComercio = response.valoresFiltrables;
                    $localStorage.banderasComercio = $scope.banderasComercio;
                    marcarCache('banderasComercio');
                })
            });
        }
        if ($localStorage.razonesSocialesComercio && cacheValido('razonesSocialesComercio')) {
            $scope.razonesSocialesComercio = $localStorage.razonesSocialesComercio;
        } else {
            api.getRazonesSocialesComercio().success(function(response) {
                siResultadoExitoso(response, function(response) {
                    $scope.razonesSocialesComercio = response.valoresFiltrables;
                    $localStorage.razonesSocialesComercio = $scope.razonesSocialesComercio;
                    marcarCache('razonesSocialesComercio');
                })
            });
        }
        setTimeout(function() {
            var b = {
                "Hipermercado": {
                    "Supermercados Becerra": ["Miguel Becerra S.A."],
                    "COTO CICSA": ["Coto Centro Integral de Comercializaci\u00f3n S.A."],
                    "Hipermercado Libertad": ["Libertad S.A"],
                    "La Gallega": ["La Gallega Supermercados S.A."],
                    "Super Aiello": ["Aiello Supermercados S.A."],
                    "Changomas": ["Wal Mart Argentina S.R.L."],
                    "Vea": ["Jumbo Retail Argentina S.A."],
                    "Millan S.A": ["Millan S.A."],
                    "Cooperativa Obrera Limitada de Consumo y Vivienda": ["Cooperativa Obrera Limitada de Consumo y Vivienda"],
                    "LA AGRICOLA REGIONAL COOPERATIVA LIMITADA": ["La Agricola Regional Cooperativa Limitada"],
                    "California Supermercados": ["California S.A."],
                    "LA ANONIMA": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Supermercados Cordiez": ["Cyre S.A."],
                    "Toledo": ["Supermercados Toledo S.A."],
                    "Jumbo": ["Jumbo Retail Argentina S.A."],
                    "TOPSY": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Walmart SuperCenter": ["Wal Mart Argentina S.R.L."],
                    "Supermercados Comodin": ["Alberdi S.A."],
                    "Hipermercado Carrefour": ["INC S.A."],
                    "Super MAMI": ["Dinosaurio S.A."]
                },
                "Supermercado": {
                    "COTO CICSA": ["Coto Centro Integral de Comercializaci\u00f3n S.A."],
                    "La Gallega": ["La Gallega Supermercados S.A."],
                    "Changomas": ["Wal Mart Argentina S.R.L."],
                    "Toledo": ["Supermercados Toledo S.A."],
                    "Supermercados Cordiez": ["Cyre S.A."],
                    "Vea": ["Jumbo Retail Argentina S.A."],
                    "TOPSY": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Supermercados Comodin": ["Alberdi S.A."],
                    "Mi Changomas": ["Wal Mart Argentina S.R.L."],
                    "Cooperativa Obrera Limitada de Consumo y Vivienda": ["Cooperativa Obrera Limitada de Consumo y Vivienda"],
                    "LA AGRICOLA REGIONAL COOPERATIVA LIMITADA": ["La Agricola Regional Cooperativa Limitada"],
                    "Walmart Supermercado": ["Wal Mart Argentina S.R.L."],
                    "Supermercados DIA": ["DIA Argentina S.A"],
                    "Supermercados Becerra": ["Miguel Becerra S.A."],
                    "BOMBA": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Disco": ["Jumbo Retail Argentina S.A."],
                    "Abastecimiento Mercamax": ["Cyre S.A."],
                    "Jumbo": ["Jumbo Retail Argentina S.A."],
                    "Super Aiello": ["Aiello Supermercados S.A."],
                    "Millan S.A": ["Millan S.A."],
                    "LA ANONIMA": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Market": ["INC S.A."]
                },
                "Autoservicio": {
                    "Supermercados Becerra": ["Miguel Becerra S.A."],
                    "ESTACION LIMA S.A.": ["Estaci\u00f3n Lima S.A."],
                    "TOPSY": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Mini Libertad": ["Libertad S.A"],
                    "Changomas Express": ["Wal Mart Argentina S.R.L."],
                    "DEHEZA S.A.I.C.F. e I.": ["Deheza S.A.I.C.F. e I."],
                    "Express": ["INC S.A."],
                    "Millan S.A": ["Millan S.A."],
                    "LA ANONIMA": ["S.A. Importadora y Exportadora de la Patagonia"],
                    "Supermercados DIA": ["DIA Argentina S.A"],
                    "Cooperativa Obrera Limitada de Consumo y Vivienda": ["Cooperativa Obrera Limitada de Consumo y Vivienda"],
                    "Toledo": ["Supermercados Toledo S.A."],
                    "Supermercados Comodin": ["Alberdi S.A."]
                },
                "Tradicional": {
                    "Millan S.A": ["Millan S.A."]
                }
            };
            $scope.filtrables = new Array();
            for (var i = 0; i < $scope.tiposSucursal.length; i++) {
                $scope.filtrables[i] = new Array();
                for (var j = 0; j < $scope.banderasComercio.length; j++) {
                    $scope.filtrables[i][j] = new Array();
                    for (var k = 0; k < $scope.razonesSocialesComercio.length; k++) {
                        $scope.filtrables[i][j][k] = _.indexOf(b[$scope.tiposSucursal[i]][$scope.banderasComercio[j]], $scope.razonesSocialesComercio[k]) >= 0;
                    }
                }
            }
        }, 5000);
    }
    function buscarEnFiltros(posibles, tipoSucursal, banderaComercio, razonSocialComercio, retornar) {
        var i = _.indexOf($scope.tiposSucursal, tipoSucursal);
        var j = _.indexOf($scope.banderasComercio, banderaComercio);
        var k = _.indexOf($scope.razonesSocialesComercio, razonSocialComercio);
        var valoresEnI = i < 0 ? _.times($scope.tiposSucursal.length, function(n) {
            return n;
        }) : [i];
        var valoresEnJ = j < 0 ? _.times($scope.banderasComercio.length, function(n) {
            return n;
        }) : [j];
        var valoresEnK = k < 0 ? _.times($scope.razonesSocialesComercio.length, function(n) {
            return n;
        }) : [k];
        var resultado = [];
        valoresEnI.forEach(function(valI) {
            valoresEnJ.forEach(function(valJ) {
                valoresEnK.forEach(function(valK) {
                    if (posibles[valI][valJ][valK]) {
                        if (retornar == 0) {
                            resultado.push($scope.tiposSucursal[valI]);
                        }
                        if (retornar == 1) {
                            resultado.push($scope.banderasComercio[valJ]);
                        }
                        if (retornar == 2) {
                            resultado.push($scope.razonesSocialesComercio[valK]);
                        }
                    }
                })
            })
        });
        return _.uniq(resultado);
    }
    function cargarSucursales(forzarRefrescoDePagina, callback) {
        var filtros = {};
        $scope.tiposSucursal = $localStorage.tiposSucursal;
        $scope.banderasComercio = $localStorage.banderasComercio;
        $scope.razonesSocialesComercio = $localStorage.razonesSocialesComercio;
        if ($scope.filtroTipoComercio) {
            track('Busqueda', 'Buscar productos', 'Filtro', 'Tipo');
            filtros['sucursal_tipo'] = $scope.filtroTipoComercio;
        }
        if ($scope.filtroBanderaComercio) {
            track('Busqueda', 'Buscar productos', 'Filtro', 'Bandera');
            filtros['comercio_bandera_nombre'] = $scope.filtroBanderaComercio;
        }
        if ($scope.filtroRazonSocialComercio) {
            track('Busqueda', 'Buscar productos', 'Filtro', 'Razon social');
            filtros['comercio_razon_social'] = $scope.filtroRazonSocialComercio;
        }
        if ($scope.filtroTipoComercio || $scope.filtroBanderaComercio || $scope.filtroRazonSocialComercio) {
            if ($scope.filtroTipoComercio && $scope.filtroBanderaComercio) {
                btiposSucursal = buscarEnFiltros($scope.filtrables, null , $scope.filtroBanderaComercio, null , 0);
                bbanderasComercio = buscarEnFiltros($scope.filtrables, $scope.filtroTipoComercio, null , null , 1);
                $scope.tiposSucursal = btiposSucursal;
                $scope.banderasComercio = bbanderasComercio;
            }
            if ($scope.filtroTipoComercio && !$scope.filtroBanderaComercio) {
                bbanderasComercio = buscarEnFiltros($scope.filtrables, $scope.filtroTipoComercio, null , null , 1);
                $scope.banderasComercio = bbanderasComercio;
            }
            if (!$scope.filtroTipoComercio && $scope.filtroBanderaComercio) {
                btiposSucursal = buscarEnFiltros($scope.filtrables, null , $scope.filtroBanderaComercio, null , 0);
                $scope.tiposSucursal = btiposSucursal;
            }
        }
        api.getSucursales($scope.localizacion.lat, $scope.localizacion.lng, 30, filtros).success(function(response) {
            siResultadoExitoso(response, function(response) {
                $scope.sucursales = response.sucursales;
                $scope.sucursalesSeleccionadas = $scope.sucursales.slice(0, 4);
                if (callback != undefined)
                    callback();
                if (forzarRefrescoDePagina) {
                    cambiarPagina(1);
                    cargarProducto();
                }
                if ($scope.lista.length > 0) {
                    $scope.comparar();
                }
                $scope.spinner = false;
            });
        }).error(handleError);
    }
    function cargarProducto() {
        if ($scope.detalleProducto) {
            $scope.verDetalleProducto($scope.detalleProducto);
        }
    }
    function cargarCategorias() {
        if ($localStorage.categorias && cacheValido('categoriasPrimerNivel')) {
            $scope.categoriasPrimerNivel = $localStorage.categorias;
        } else {
            api.getCategorias().success(function(response) {
                siResultadoExitoso(response, function(response) {
                    $scope.categoriasPrimerNivel = filtrarCategoriasPrimerNivel(response.categorias);
                    $localStorage.categorias = $scope.categoriasPrimerNivel;
                    marcarCache('categoriasPrimerNivel');
                    $scope.spinner = false;
                });
            }).error(handleError);
        }
    }
    function filtrarCategoriasPrimerNivel(todas) {
        var permitidas = ['001', '002', '003', '004', '005', '010', '011', '012', '013', '014', '015', '016', '017', '018'];
        return todas.filter(function(categoria) {
            return permitidas.indexOf(categoria.id) >= 0 && categoria.nivel == 1;
        });
    }
    function marcarLista(productos) {
        productos.forEach(function(producto) {
            producto.enLista = $scope.lista.map(function(e) {
                return e.id;
            }).indexOf(producto.id) >= 0;
        });
        return productos;
    }
    function cambiarPagina(pagina) {
        if ($scope.sucursalFiltro && ($scope.ordenamiento == '-cant_sucursales_disponible' || $scope.ordenamiento == '+cant_sucursales_disponible')) {
            $scope.cambiarOrdenamiento('descripcion');
        }
        if ($scope.sucursalFiltro && ($scope.ordenamiento == '-precio_min' || $scope.ordenamiento == '+precio_min')) {
            $scope.ordenamiento = '+descripcion';
        }
        if (!$scope.sucursalFiltro && ($scope.ordenamiento == '-precio_lista' || $scope.ordenamiento == '+precio_lista')) {
            $scope.ordenamiento = '+descripcion';
        }
        if ((pagina <= 0 || pagina >= $scope.totalPaginas) && pagina != 1) {
            $scope.spinner = false;
            return;
        }
        api.getPaginaDeProductos($scope.query, $scope.categoriaSeleccionada, $scope.sucursalFiltro, $scope.sucursales, $scope.ordenamiento, pagina - 1).success(function(response) {
            siResultadoExitoso(response, function(response) {
                paginaDeProductos = response;
                $scope.pagina = marcarLista(paginaDeProductos.productos);
                $scope.paginaActual = pagina;
                $scope.totalPaginas = (paginaDeProductos.total / TAM_PAG) + 1;
                $scope.spinner = false;
                $scope.sinResultados = $scope.pagina.length == 0;
                if ($scope.sucursalFiltro) {
                    track('Busqueda', 'Buscar productos', 'Filtro', 'Comercio');
                }
                if ($scope.sinResultados) {
                    track('Buscar productos', 'Busqueda', 'Sin resultado', $scope.query);
                } else {
                    track('Buscar productos', 'Busqueda', $scope.query);
                }
                trackSearchUnactive();
            });
        }).error(handleError);
    }
    function compararProductos(productoIds, sucursalIds, ordenamiento, callback) {
        api.compararProductos(productoIds.join(','), sucursalIds.join(','), ordenamiento).success(function(response) {
            siResultadoExitoso(response, function(response) {
                callback(response);
            });
        }).error(handleError);
    }
    function nuevaUbicacion() {
        $scope.spinner = true;
        cargarFiltros();
        cargarSucursales(false, function() {
            var listaParametro = getSearchParameters().lista;
            if (listaParametro != undefined && !$scope.loaded) {
                agregarProductosPorParametro(listaParametro.split(','));
                $scope.loaded = true;
            }
        });
        cargarCategorias();
        cargarProducto();
        $scope.pagina = [];
        $scope.query = null ;
    }
    function buscarPrecioEnSucursal(precios, productoId, sucursalId) {
        return precios.filter(function(precio) {
            return precio.productoId == productoId && precio.sucursalId == sucursalId
        })[0];
    }
    function masBaratoEnPrecio(precio) {
        if (precio.precioLista == 0 || precio.precioLista == undefined)
            return Number.MAX_SAFE_INTEGER;
        if (precio.seleccionado)
            return precio.precioLista;
        if (precio.promo1.seleccionado)
            return precio.promo1.precio;
        if (precio.promo2.seleccionado)
            return precio.promo2.precio;
    }
}
]);
function getSearchParameters() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}
function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}
var myApp = angular.module('sepaApp');
myApp.filter('capitalize', function() {
    return function(str) {
        if (str == undefined)
            return '';
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
});
myApp.filter('firstWord', function() {
    return function(str) {
        return str.split(' ')[0];
    }
});
myApp.filter('currency2', function(currencyFilter) {
    return function(input) {
        var out = currencyFilter(input);
        return out ? out.replace(/,/g, ' ').replace(/\./g, ',') : '';
    }
});
myApp.filter('logoUrl', function() {
    return function(comercio) {
        if (comercio == undefined)
            return '';
        return CDN_URL + '/comercios/' + comercio.comercioId + '-' + comercio.banderaId + '.jpg';
    }
    ;
});
myApp.filter('productoUrl', function() {
    return function(productoId) {
        if (productoId == undefined)
            return '';
        return CDN_URL + '/productos/' + productoId + '.jpg';
    }
    ;
});
myApp.filter('nombreSucursal', function() {
    return function(sucursal) {
        if (sucursal == undefined)
            return '';
        return sucursal.banderaDescripcion + ' | ' + sucursal.direccion;
    }
    ;
});
myApp.filter('sucursalEnBuscarProducto', function() {
    return function(sucursal) {
        if (sucursal == undefined)
            return '';
        return sucursal.banderaDescripcion + ' | ' + sucursal.direccion + ' | ' + sucursal.localidad;
    }
    ;
});
myApp.filter('porCorreo', function() {
    return function(lista) {
        if (lista.length == 0)
            return '';
        return lista.map(function(i) {
            return i.id;
        }).join(',');
    }
    ;
});
myApp.filter('productos', function() {
    return function(cantidad) {
        if (cantidad == 1)
            return cantidad + ' producto';
        return cantidad + ' productos';
    }
});
myApp.filter('comercios', function() {
    return function(cantidad) {
        if (cantidad == 1)
            return cantidad + ' comercio';
        return cantidad + ' comercios';
    }
});
myApp.filter('ean', function() {
    return function(ean) {
        if (ean) {
            var partes = ean.split('-');
            return partes[partes.length - 1];
        } else
            return '';
    }
});
var myApp = angular.module('sepaApp');
myApp.directive('sepaEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            scope.sinResultados = false;
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.sepaEnter);
                });
                event.preventDefault();
            }
        });
    }
    ;
});
myApp.directive('tooltip', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).hover(function() {
                $(element).tooltip('show');
            }, function() {
                $(element).tooltip('hide');
            });
        }
    };
});
myApp.directive('fallbackSrc', function() {
    var fallbackSrc = {
        link: function postLink(scope, iElement, iAttrs) {
            iElement.bind('error', function() {
                angular.element(this).attr("src", iAttrs.fallbackSrc);
            });
        }
    }
    return fallbackSrc;
});
var myApp = angular.module('sepaApp');
myApp.factory('APIServices', ['$http', function($http) {
    var factory = {};
    factory.getValoresFiltrables = function(filtros) {
        return $http.get(API_URL + '/filtros?field=' + JSON.stringify(filtros))
    }
    factory.getTiposSucursal = function() {
        return $http.get(API_URL + '/filtros?field=sucursal_tipo')
    }
    ;
    factory.getBanderasComercio = function() {
        return $http.get(API_URL + '/filtros?field=comercio_bandera_nombre')
    }
    ;
    factory.getRazonesSocialesComercio = function() {
        return $http.get(API_URL + '/filtros?field=comercio_razon_social')
    }
    ;
    factory.getSucursales = function(lat, lng, limit, objetoFiltro) {
        var filtros = objetoFiltro ? ('&' + Object.keys(objetoFiltro).map(function(k) {
            return encodeURIComponent(k) + '=[%22' + encodeURIComponent(objetoFiltro[k]) + '%22]';
        }).join('&')) : '';
        return $http.get(API_URL + '/sucursales?lat=' + lat + '&lng=' + lng + '&limit=' + limit + filtros)
    }
    ;
    factory.getCategorias = function() {
        return $http.get(API_URL + '/categorias')
    }
    ;
    function sanitize(filtro) {
        return encodeURIComponent(filtro.replace(/'/g, ""));
    }
    factory.getPaginaDeProductos = function(filtro, categoria, sucursal, sucursales, ordenamiento, offset) {
        var url = API_URL + '/productos?';
        if (filtro) {
            url = url + 'string=' + sanitize(filtro) + '&';
        }
        if (categoria) {
            url = url + 'id_categoria=' + categoria.id + '&';
        }
        if (sucursal == undefined || sucursal.id == undefined) {
            url = url + '&array_sucursales=' + sucursales.map(function(sucursal) {
                return sucursal.id;
            }).join(',');
        } else {
            url = url + '&id_sucursal=' + sucursal.id;
        }
        offset = offset ? offset * TAM_PAG : 0;
        url = url + '&offset=' + offset;
        url = url + '&limit=' + TAM_PAG;
        if (ordenamiento) {
            url = url + '&sort=' + ordenamiento;
        }
        return $http.get(url);
    }
    ;
    factory.detalleProducto = function(sucursalIds, productoId) {
        return $http.get(API_URL + '/producto?limit=30&id_producto=' + productoId + '&array_sucursales=' + sucursalIds.join(','));
    }
    ;
    factory.compararProductos = function(productoIds, sucursalIds, ordenamiento) {
        var url = API_URL + '/comparativa?array_sucursales=' + sucursalIds + '&array_productos=' + productoIds;
        if (ordenamiento) {
            url += "&sort=" + ordenamiento;
        }
        return $http.get(url);
    }
    ;
    return factory;
}
]);
$(document).on("click", ".btn-buscar-productos", function() {
    $("header .botonera div").removeClass("active");
    $("header a").removeClass("active");
    $("header .botonera .btn-buscar-productos").addClass("active");
    $(".tabla2").hide();
    $(".detalle-producto").hide();
    $(".como-usar-sitio").hide();
    $(".productos-informados").hide();
    $(".terminos-y-condiciones").hide();
    $(".tabla-inicial").show();
    $(".tabla1").show();
    $("div.botonera").show();
    $(".encabezado p").css("visibility", "visible");
    window.scrollTo(0, 450);
});
$(document).on("click", ".btn-comparar-precios:not(.btn-disabled)", function() {
    mostrarComparativa();
});
$(document).on("click", ".ayuda", function() {
    $("header a").removeClass("active");
    $("header a.ayuda").addClass("active");
    $(".como-usar-sitio").show();
    $(".productos-informados").hide();
    $(".tabla-inicial").hide();
    $(".tabla1").hide();
    $(".tabla2").hide();
    $(".botonera").hide();
    $(".encabezado p").hide();
    $(".terminos-y-condiciones").hide();
    window.scrollTo(0, 400);
});
$(document).on("click", ".informados", function() {
    $("header a").removeClass("active");
    $("header a.informados").addClass("active");
    $(".productos-informados").removeClass("hidden");
    $(".productos-informados").show();
    $(".como-usar-sitio").hide();
    $(".tabla-inicial").hide();
    $(".tabla1").hide();
    $(".tabla2").hide();
    $(".botonera").show();
    $(".encabezado p").hide();
    $(".terminos-y-condiciones").hide();
    $(".botonera>div").removeClass("active");
    window.scrollTo(0, 400);
});
$(document).on("click", "tr.do-ver-detalle-producto td:not(:nth-last-child(-n+2))", function() {
    $(".tabla1").hide();
    $(".tabla2").hide();
    $("article.detalle-producto").removeClass("hidden");
    $("article.detalle-producto").show();
    $(".btn-buscar-productos").removeClass("active");
    $(".encabezado p").hide();
    $(".productos-informados").hide();
    window.scrollTo(0, 350);
});
$(document).on("click", "div.do-ver-detalle-producto", function() {
    $(".tabla1").hide();
    $(".tabla2").hide();
    $("article.detalle-producto").removeClass("hidden");
    $("article.detalle-producto").show();
    $(".btn-comparar-precios").removeClass("active");
    $(".encabezado p").hide();
    $(".productos-informados").hide();
    window.scrollTo(0, 350);
});
$(document).on("click", ".btn-imprimir", function() {
    window.print();
});
$(document).on("keyup", ".buscador-productos input", function(e) {
    $(".submenu-productos").addClass("hidden");
    if (e.which == 13) {
        $(this).blur();
    }
});
$(document).on("click", ".buscador-productos input", function(e) {
    $(this).select();
});
$(document).on("click", ".do-hide-menu-on-click", function() {
    $(".submenu-productos").toggleClass("hidden");
});
$(document).on("click", ".cerrar-msj", function() {
    $(".contenedor-mensajes").addClass("hidden");
});
$(document).on("click", ".btn-reclamo", function() {
    $("#modalReclamo #tabContent>li").removeClass("active");
    $("#modalReclamo #tabContent>li:last-child").addClass("active");
});
$(document).on("click", "#filtros-busqueda", function() {
    $("#filtros-comercios-busqueda").toggle();
    $("#filtros-busqueda").empty();
    if ($("#filtros-comercios-busqueda").is(":visible")) {
        $("#filtros-busqueda").append('Ocultar Filtros &nbsp; <i class="fa fa-caret-up fa-lg"></i>');
    } else {
        $("#filtros-busqueda").append('Mostrar Filtros &nbsp; <i class="fa fa-caret-down fa-lg"></i>');
    }
});
$(document).on("click", "#filtros-detalle", function() {
    $("#filtros-comercios-detalle").toggle();
    $("#filtros-detalle").empty();
    if ($("#filtros-comercios-detalle").is(":visible")) {
        $("#filtros-detalle").append('Ocultar Filtros &nbsp; <i class="fa fa-caret-up fa-lg"></i>');
    } else {
        $("#filtros-detalle").append('Mostrar Filtros &nbsp; <i class="fa fa-caret-down fa-lg"></i>');
    }
});
$(document).on("click", "#filtros-comparativa", function() {
    $("#filtros-tabla-comparativa").toggle();
    $("#filtros-comparativa").empty();
    if ($("#filtros-tabla-comparativa").is(":visible")) {
        $("#filtros-comparativa").append('Ocultar Filtros &nbsp; <i class="fa fa-caret-up fa-lg"></i>');
    } else {
        $("#filtros-comparativa").append('Mostrar Filtros &nbsp; <i class="fa fa-caret-down fa-lg"></i>');
    }
});
function fbShare(url, title, descr, image, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + descr + '&p[url]=' + url + '&p[images][0]=' + image, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}
function twShare(url, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open('http://www.twitter.com/share?url=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}
function gShare(url, winWidth, winHeight) {
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);
    window.open('https://plus.google.com/share?url=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}
function mostrarComparativa() {
    $("header .botonera div").removeClass("active");
    $("header .botonera .btn-comparar-precios").addClass("active");
    $(".tabla1").hide();
    $(".tabla-inicial").show();
    $(".tabla2").show();
    $("article.detalle-producto").hide();
    $("header a").removeClass("active");
    $(".productos-informados").hide();
    window.scrollTo(0, 450);
}
$('.mostrar-tooltip').tooltip();
$('.dropdown-toggle').dropdown();
var toSearch = true;
var firstTime = true;
var panic = false;
$(document).on("click", "#linkToHTML5GeoLanding", function(e) {
    e.preventDefault();
});
$(document).on("click", ".btn-buscar-productos", function() {
    toSearch = false;
});
$(document).on("click", ".btn-comparar-precios:not(.btn-disabled)", function() {
    toSearch = true;
});
$(document).on("click", ".ayuda", function() {
    toSearch = true;
});
$(document).on("click", "tr.do-ver-detalle-producto td:not(:nth-last-child(-n+2))", function() {
    toSearch = true;
});
window.addEventListener('load', function() {
    $('#modalGmaps').on('show.bs.modal', function() {
        panic = true;
    });
});
window.addEventListener('load', function() {
    $('#modalGmaps').on('hidden.bs.modal', function() {
        panic = false;
    });
});
history.pushState(null , null , '#');
window.addEventListener('popstate', function(e) {
    if (panic == true) {
        history.pushState(null , null , '#');
        return;
    }
    console.log('No panic');
    $('.modal').modal('hide');
    if (toSearch && !firstTime) {
        $("header .botonera div").removeClass("active");
        $(".ayuda").removeClass("active");
        $("header .botonera .btn-buscar-productos").addClass("active");
        $(".tabla2").hide();
        $(".detalle-producto").hide();
        $(".como-usar-sitio").hide();
        $(".terminos-y-condiciones").hide();
        $(".tabla-inicial").show();
        $(".tabla1").show();
        $("div.botonera").show();
        $(".encabezado p").css("visibility", "visible");
        window.scrollTo(0, 450);
        toSearch = false;
    } else {
        $("header .botonera div").removeClass("active");
        $("header .botonera .btn-comparar-precios").addClass("active");
        $(".tabla1").hide();
        $(".tabla2").show();
        window.scrollTo(0, 450);
        toSearch = true;
    }
    firstTime = false;
    history.pushState(null , null , '#');
});
var latitude;
var longitude;
var sentLatitude;
var sentLongitude;
var map;
var marker;
var locateHTML5 = false;
var inited = false;
var coordinates = {
    'cordoba': {
        'lat': -31.42008329999999,
        'lng': -64.18877609999998
    },
    'rosario': {
        'lat': -32.947368,
        'lng': -60.63087200000001
    },
    'mendoza': {
        'lat': -32.8981644,
        'lng': -68.84596909999999
    },
    'la_plata': {
        'lat': -34.9133418,
        'lng': -57.951597900000024
    },
    'ushuaia': {
        'lat': -54.80739920000001,
        'lng': -68.30878489999998
    },
    'tucuman': {
        'lat': -26.83040209999999,
        'lng': -65.20785660000001
    },
    'bariloche': {
        'lat': -41.13477770000001,
        'lng': -71.29783370000001
    },
    'salta': {
        'lat': -24.7867294,
        'lng': -65.43609079999999
    }
}
function citySelected(e) {
    if (!e.target.id) {
        var element = e.target;
        while (!element.id) {
            element = element.parentElement;
        }
    }
    var city = element.id;
    latitude = coordinates[city].lat;
    longitude = coordinates[city].lng;
    changeInputsValue('Mi ciudad');
    changeAddress();
    setStorage();
    track('Buscar productos', 'Ubicación - Ciudad');
}
function informAngular(lat, lng) {
    angular.element(document.body).scope().cambiarUbicacion(lat, lng);
}
function getInitialLocation() {
    return locationByStorage();
}
function getLocation() {
    var location = locationByStorage();
    if (location.lat && location.lng) {
        latitude = location.lat;
        longitude = location.lng;
        changeInputsValue('Mi ubicación almacenada');
        track('Buscar productos', 'Ubicación - Almacenada');
        changeAddress();
        return;
    }
}
function locationByStorage() {
    if (typeof (Storage) !== 'undefined') {
        lat = parseFloat(localStorage.getItem('lat'));
        lng = parseFloat(localStorage.getItem('lng'));
    } else {
        lat = parseFloat(getCookie('lat'));
        lng = parseFloat(getCookie('lng'));
    }
    return {
        'lat': lat,
        'lng': lng
    };
}
function setStorage() {
    if (typeof (Storage) !== 'undefined') {
        localStorage.setItem('lat', latitude);
        localStorage.setItem('lng', longitude);
    } else {
        setCookie('lat', latitude, 2);
        setCookie('lng', longitude, 2);
    }
}
function setAddress() {
    if (!latitude || !longitude) {
        showError('No has seleccionado ninguna ubicación', '¡Intenta ubicarte en el mapa!');
    } else {
        changeAddress();
        setStorage();
        gmapsClose();
    }
}
function gmapsClose() {
    $('#modalGmaps').modal('hide');
}
function gmapsOpen() {
    $('#modalGmaps').modal('show');
}
function changeAddress() {
    if (latitude != sentLatitude && longitude != sentLongitude) {
        informAngular(latitude, longitude);
        sentLatitude = latitude;
        sentLongitude = longitude;
    }
}
function isLocated() {
    if (!latitude || !longitude) {
        return false;
    }
    return true;
}
function getHTML5Location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latLng = new google.maps.LatLng({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            changeAddress();
            setStorage();
            changeInputsValue('Mi ubicación aproximada');
            putMarker(latLng);
            track('Buscar productos', 'Ubicación - HTML5 Modal');
        }, function(error) {
            if (locateHTML5) {
                if (error.PERMISSION_DENIED) {
                    showError('No se puede obtener tu ubicación desde tu navegador', '¡Intenta habilitándola o utilizando otro método para localizarte!');
                } else {
                    showError('No se puede obtener tu ubicación desde tu navegador', '¡Utiliza otro método para localizarte!');
                }
            }
        });
    }
}
function getHTML5LocationLanding() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            changeAddress();
            setStorage();
            changeInputsValue('Mi ubicación aproximada');
            track('Buscar productos', 'Ubicación - HTML5 Landing');
        }, function(error) {
            if (locateHTML5) {
                if (error.PERMISSION_DENIED) {
                    showError('No se puede obtener tu ubicación desde tu navegador', '¡Intenta habilitándola o utilizando otro método para localizarte!');
                } else {
                    showError('No se puede obtener tu ubicación desde tu navegador', '¡Utiliza otro método para localizarte!');
                }
                gmapsOpen();
            }
        });
    }
}
function initMap() {
    map = new google.maps.Map(document.getElementById('map'),{
        center: {
            lat: -41.1113,
            lng: -63.84762
        },
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false
    });
    map.addListener('click', function(e) {
        clickOnMap(e.latLng, map);
    });
}
function initAutocomplete() {
    var input = document.getElementById('address');
    var options = {
        componentRestrictions: {
            country: 'ar'
        }
    };
    input.value = '';
    autocomplete = new google.maps.places.Autocomplete(input,options);
    autocomplete.addListener('place_changed', function(e) {
        autocompleteReady()
    });
}
function clickOnMap(latLng, map) {
    latitude = latLng.lat();
    longitude = latLng.lng();
    changeInputsValue('Mi ubicación seleccionada');
    putMarker(latLng);
    track('Buscar productos', 'Ubicación - Marker ubicado');
}
function dragOnMap(e) {
    latitude = e.latLng.lat();
    longitude = e.latLng.lng();
    changeInputsValue('Mi ubicación seleccionada');
    track('Buscar productos', 'Ubicación - Marker arrastrado');
}
function putMarker(latLng) {
    clean();
    var icon = {
        url: 'img/chanchicon.png',
        scaledSize: new google.maps.Size(40,65)
    };
    marker = new google.maps.Marker({
        map: map,
        position: latLng,
        draggable: true,
        title: "Arrastra o haz click para buscas comercios cercanos a este punto"
    });
    marker.addListener('dragend', function(e) {
        dragOnMap(e);
    });
    map.setCenter(latLng);
    map.panTo(latLng);
    map.setZoom(16);
}
function autocompleteReady() {
    if (autocomplete.getPlace().geometry) {
        var latLng = autocomplete.getPlace().geometry.location;
        latitude = latLng.lat();
        longitude = latLng.lng();
        changeInputsValue(document.getElementById('address').value)
        putMarker(latLng);
        track('Buscar productos', 'Ubicación - Autocomplete');
    } else {
        showError('No hay resultados para el lugar ingresado', '¡Intenta nuevamente!');
    }
}
function clean() {
    if (marker) {
        marker.setMap(null );
    }
}
function hideError() {
    document.getElementById('oops').style.display = 'none';
    document.getElementById('dimScreen').style.display = 'none';
}
function showError(phrase1, phrase2) {
    document.getElementById('oops').style.display = 'block';
    document.getElementById('dimScreen').style.display = 'block';
    if (phrase1) {
        document.getElementById('showOops').innerHTML = phrase1;
        document.getElementById('showOops2').innerHTML = phrase2;
    }
}
function searchByMap() {
    var latLng = {
        lat: -36.06686213257887,
        lng: -63.52294921875
    };
    map.setZoom(6);
    map.panTo(latLng);
}
function changeInputsValue(value) {
    var elements = document.getElementsByName('direccion');
    for (var i = 0; i < elements.length; i++) {
        elements[i].value = value;
    }
}
function setCookie(name, value, expirationDays) {
    var date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + "; " + expires;
}
function getCookie(name) {
    var cookies = document.cookie;
    if (!cookies) {
        return false;
    }
    var start = cookies.indexOf(name);
    if (start == -1) {
        return false;
    }
    start = start + name.length + 1;
    var qty = cookies.indexOf('; ', start) - start;
    if (qty <= 0) {
        qty = cookies.length;
    }
    return cookies.substr(start, qty);
}
window.addEventListener('load', function() {
    getLocation();
});
document.getElementById('linkToHTML5Geo').addEventListener("click", function(e) {
    locateHTML5 = true;
    getHTML5Location();
    return false;
});
document.getElementById('linkToHTML5GeoLanding').addEventListener("click", function(e) {
    locateHTML5 = true;
    getHTML5LocationLanding();
    return false;
});
document.getElementById('acceptLink').addEventListener("click", function(e) {
    setAddress();
    return false;
});
document.getElementById('cancelLink').addEventListener("click", function(e) {
    gmapsClose();
    return false;
});
document.getElementById('dimScreen').addEventListener("click", function(e) {
    hideError();
});
changeInputsValue('Sin ubicación cargada');
for (var cor in coordinates) {
    document.getElementById(cor).addEventListener("click", function(e) {
        citySelected(e);
        return false;
    });
}
$('#modalGmaps').on('show.bs.modal', function() {
    setTimeout(function() {
        if (!inited) {
            initMap();
            initAutocomplete();
            inited = true;
        }
        if (latitude && longitude) {
            latLng = new google.maps.LatLng({
                lat: latitude,
                lng: longitude
            });
            putMarker(latLng);
        }
    }, 500);
});
$(window).load(function() {
    $('.dimmable').append('<div class="dimScreen"></div>');
    $('.loader').append('<div class="loading"><i class="fa fa-spinner fa-spin"></i></div>');
});
function showLoading() {
    $('.loading').css('display', 'block');
    $('.dimScreen').css('display', 'block');
}
function hideLoading() {
    $('.loading').css('display', 'none');
    $('.dimScreen').css('display', 'none');
}
var recaptched = [false, false, false, false]
var emailreg = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;
function prepare_recaptcha(i, dom_id) {
    if (recaptched[i] === false) {
        recaptcha_id = grecaptcha.render(document.getElementById(dom_id), {
            sitekey: RECAPTCHA_SITE_KEY
        });
        recaptched[i] = recaptcha_id;
    } else {
        grecaptcha.reset();
    }
}
function launch_add_store() {
    prepare_recaptcha(0, 'add-store-recaptcha');
}
function submit_add_store() {
    $(".error").remove();
    if ($('#add-store-email').val() == "" || !emailreg.test($("#add-store-email").val())) {
        $('#add-store-email').focus().after("<span class='error text-danger'>Por favor, completá tu email</span>");
        return false;
    }
    if (grecaptcha.getResponse(recaptched[0]) == "") {
        $("#add-store-recaptcha").after("<span class='error text-danger'>Por favor, completá el captcha</span>");
        return;
    }
    track('Footer', 'Enviar - Sumar comercio');
    showLoading();
    $.ajax({
        url: BACKEND_URL + "/add_store",
        type: "POST",
        data: {
            email: $('#add-store-email').val(),
            recaptcha: grecaptcha.getResponse(recaptched[0])
        },
        success: function(data) {
            if (data.success) {
                $('#modalComercio').modal('toggle');
                mostrar_mensaje("Tu solicitud fue enviada correctamente.", "alert-info");
            } else
                mostrar_mensaje(data.error_description, "alert-danger");
        },
        error: function() {
            mostrar_mensaje("<strong>Ops!</strong> Ocurrió un error al enviar tu solicitud.", "alert-danger");
        },
        complete: function() {
            hideLoading();
        }
    });
}
function mostrar_mensaje(mensaje, colorElemento) {
    $(".contenedor-mensajes").removeClass("hidden");
    $(".contenedor-mensajes").removeClass("alert-info").removeClass("alert-danger");
    $(".contenedor-mensajes").addClass(colorElemento);
    $(".contenedor-mensajes span.mensaje").html(mensaje);
    setTimeout(function() {
        $(".contenedor-mensajes").addClass("hidden");
    }, 5000);
}
function submit_make_suggestion() {
    $(".error").remove();
    if ($("[name=comentarios]:checked").length == 0) {
        $(".contenedor-preguntas").focus().after("<span class='error text-danger'>Por favor seleccioná al menos una de las experiencias</span>");
        return;
    }
    if ($('#reclamo-email').val() == "" || !emailreg.test($("#reclamo-email").val())) {
        $('#reclamo-email').focus().after("<span class='error text-danger'>Complete su email</span>");
        return false;
    }
    if (grecaptcha.getResponse(recaptched[1]) == "") {
        $("#make-suggestion-recaptcha").after("<span class='error text-danger'>Por favor, completá el captcha</span>");
        return;
    }
    track('Disclaimer', 'Enviar - Experiencia');
    showLoading();
    var selected = [];
    $('.contenedor-preguntas input:checked').each(function() {
        selected.push($(this).attr('value'));
    });
    $.ajax({
        url: BACKEND_URL + "/make_suggestion",
        type: "POST",
        data: {
            comments: $('#reclamo-comentarios').val(),
            commerce: $('#comercio').val(),
            email: $('#reclamo-email').val(),
            claim: selected,
            recaptcha: grecaptcha.getResponse(recaptched[1])
        },
        success: function(data) {
            if (data.success) {
                $('#modalReclamo').modal('toggle');
                mostrar_mensaje("Tu sugerencia fue enviada correctamente.", "alert-info");
            } else
                mostrar_mensaje(data.error_description, "alert-danger");
        },
        error: function() {
            mostrar_mensaje("<strong>Ops!</strong> Ocurrió un error al enviar tu sugerencia.", "alert-danger");
        },
        complete: function() {
            hideLoading();
        }
    });
}
function launch_make_suggestion() {
    prepare_recaptcha(1, 'make-suggestion-recaptcha');
}
function launch_make_claim() {
    prepare_recaptcha(2, 'make-claim-recaptcha');
}
function submit_make_claim() {
    $(".error").remove();
    if ($('#motivo-reclamo').val() == "") {
        $('#motivo-reclamo').focus().after("<span class='error text-danger'>Complete el motivo de su reclamo</span>");
        return false;
    }
    if ($('#nombre-reclamo').val() == "") {
        $('#nombre-reclamo').focus().after("<span class='error text-danger'>Complete su nombre y apellido</span>");
        return false;
    }
    if ($('#dni-reclamo').val() == "") {
        $('#dni-reclamo').focus().after("<span class='error text-danger'>Complete su DNI</span>");
        return false;
    }
    if ($('#direccion-reclamo').val() == "") {
        $('#direccion-reclamo').focus().after("<span class='error text-danger'>Complete la dirección del comercio</span>");
        return false;
    }
    if ($('#producto-reclamo').val() == "") {
        $('#producto-reclamo').focus().after("<span class='error text-danger'>Complete el nombre del producto</span>");
        return false;
    }
    if ($('#email-reclamo').val() == "" || !emailreg.test($("#email-reclamo").val())) {
        $('#email-reclamo').focus().after("<span class='error text-danger'>Complete su email</span>");
        return false;
    }
    if ($('#comercio-reclamo').val() == "") {
        $('#comercio-reclamo').focus().after("<span class='error text-danger'>Complete el nombre del comercio</span>");
        return false;
    }
    if (grecaptcha.getResponse(recaptched[2]) == "") {
        $("#make-claim-recaptcha").after("<span class='error text-danger'>Por favor, completá el captcha</span>");
        return;
    }
    track('Disclaimer', 'Enviar - Reclamo');
    showLoading();
    $.ajax({
        url: BACKEND_URL + "/make_claim",
        type: "POST",
        data: {
            claim: $('#motivo-reclamo').val(),
            name: $('#nombre-reclamo').val(),
            product: $('#producto-reclamo').val(),
            store: $('#comercio-reclamo').val(),
            dni: $('#dni-reclamo').val(),
            address: $('#localidad-reclamo').val(),
            store_address: $('#direccion-reclamo').val(),
            email: $('#email-reclamo').val(),
            phone: $('#telefono-reclamo').val(),
            comments: $('#descripcion-reclamo').val(),
            recaptcha: grecaptcha.getResponse(recaptched[2])
        },
        success: function(data) {
            if (data.success) {
                $('#modalSugerencia').modal('toggle');
                mostrar_mensaje("Tu reclamo fue enviado correctamente.", "alert-info");
            } else
                mostrar_mensaje(data.error_description, "alert-danger");
        },
        error: function() {
            mostrar_mensaje("<strong>Ops!</strong> Ocurrió un error al enviar tu reclamo.", "alert-danger");
        },
        complete: function() {
            hideLoading();
        }
    });
}
function launch_send_list() {
    prepare_recaptcha(3, 'send-list-recaptcha')
}
function submit_send_list() {
    $(".error").remove();
    if ($('#send-list-email').val() == "" || !emailreg.test($("#send-list-email").val())) {
        $('#send-list-email').focus().after("<span class='error text-danger'>Por favor, completa tu email</span>");
        return false;
    }
    if (grecaptcha.getResponse(recaptched[3]) == "") {
        $("#send-list-recaptcha").after("<span class='error text-danger'>Por favor, completá el captcha</span>");
        return;
    }
    track('Comparar precios', 'Enviar - Compartir lista');
    showLoading();
    $.ajax({
        url: BACKEND_URL + "/send_list",
        type: "POST",
        data: {
            email: $('#send-list-email').val(),
            list: $('#send-list-data').val(),
            prices: $('#send-prices-data').val(),
            subsidiaries: $('#send-subsidiaries-data').val(),
            products: $('#send-products-data').val(),
            recaptcha: grecaptcha.getResponse(recaptched[3])
        },
        success: function(data) {
            if (data.success) {
                $('#modalCompartirLista').modal('toggle');
                mostrar_mensaje("Tu lista de productos fue enviada correctamente.", "alert-info");
            } else
                mostrar_mensaje(data.error_description, "alert-danger");
        },
        error: function() {
            mostrar_mensaje("<strong>Ops!</strong> Ocurrió un error al enviar tu lista de productos.", "alert-danger");
        },
        complete: function() {
            hideLoading();
        }
    });
}
var leaveTracking = false;
var specialTracking = false;
var afterEvent = 0;
var inhibitedTracks = new Array();
var inhibitNext = false;
var searchActive = false;
function track(category, action, label, value) {
    if (isInhibited()) {
        return;
    }
    if (action == 'Busqueda' && searchActive == false) {
        return;
    }
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': category,
        'ua-action': action,
        'ua-label': label,
        'ua-value': value
    });
    if (specialTracking == true) {
        afterEvent++;
        dataLayer.push({
            'event': 'UAtracking',
            'ua-category': 'Special tracking',
            'ua-action': afterEvent + ' - ' + action,
            'ua-label': label,
            'ua-value': value
        });
    }
    leaveTracking = false;
    if (label == 'Sin resultado') {
        leaveTracking = true;
        specialTracking = true;
    }
}
function inhibitTrack(category, action, label, value) {
    category = category ? category : '';
    action = action ? action : '';
    label = label ? label : '';
    value = value ? value : '';
    inhibitedTracks.push(category + action + label + value);
}
function inhibitNextTrack() {
    inhibitNext = true;
}
function isInhibited(category, action, label, value) {
    if (inhibitNext == true) {
        inhibitNext = false;
        return true;
    } else {}
    return false;
}
function trackSearchActive() {
    searchActive = true;
}
function trackSearchUnactive() {
    searchActive = false;
}
$('#modalVaciarLista').on('show.bs.modal', function() {
    track('Comparar precios', 'Modal - Vaciar lista');
});
$('#emptyList').on('click', function() {
    track('Comparar precios', 'Vaciar lista');
});
$(window).on('beforeunload', function() {
    if (leaveTracking == true) {
        track('Abandono', 'Búsqueda vacía');
    }
});
$('body').on('click', 'header .nav a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Header',
        'ua-action': 'Link -' + $(this).text(),
        'ua-label': ''
    });
});
$('body').on('click', '.main-footer ul li a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Footer',
        'ua-action': 'Link -' + $(this).text(),
        'ua-label': ''
    });
});
$('body').on('click', '[href=#modalComercio]', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Footer',
        'ua-action': 'Modal - Sumar comercio',
        'ua-label': ''
    });
});
$('body').on('click', '#modalComercio .terminosLeyenda a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Footer',
        'ua-action': 'Link - Términos y condiciones',
        'ua-label': 'Modal Sumar Comercio'
    });
});
$('body').on('click', '[href=#modalReclamo]', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Footer',
        'ua-action': 'Modal - Experiencia',
        'ua-label': ''
    });
});
$('body').on('click', '#modalReclamo .terminosLeyenda a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Footer',
        'ua-action': 'Link - Términos y condiciones',
        'ua-label': 'Modal Experiencia'
    });
});
$('body').on('click', '.categorias-no-encontradas > div', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Buscar productos',
        'ua-action': 'Categoria sugerida',
        'ua-label': $(this).find('.categoria').text()
    });
});
$('body').on('click', '.encabezado .botonera .btn-comparar-precios', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Buscar productos',
        'ua-action': 'Comparativa',
        'ua-label': 'Tab - ' + parseInt($(this).find('.ng-binding').text().replace(/[(,)]/gi, ''))
    });
});
$('body').on('click', '.tabla-inicial .btn-comparar-precios', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Buscar productos',
        'ua-action': 'Comparativa',
        'ua-label': 'Boton - ' + parseInt($(this).text().match(/\d/g)[0])
    });
});
$('body').on('click', '.social-share ul li a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Buscar productos',
        'ua-action': 'Compartir',
        'ua-label': $(this).find('i').attr('class').split('-')[1]
    });
});
$('body').on('click', 'ul.paginacion li a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Buscar productos',
        'ua-action': 'Paginacion',
        'ua-label': $(this).text()
    });
});
$('body').on('click', '.sin-localizacion .item-categoria', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Buscar productos',
        'ua-action': 'Localizacion sugerida',
        'ua-label': $(this).find('.categoria').text()
    });
});
$('body').on('click', '.buscador .btn-imprimir', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Imprimir',
        'ua-label': 'Arriba'
    });
});
$('body').on('click', 'div.hidden-print .btn-imprimir', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Imprimir',
        'ua-label': 'Abajo'
    });
});
$('body').on('click', '.buscador .btn-compartir-lista', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Modal - Compartir lista',
        'ua-label': 'Arriba'
    });
});
$('body').on('click', 'div.hidden-print .btn-compartir-lista', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Modal - Compartir lista',
        'ua-label': 'Abajo'
    });
});
$('body').on('click', '#modalReclamo .terminosLeyenda a', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Link - Términos y condiciones',
        'ua-label': 'Compartir lista'
    });
});
$('body').on('click', '.tabla-comparativa .quitar', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Quitar producto',
        'ua-label': 'Compartir lista'
    });
});
var promoSelected = false;
$('body').on('click', '.tabla-comparativa .precio-promo-1, .tabla-comparativa .precio-promo-2', function() {
    if (!promoSelected) {
        dataLayer.push({
            'event': 'UAtracking',
            'ua-category': 'Comparar precios',
            'ua-action': 'Seleccionar promo',
            'ua-label': ''
        });
        promoSelected = true;
    }
});
$('body').on('click', '.botonera .btn-buscar-productos', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Seguir agregando productos',
        'ua-label': 'Tab'
    });
});
$('body').on('click', 'main .btn-buscar-productos', function() {
    dataLayer.push({
        'event': 'UAtracking',
        'ua-category': 'Comparar precios',
        'ua-action': 'Seguir agregando productos',
        'ua-label': 'Boton'
    });
});
$(document).ready(function() {
    var emailreg = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;
    $("#add-store-email").keyup(function() {
        if ($(this).val() != "" && emailreg.test($(this).val())) {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#send-list-email").keyup(function() {
        if ($(this).val() != "" && emailreg.test($(this).val())) {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#email-reclamo").keyup(function() {
        if ($(this).val() != "" && emailreg.test($(this).val())) {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#motivo-reclamo").keyup(function() {
        if ($(this).val() != "") {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#nombre-reclamo").keyup(function() {
        if ($(this).val() != "") {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#dni-reclamo").keyup(function() {
        if ($(this).val() != "") {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#direccion-reclamo").keyup(function() {
        if ($(this).val() != "") {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#ciudad-reclamo").keyup(function() {
        if ($(this).val() != "") {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#telefono-reclamo").keyup(function() {
        if ($(this).val() != "") {
            $(".error").fadeOut();
            return false;
        }
    });
    $("#address").keyup(function() {
        $("#oops").fadeOut();
        return false;
    });
});
