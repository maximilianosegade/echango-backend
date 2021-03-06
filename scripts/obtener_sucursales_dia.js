const comercios_db = 'https://webi.certant.com/echango/comercios'
const outputFile = './suc_dia.js'
const writeDB = false
const http = require('https')
const hostname = '8kdx6rx8h4.execute-api.us-east-1.amazonaws.com'
const key = 'mBurRHh5lEHTFkC11Its1zcQuE1Gn4N58SGwD135'
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

const EventEmitter = require('events');
const emitter = new EventEmitter()
var sucursales = [
'av-cramer-4345/',
'av-galvan-3460/',
'av-cramer-3226/',
'av-congreso-5781/',
'av-eva-peron-5462/',
'av-velez-sarsfield-472/',
'murillo-956/',
'ituzaingo-960/',
'lacroze-3178/',
'av-entre-rios-1525/',
'av-brasil-2450/',
'paso-752/',
'del-barco-centenera-801/',
'arevalo-1933/',
'talcahuano-475/',
'saavedra-86/',
'av-brasil-1237/',
'velasco-745/',
'salguero-3044/',
'lamadrid-728/',
'olazabal-4324/',
'riestra-5398/',
'nogoya-6089/',
'gallo-720/',
'cordoba-4667/',
'av-scalabrini-ortiz-3170/',
'balbin-3487/',
'chacabuco-677/',
'ruiz-huidobro-39423944/',
'gral-mariano-acha-3060/',
'vidal-2463/',
'av-crisologo-larralde-2287/',
'juana-manso-530/',
'av-san-juan-2283/',
'tucuman-439/',
'rawson-26/',
'bolivar-1474/',
'nazca-2325/',
'av-tte-gral-donato-alvarez-442/',
'av-cabildo-360/',
'av-cordoba-4379/',
'french-2979/',
'california-1995/',
'viamonte-1145/',
'intendente-cantilo-sn-pabellon-3-ciudad-universitaria/',
'av-libertador-6761/',
'otamendi-443/',
'av-cordoba-5799/',
'av-de-los-incas-4701/',
'av-pueyrredon-576/',
'austria-2355/',
'nogoya-3527/',
'av-san-juan-1261/',
'av-teniente-general-luis-dellepiane-n-5440/',
'rio-cuarto-3958/',
'francisco-beiro-4567/',
'av-jose-maria-moreno-1654/',
'bermudez-2058/',
'paysandu-1816/',
'avenida-gral-fernandez-de-la-cruz-3035/',
'avenida-gral-mosconi-3075/',
'cuenca-2462/',
'avenida-general-fernandez-de-la-cruz-6154/',
'jose-c-paz-2965/',
'moreno-1744/',
'avenida-jujuy-346/',
'av-juan-bautista-alberdi-3643/',
'nazca-5832/',
'beiro-4911/',
'chile-1347/',
'av-francisco-beiro-5678/',
'av-francisco-beiro-3679/',
'donato-alvarez-1887/',
'nazca-2063/',
'avenida-lope-de-vega-2159/',
'pavon-3743/',
'mendez-de-andes-563/',
'pepiri-931/',
'simbron-5768/',
'av-alvarez-jonte-4060/',
'mendez-de-andes-961/',
'corrales-1669/',
'regimiento-patricios-134/',
'av-alvarez-jonte-5730/',
'av-juan-bautista-alberdi-7272/',
'gascon-316/',
'fernandez-de-la-cruz-1030/',
'juan-bautista-alberdi-5287/',
'curapaligue-1964/',
'av-constituyentes-3632/',
'av-lafuente-1373/',
'la-rioja-1850/',
'larrazabal-919/',
'av-de-los-corrales-6901/',
'av-amancio-alcorta-3899/',
'avenida-general-fernandez-de-la-cruz-5583/',
'av-santa-fe-4550/',
'av-juan-b-alberdi-6253/',
'av-independencia-2262/',
'tte-gral-juan-domingo-peron-1653/',
'av-avellaneda-848/',
'av-velez-sarfield-1572/',
'av-piedrabuena-3941/',
'jean-jaures-318/',
'leopoldo-marechal-1247/',
'av-rivadavia-10060/',
'varela-605609/',
'gaona-1290/',
'lima-277/',
'av-santa-fe-927/',
'libertad-1630/',
'triunvirato-3551/',
'av-cordoba-6075-2/',
'av-la-plata-1216/',
'tte-gral-juan-d-peron-2807/',
'rivadavia-10538/',
'valle-509/',
'tte-gral-juan-domingo-peron-1901/',
'av-dorrego-1034/',
'av-alvarez-thomas-2423/',
'av-ricardo-balbin-4881/',
'av-rivadavia-2089/',
'av-scalabrini-ortiz-918/',
'av-boedo-431/',
'cuenca-1560/',
'av-juan-b-justo-5030/',
'av-san-martin-1372/',
'viamonte-1535/',
'av-independencia-838/',
'suipacha-715/',
'gurruchaga-1824/',
'amenabar-1145/',
'av-dorrego-1747/',
'av-de-los-corrales-7325/',
'av-rivadavia-680/',
'rio-de-janeiro-844/',
'av-san-martin-3172/',
'av-de-mayo-1431/',
'av-corrientes-3853/',
'lacroze-3642/',
'av-directorio-5024/',
'av-la-plata-1570/',
'juramento-2445/',
'av-general-las-heras-2421/',
'soldado-de-la-independencia-1236/',
'humbodt-1574/',
'sarmiento-814/',
'junin-638/',
'juan-b-alberdi-4459/',
'av-directorio-5640/',
'freire-954/',
'av-de-los-constituyentes-5380/',
'segurola-1438/',
'avenida-del-libertador-6144/',
'avenida-corrientes-4938/',
'avenida-alvarez-thomas-3198/',
'avenida-santa-fe-4607/',
'avenida-federico-lacroze-2178/',
'avenida-escalada-2341/',
'estado-de-israel-4758/',
'avenida-cabildo-1434/',
'av-triunvirato-3217/',
'peru-486/',
'juan-b-justo-7533/',
'gorriti-4955/',
'tte-gral-juan-domingo-peron-927/',
'avenida-pueyrredon-1070/',
'el-salvador-5675/',
'av-monroe-1616/',
'ciudad-de-la-paz-1984/',
'av-scalabrini-ortiz-1647/',
'jose-bonifacio-1773/',
'av-lope-de-vega-3472/',
'patron-6273/',
'av-triunvirato-4933/',
'avenida-monroe-2442/',
'av-elcano-3521/',
'paraguay-788/',
'fitz-roy-2292/',
'gurruchaga-431/',
'dr-tomas-m-de-anchorena-541/',
'avenida-congreso-1802/',
'maipu-512/',
'ricardo-balbin-3650/',
'juan-francisco-segui-4668/',
'avenida-chiclana-3683/',
'murguiondo-3236/',
'avenida-manuel-montes-de-oca-1438/',
'av-rivadavia-8378/',
'montiel-3829/',
'av-olivera-1268/',
'av-boyaca-37/',
'avenida-rivadavia-7370/',
'avenida-nazca-1316/',
'tte-gral-juan-domingo-peron-2560/',
'av-cramer-2875/',
'av-directorio-134/',
'avenida-juan-bautista-alberdi-258/',
'avenida-la-plata-1976/',
'av-tte-gral-donato-alvarez-1532/',
'av-cabildo-3140/',
'avenida-int-francisco-rabanal-2265/',
'ortega-y-gasset-1782/',
'av-lope-de-vega-1155/',
'avenida-juan-b-justo-2540/',
'pedernera-280/',
'guayaquil-264/',
'av-cordoba-4085/',
'av-regimiento-de-patricios-1214/',
'avenida-almirante-brown-803/',
'av-raul-scalabrini-ortiz-81/',
'san-jose-1819/',
'av-de-los-constituyentes-6047/',
'avenida-salvador-maria-del-carril-2424/',
'avenida-olazabal-4832/',
'avenida-cobo-1477/',
'av-gral-paz-10674/',
'humberto-primero-1696/',
'alvarez-thomas-849/',
'bernardo-de-irigoyen-1518/',
'av-de-los-incas-4355/',
'av-rivadavia-3050/',
'avenida-gral-fernandez-de-la-cruz-3596/',
'avenida-gral-iriarte-2262/',
'av-eva-peron-4139/',
'esquiu-1001/',
'av-ricardo-balbin-2902/',
'lima-1457/',
'av-corrientes-3534/',
'gallo-1201/',
'av-eva-peron-5887/',
'av-nazca-404446/',
'crisologo-larralde-3012/',
'charcas-2725/',
'av-diaz-velez-4458/',
'amenabar-2369/',
'av-santa-fe-5222/',
'marcelo-t-de-alvear-1459/',
'av-gaona-2416/',
'sarandi-260/',
'azcuenaga-145961/',
'emilio-castro-7471/',
'charcas-325961/',
'av-gaona-316567/',
'acoyte-232/',
'av-alvarez-thomas-1520/',
'montaneses-2014/',
'av-san-martin-69485052/',
'av-alberdi-669193/',
'av-cabildo-3822/',
'berutti-3434/',
'migueletes-7526/',
'matheu-1730/',
'riobamba-1014/',
'arcos-2192/',
'san-juan-1932/',
'scalabrini-ortiz-2067/',
'monroe-1911/',
'san-juan-4231/',
'sarmiento-12828486/',
'av-eva-peron-179094/',
'lacarra-574/',
'general-jose-gervasio-artigas-5467-5469-5471/',
'thames-2447/',
'rojas-243/',
'av-de-los-incas-5260/',
'av-federico-lacroze-2842/',
'av-rivadavia-10872/',
'av-cordoba-5101/',
'guayaquil-8879/',
'av-segurola-45660/',
'av-nazca-254248/',
'av-alvarez-jonte-220119/',
'sanabria-2930/',
'av-avellaneda-21024/',
'av-varela-1189/',
'av-forest-555/',
'av-pedro-goyena-1373/',
'av-regimiento-de-patricios-7959/',
'av-rivadavia-35668/',
'jose-hernandez-246971/',
'bolivar-9536163/',
'av-saenz-769/',
'av-corrientes-197880/',
'medrano-1235/',
'av-directorio-4724/',
'av-caseros-2068/',
'av-eva-peron-37293133/',
'av-san-juan-3153/',
'av-corrientes-6180/',
'av-triunvirato-5480/',
'monroe-4278/',
'manuela-pedraza-2152/',
'av-cabildo-4625/',
'hidalgo-860/',
'av-rivadavia-9650/',
'castanares-4944/',
'sarmiento-397880/',
'mariano-acosta-3558/',
'la-rioja-465/',
'av-segurola-1178/',
'av-triunvirato-3981/',
'av-san-martin-1732/',
'av-juan-bautista-alberdi-4730/',
'emilio-lamarca-1965/',
'av-nazca-1663/',
'somellera-5663/',
'av-jose-maria-moreno-77981/',
'av-alvarez-jonte-4471/',
'av-lisandro-de-la-torre-1151/',
'av-juan-bautista-alberdi-5925/',
'av-rivadavia-7850/',
'av-asamblea-96870/',
'gral-jose-gervasio-artigas-4746/',
'cnl-martiniano-chilavert-65704/',
'suarez-4959/',
'nogoya-3235/',
'av-boedo-8757/',
'av-raul-scalabrini-ortiz-367/',
'av-nazca-684/',
'av-rivadavia-2446/',
'av-la-plata-564/',
'av-alvarez-jonte-5240/',
'jose-leon-suarez-3024/',
'av-san-martin-2687/',
'av-entre-rios-735/',
'av-caseros-2938/',
'av-san-juan-2641/',
'gral-jose-gervasio-artigas-26/',
'av-corrientes-4474/',
'av-rivadavia-8875/',
'20-de-septiembre-341/',
'av-francisco-beiro-3146/',
'andonaegui-2129/'
]

