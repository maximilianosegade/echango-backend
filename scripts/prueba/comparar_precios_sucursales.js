var sucursales = ["12-1-56","12-1-91","12-1-186","12-1-203"];
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


/*var findProducto = function(db, ean_id, callback) {
    var cursorProd = db.collection("productos").find({"ean":ean_id})
    cursorProd.each(function(err, prod) {
        assert.equal(err,null)
        if (prod !=null) {
            console.log("Producto encontrado")
            console.log(prod.ean)
            callback(prod)
        } else {
            callback()
        }
    })
}*/

var findProducto = function(db, id_ean, callback) {
    db.collection("productos").find({"ean":id_ean}).toArray(function(err,prod){
        if(err){
            console.log(err)
            callback(err)
        } else if (prod.length) {
            console.log("Producto encontrado")
            callback(prod)
        } else {
            console.log("Producto no encontrado")
            callback()
        }
    })
}

/*var findSucursal = function(db, id_suc, callback) {
    var cursorSuc = db.collection("sucursales").find({"id_sucursal":id_suc})
    cursorSuc.each(function(err, suc) {
        assert.equal(err,null)
        if (suc != null) {
            console.log("Sucursal encontrada")
            console.log(suc._id)
            callback(suc)
        } else {
            callback()
        }
    })
}*/

var findSucursal = function(db, id_suc, callback) {
    var sucursales = db.collection("sucursales")
    sucursales.find({"id_sucursal":id_suc}).toArray(function(err,suc){
        if(err){
            console.log(err)
            callback(err)
        } else if (suc.length) {
            console.log("Sucursal encontrada")
            callback(suc)
        } else {
            console.log("Producto no encontrado")
            callback()
        }
    })
}

function findPrecio(precios){
    return precios.ean === "7790670050650"
}

var util = require ('util')
MongoClient.connect('mongodb://localhost:27017/echango', function(err, db) {
    assert.equal(null,err)
    console.log("Ejecutando findProducts")
    findProducto(db,"7790670050650", function(producto) {
        console.log(JSON.stringify(producto))
        })
    findSucursal(db, "91", function(sucursal) {
        console.log(util.inspect(sucursal, {depth: 1}));
        sucursal.precios.{}.find("ean":"7790670050650").toArray(function(err,precios))
        //var precio = sucursal.precios.find({"ean":"7790670050650"})
        db.close()
    })
})
    /*productos.count({}, function(err, numDocs) {
        console.log("Se han encontrado "+numDocs+" productos en la base")
    })
    for (var i = 0, len = numDocs; i < len; i++ ) {
        console.log(productos[i].ean)
    }*/
