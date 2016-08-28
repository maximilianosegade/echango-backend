var MongoClient = require('mongodb').MongoClient
var prodPath = './files'

MongoClient.connect('mongodb://localhost:27017/echango', function(err, db) {

	db.collection('categorias', (err, col) => {

		require('fs').readFile(prodPath + '/lista_categorias.js', {encoding:'utf8'}, (err, data) => {

			var prods = JSON.parse(data)
			col.insertMany(prods, (err, result) => {
					console.log(result)
					db.close()
			})

		})

	})

})
