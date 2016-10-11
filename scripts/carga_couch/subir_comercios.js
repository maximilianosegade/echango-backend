// Script config.
const filePathProductos = '../carga_mongo/files/lista_comercios.js'
const comercios_db = 'https://webi.certant.com/echango/comercios'
// End config.

const http = require('https')
const PouchDB = require('pouchdb')
var db = new PouchDB(comercios_db)
var data = JSON.parse(require('fs').readFileSync(filePathProductos))
console.log(data)
db.bulkDocs(data).then(function(){
  console.log('Se guardo en Couch exitosamente!')
}).catch(function(err){
  console.log('Error al persistir en Couch: ' + err)
})
