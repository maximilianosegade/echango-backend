// Script config.
const filePathProductos = '../carga_mongo/files/lista_productos_mas_comunes.js'
const productos_db = 'https://webi.certant.com/echango/productos'
const borrarDb = true
const compactarDb = true
const delay = 100
const EventEmitter = require('events')
// End config.

const http = require('https')
const PouchDB = require('pouchdb')
var db = new PouchDB(productos_db)

db.allDocs().then(function(resp){
    
    if(borrarDb){
        
        var prodABorrar = resp.rows.length
        var borrados = 0
        var i = 0
        var emitter = new EventEmitter()

        console.log('Se van a borrar ' + prodABorrar + ' productos.')

        for (i = 0; i<prodABorrar; i++){
            //console.log('Se va a borrar: ' + resp.rows[i].id + ' - '+ resp.rows[i].value.rev )

            var deleteDoc = function() {
                var deleteDoc = {}

                deleteDoc.id = resp.rows[i].id
                deleteDoc.rev = resp.rows[i].value.rev

                deleteDoc.del = function(){
                    //console.log('Se va a remover: ' + deleteDoc.id + ' - '+ deleteDoc.rev)
                    db.remove(deleteDoc.id, deleteDoc.rev).then(function(){
                        borrados++
                        if (borrados == prodABorrar)
                            emitter.emit('finish', borrados)
                        else
                            emitter.emit('progress', borrados)
                    }).catch(function(err){
                        emitter.emit('error', err)
                    })
                }

                return deleteDoc
            }()

            setTimeout(deleteDoc.del, delay * i)
        }

        return new Promise(function(resolve, reject){

            emitter.on('progress', (p) =>{
                if (p % 50 == 0)
                    console.log('Borrados hasta el momento: ' + p)
            })

            emitter.on('error', (err) =>{
                reject(err)
            })

            emitter.on('finish', () =>{
                console.log('No hay mas elementos que borrar.')
                resolve()
            }) 

        })
    
    } else
        return new Promise(function(resolve, reject){ resolve() })

}).then(function(result){
    
    if(compactarDb){        
        console.log('Se va a compactar la DB...')
        return db.compact()
    }else
        return new Promise(function(resolve, reject){ resolve() })

}).then(function(result){

    var data = JSON.parse(require('fs').readFileSync(filePathProductos))
    console.log('Se van a subir ' + data.length + ' productos.')

    return db.bulkDocs(data)

}).then(function(){
    console.log('Se guardo en Couch exitosamente!')
}).catch(function(err){
    console.log(err)
})
    
