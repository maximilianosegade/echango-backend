// Script config.
const id_suc = '12-1-56'
const id_suc_interno = '93c2845f4015d10fe1a570a98f015f81'
const delay = 5000
const pathArchivos = '.'
const hostname = '8kdx6rx8h4.execute-api.us-east-1.amazonaws.com'
const key = 'mBurRHh5lEHTFkC11Its1zcQuE1Gn4N58SGwD135'
const precios_db = 'https://webi.certant.com/echango/comercios_precios_consulta'
//const id_productos = obtenerListaDeProductos()
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

function obtenerIdSucursal(){
  var options = {
    hostname: hostname,
    port: 443,
    path: '/prod/sucursales?lat=-34.602232&lng=-58.411533&limit=1',
    method: 'GET',
    headers: headers
  }

  var req = https.request(options, (res) => {
    var data = ''

    res.on('data', (d) =>{
      data += d
    })

    res.on('end', () => {
      var respData = data.toString()
      console.log(respData)
    })

  })

  req.end()
}

obtenerIdSucursal()
