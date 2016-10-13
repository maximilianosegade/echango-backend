// Script config.
const filePathProductos = 'carga_mongo/files/lista_productos.js'
const delay = 10000
const pathOutputArchivos = '.'
const hostname = '8kdx6rx8h4.execute-api.us-east-1.amazonaws.com'
const key = 'PkVRKmPu0k6O2F0Y9J78TaFekqe3mAAe3RWJ5Vaj'
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

const http = require('https')
var relevados = 0
var ranking = {}

for (var i=1; i<=30; i++){
    ranking[i] = []
}

id_productos.forEach(obtenerCantidadPorProducto)
    
function obtenerCantidadPorProducto(prod){
  setTimeout(function(){
    
  var options = {
    hostname: hostname,
    port: 443,
    path: '/prod/producto?limit=30&id_producto='+prod.ean+'&array_sucursales=9-1-19,3-1-1066,10-3-573,15-1-168,10-3-404,15-1-359,10-3-580,12-1-56,15-1-440,10-3-367,10-3-196,15-1-69,10-3-550,15-1-528,10-3-712,15-1-526,9-2-48,15-1-344,15-1-346,15-1-7,10-3-332,10-3-661,9-1-5,12-1-91,10-3-679,10-3-591,15-1-408,12-1-24,10-3-604,12-1-74',
    method: 'GET',
    headers: headers
  }

  var req = http.request(options, (res) => {
    var body = ''
    var acumulado = 0
    
    res.on('data', (d) =>{
        body += d 
    })
    
    res.on('end', (d) => {
      var respData = JSON.parse(body.toString())
      try{
        ranking[respData.sucursalesConProducto].push(prod.ean)
      } catch (err) {
        // Si da error lo marco como no disponible en ese comercio.
        console.log('Error: ' + prod.ean)
      }
    
        relevados++
      if (relevados % 200 == 0 || relevados == id_productos.length){
          console.log('Relevados: ' + relevados)
          console.log('Cant suc disponible | Porcentaje acumulado')
          for (var j=30; j>=1; j--){
              acumulado += ranking[j].length * 100 / relevados
              console.log(j + ' | ' + acumulado + '%')              
          }
          console.log('==================================')
      }
    })

  })
  
  req.on('error', (err) => {
    relevados++
    console.log('Error: ' + prod.ean)
  })
  
  req.end()
  
  }, 120000 * Math.random())
  
}

/*
  Obtiene la lista de todos los productos.
*/
function obtenerListaDeProductos(){
  var data = require('fs').readFileSync(filePathProductos)
  return JSON.parse(data)
}