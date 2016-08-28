var MongoClient = require('mongodb').MongoClient
var fs = require('fs')
var prodPath = './files/productos'

MongoClient.connect('mongodb://localhost:27017/echango', function(err, db) {
	if(err) throw err

	var productos = fs.readdirSync(prodPath)
	//console.log(productos)

	// Obtengo todos los nombres de archivos de productos.
	productos.forEach((prodFileName) => {
		//console.log(prodFileName)

		var categoria = prodFileName.split('_')[1]
		//console.log('Procesando categoria: ' + categoria)

		fs.readFile(prodPath + '/' + prodFileName, (err, data) => {
			// Obtengo todos los ID prod de esa cat.
			var idProds = []
			JSON.parse(data).productos.forEach((prod) =>{
				idProds.push(prod.id)
			})
			console.log(idProds)

			db.collection('productos').updateMany(
      	{ "ean": { $in: idProds } },
      	{
        	$push: { categorias: categoria }
        },
      	function(err, results) {
        	console.log(results)
   			}
			)

		})

	})

})
