// Script config.
const filePathProductos = 'd:/play/echango-backend/scripts/carga_mongo/files/lista_productos.js'
const id_suc = '12-1-56'
const id_suc_interno = '93c2845f4015d10fe1a570a98f015f81'
const delay = 10000
const logOffset = 100
const saveOffset = 500
const pathArchivos = '.'
const hostname = '8kdx6rx8h4.execute-api.us-east-1.amazonaws.com'
const key = 'rHLavj6O8Q58x60Bkr9Gs7zZrCE1i9k54aIDxqhm'
const precios_db = 'http://ec2-52-38-235-81.us-west-2.compute.amazonaws.com/comercios_precios_consulta'
const id_productos = obtenerListaDeProductos()
const headers = {
  // Este valor puede llegar a cambiar:
  'x-api-key': key,
  // Estos valores son constantes!
  'connection': 'keep-alive',
  'accept': 'application/json, text/plain, */*',
  'origin': 'https://www.preciosclaros.gob.ar',
  'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
  'referer': 'https://www.preciosclaros.gob.ar/',
  'accept-encoding': 'gzip, deflate, sdch, br',
  'accept-language': 'en-US,en;q=0.8,es;q=0.6,pt-BR;q=0.4,pt;q=0.2,pt-PT;q=0.2'
}
// End config.

const https = require('https')

var precios_por_comercio = {
  _id: id_suc_interno,
  precios: [],
  no_disponibles: []
}

function obtenerPreciosPorProductoYComercio(ean){
  var options = {
    hostname: hostname,
    port: 443,
    path: '/dev/producto?limit=30&id_producto='+ ean +'&array_sucursales=' + id_suc,
    method: 'GET',
    headers: headers
  }

  var req = https.request(options, (res) => {

    res.on('data', (d) => {
      var respData = JSON.parse(new Buffer(d).toString('ascii'))
      try{
        // Si obtengo el precio OK lo guardo.
        var precio = respData.sucursales[0].preciosProducto.precioLista
        precios_por_comercio.precios.push({
          ean: ean,
          precios: precio
        })
      } catch (err) {
        // Si da error lo marco como no disponible en ese comercio.
        precios_por_comercio.no_disponibles.push(ean)
      }

      // Si releve el ultimo producto entonces guardo lo relevado.
      productos_relevados++
      loguearProgreso(precios_por_comercio, productos_relevados)
      guardarCopiaTemporal(precios_por_comercio, productos_relevados)
    })

  })
  req.end()
}

/*
  Guardar en disco los precios relevados cada cierta cantidad configurable de productos relevados.
*/
function guardarCopiaTemporal(precios_por_comercio, productos_relevados){
  if (productos_relevados % saveOffset == 0)
    guardarPreciosComercioEnArchivo(precios_por_comercio)


  if (productos_relevados == id_productos.length){
    guardarPreciosComercioEnArchivo(precios_por_comercio)

    var PouchDB = require('pouchdb')
    var db = new PouchDB(precios_db)
    db.put(precios_por_comercio).then(function(){
      console.log('Se guardo en Couch exitosamente!')
    }).catch(function(err){
      console.log('Error al persistir en Couch: ' + err)
    })
  }
}

/*
  Guarda el objeto en formato JSON, en un archivo llamado <id_suc>.js.
  Si no se
*/
function guardarPreciosComercioEnArchivo(precios_por_comercio){
  var filename = pathArchivos + '/' + id_suc + '.js'
  require('fs').writeFile(filename, JSON.stringify(precios_por_comercio), (err) =>{
    if (err) throw err;
    console.log('Se genero el archivo: ' + filename)
  })
}

/*
  Obtiene la lista de todos los productos.
*/
function obtenerListaDeProductos(){
  var data = require('fs').readFileSync(filePathProductos)
  return JSON.parse(data)
}

/*
  Loguear la cantidad de productos relevados cada cierta cantidad configurable de productos.
*/
function loguearProgreso (precios_por_comercio, productos_relevados){
  if (productos_relevados % logOffset == 0){
    console.log('Relevado hasta el momento: ' + productos_relevados)
    console.log('No disponibles: ' + precios_por_comercio.no_disponibles.length)
    console.log('=============================================================')
  }
}

// Itero por cada ean de producto, y obtengo su precio
var productos_relevados = 0
id_productos.forEach(function(prod){
  setTimeout(function(){
    obtenerPreciosPorProductoYComercio(prod.ean)
  }, delay * Math.random() + 1000);
})