var procesados = 0
var allComercios = []
var PouchDB = require('pouchdb')
var db = new PouchDB(comercios_db)

function obtenerIdSucursal(com){

  var options = {
    hostname: hostname,
    port: 443,
    path: '/prod/sucursales?lat='+com.ubicacion.coordinates[0]+
              '&lng='+com.ubicacion.coordinates[1]+'&limit=1',
    method: 'GET',
    headers: headers
  }

  var req = http.request(options, (res) => {
    var data = ''

    res.on('data', (d) =>{
      data += d
    })

    res.on('end', () => {
      var respData = JSON.parse(data.toString())
      //console.log(respData)
      console.log(respData.sucursales[0].id + ' - ' + respData.sucursales[0].sucursalId)

      com._id = respData.sucursales[0].id
      com.id_cadena = '12'
      com.id_sucursal = respData.sucursales[0].sucursalId

      console.log(JSON.stringify(com))
      allComercios.push(com)

      if (writeDB){

        db.put(com).then(function(resp){
          console.log(suc + ' => OK. ' + resp.id)
        }).catch(function(err){
          console.log(suc + ' => ERR. ' + err)
        })

      }

      procesados++
      console.log(procesados)
      if (procesados == sucursales.length)
        emitter.emit('end')
    })

  })

  req.end()
}

