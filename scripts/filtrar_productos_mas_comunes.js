// Script config.
const filePathAllProductos = 'carga_mongo/files/lista_productos.js'
const filePathProductosComunesId = 'prod_mas_comunes.js'
const output = 'carga_mongo/files/lista_productos_mas_comunes.js'
const cantMinimaDeComerciosDisponible = 10

console.log('Start: ' + new Date())

var allProd = obtenerListaDeProductos()
var filtrar = obtenerDisponibilidadProdEnComercios()
var prodFiltrados = []
var i,
    j,
    debeFiltrar

console.log('Lista de elementos eliminados (total inicial: ' + allProd.length + ')')

for (i=0; i<allProd.length; i++){
    debeFiltrar = false;
    
    for (j=0; j<cantMinimaDeComerciosDisponible; j++){
        if (filtrar[j.toString()].indexOf(allProd[i].ean) != -1){
            //console.log('Filtrar ean ' + allProd[i].ean)
            debeFiltrar = true
            break;
        }
    }
    
    if (!debeFiltrar)
        prodFiltrados.push(allProd[i])
    else
        console.log(allProd[i].ean + ' - ' + allProd[i].descripcion)
}    

console.log('Total de descartados: ' + ((allProd.length - prodFiltrados.length) * 100 / allProd.length) + '%')

guardarListaFinal()

function obtenerListaDeProductos(){
  var data = require('fs').readFileSync(filePathAllProductos)
  return JSON.parse(data)
}

function obtenerDisponibilidadProdEnComercios(){
  var data = require('fs').readFileSync(filePathProductosComunesId)
  return JSON.parse(data)
}

function guardarListaFinal(){
    require('fs').writeFile(output, JSON.stringify(prodFiltrados), (err) =>{
        if (err) throw err;
        console.log('Se genero el archivo OK.')
        console.log('End: ' + new Date())
    })
}