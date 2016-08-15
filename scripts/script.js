(function () {
  var i
  var zonaDescripcion
  var zonaSucursales
  var zonas = $('.list_container').children()

  for (i = 0; i < zonas.length; i = i + 2) {
    zonaDescripcion = $(zonas[i]).children('h3').text()
    zonaSucursales = $( $( zonas[i+1] ).children('tbody')[1] ).children('tr')
    console.debug( zonaDescripcion + ' : ' + zonaSucursales.length )
    leerSucursalesDeZona(zonaDescripcion, zonaSucursales)
  }

  function leerSucursalesDeZona(zonaDescripcion, sucursales){
    var detalleSucursal = ''
    var idSucursal

    $(sucursales).each(function() {
      detalleSucursal += zonaDescripcion
      $(this).children('td').each(function(){

        if ($(this).attr('width') === '41') {
          idSucursal = $(this).text()
        }
        if ($(this).attr('width') === '127') {
          detalleSucursal += '|' + $(this).find('div.btnTipo').attr('class').replace('btnTipo ', '').toUpperCase()
        } else {
          detalleSucursal += '|' + $(this).text().replace(' - ' + zonaDescripcion, '')
        }
      })

      detalleSucursal += obtenerGeolocalizacion(idSucursal)

      detalleSucursal += '\n'
    })

    console.info( detalleSucursal )
  }

  function obtenerGeolocalizacion(idSucursal){
    var geolocalizacion

    $.ajax('http://www.coto.com.ar/mapassucursales/Sucursales/DetalleSucursal.aspx?idSucursal=' + idSucursal, {async: false})
    .done(
      function(data){
        var coordenadas = data.match(/dibujarMapa\(([^)]+)\)/)[1].split(',')
        geolocalizacion = '|' + coordenadas[0] + '|' + coordenadas[1]
        console.debug(geolocalizacion)
      }
    )

    return geolocalizacion
  }

})();