sucursales.forEach(function(suc){
  setTimeout(function(){

    return http.get({
        host: 'www.supermercadosdia.com.ar',
        path: '/sucursales/' + suc
    }, function(response) {
        var body = ''

        response.on('data', function(d) {
            body += d
        })

        response.on('end', function() {
          var parsed = body.toString()

          try{

            var regex = /\<h4\>Dirección\<\/h4\>[^<]*\<p class\=\"gray\"\>[^<]*\<strong\>([^<]+)\<\/strong\>[^<]*\<br\>([^<]+)\<br\>/
            var direccion = parsed.match(regex)[1].trim()
            var zona = parsed.match(regex)[2].trim().replace(/,.*$/, '')

            regex = /LatLng\(([-.0-9]+)\s*,\s*([-.0-9]+)\)/
            var coords = [parsed.match(regex)[1], parsed.match(regex)[2]]

            var comercio = {

                direccion: direccion,
                horario: [
                  "8:30 a 21:30",
                  "8:30 a 21:30",
                  "8:30 a 21:30",
                  "8:30 a 21:30",
                  "8:30 a 22:00",
                  "8:30 a 22:00",
                  "9:00 a 21:30"
                ],
                nombre: zona,
                provincia: 'BUENOS AIRES',
                telefonos: '',
                tipo: '',
                ubicacion: {
                  type: 'Point',
                  coordinates: [parseFloat(coords[0]), parseFloat(coords[1])]
                },
                zona: 'CAPITAL FEDERAL',
                cadena: 'DIA'

            }

            obtenerIdSucursal(comercio)

          }catch(err){
            procesados++
            console.log(err)
          }

        })

      })

  }, 30000 * Math.random() + 50)

})

emitter.on('end', function(){
  require('fs').writeFile(outputFile, JSON.stringify(allComercios), function(err, res){
    if (err) console.log('Se guardo el archivo ERR. ' + err)

    console.log('Se guardo el archivo OK.')
  })
})
