// Script config.
const filePathProductos = './carga_mongo/files/lista_productos.js'
const id_suc = ['12-1-56']
const id_suc_interno = ['93c2845f4015d10fe1a570a98f015f81']
const delay = 1000
const delayOffset = 50
const logOffset = 5
const saveOffset = 500
const pathArchivos = '.'
const hostname = '8kdx6rx8h4.execute-api.us-east-1.amazonaws.com'
const key = 'mBurRHh5lEHTFkC11Its1zcQuE1Gn4N58SGwD135'
const precios_db = 'https://webi.certant.com/echango/comercios_precios_consulta'
//const id_productos = obtenerListaDeProductos()
const id_productos = ['7790895000997','7790360026606','7790670050629','7790360026576','7790670050766','7790360026590','7790360966841','7790670050827']
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

const http = require('https')

function wait() {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, delayOffset + delay * Math.random());
  })
}

function obtenerPreciosPorProductoYComercio(ean, suc){

  return new Promise(function(resolve, reject){

    var options = {
      hostname: hostname,
      path: '/dev/producto?limit=30&id_producto='+ ean +'&array_sucursales=' + suc,
      headers: headers
    }

    var req = http.get(options, function(response) {
        var body = ''

        response.on('data', function(d) {
            body += d
        })

        response.on('end', function() {
          var parsed = body.toString()
          var respData = JSON.parse(parsed)
          try{
            // Si obtengo el precio OK lo guardo.
            var precio = respData.sucursales[0].preciosProducto.precioLista
            resolve({
              ean: ean,
              precios: precio
            })
          } catch (err) {
            // Si da error lo marco como no disponible en ese comercio.
            reject(ean)
          }

        })

    })

    req.on('error', (err) => {
      reject(ean)
    })

    req.end()

  })

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

var precios_por_comercio = {
  _id: id_suc_interno,
  precios: [],
  no_disponibles: []
}

for (i=0; i<id_suc.length; i++){

  console.log('Se van a buscar los precios de la sucursal: ' + id_suc[i])

  for (j=0; j<id_productos.length; j++){

    buscarPreciosSucursal(id_productos[j], id_suc[i], j)

  }

}

function buscarPreciosSucursal(ean, suc, idx){

  wait().then(function(){
    return obtenerPreciosPorProductoYComercio(ean, suc)
  }).then(function(precio){
    console.log('EAN: [' + ean +'] - SUC: [' + suc + '] => OK.')
    logProgress(idx)
    precios_por_comercio.precios.push(precio)
  }).catch(function(err){
    console.log('EAN: [' + ean +'] - SUC: [' + suc + '] => ERR (' + err + ').')
    logProgress(idx)
    precios_por_comercio.no_disponibles.push(err)
  })
}

function logProgress(idx){
  if (idx % logOffset == 0 || idx == id_productos.length){
    console.log('=============================================================')
    console.log('Relevado hasta el momento: ' + j)
    console.log('No disponibles: ' + precios_por_comercio.no_disponibles.length)
    console.log('=============================================================')
  }
}
