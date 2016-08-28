var MongoClient = require('mongodb').MongoClient
var prodPath = './files'

MongoClient.connect('mongodb://localhost:27017/echango', function(err, db) {

	db.collection('comercios', (err, col) => {

		require('fs').readFile(prodPath + '/lista_comercios.js', {encoding:'utf8'}, (err, data) => {

			var prods = JSON.parse(data)
			col.insertMany(prods, (err, result) => {
					console.log(result)

					col.createIndex( { "ubicacion" : "2dsphere" }, (err, result2) => {
						db.close()
						console.log('Indice creado por ubicacion')
					})
			})

		})

	})

})
