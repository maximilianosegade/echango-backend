package controllers;

import java.math.BigDecimal;
import java.util.Date;

import models.Comercio;
import models.Geolocalizacion;
import models.Precio;

import org.jongo.Jongo;
import org.jongo.MongoCollection;

import play.mvc.Controller;
import play.mvc.Result;

import com.mongodb.MongoClient;

public class PreciosController extends Controller {

    public Result alta() {
        return TODO;
    }
    
    public Result preciosMasBajos(){
    	Precio unPrecio = new Precio();
//    	unPrecio.comercio = ;
    	unPrecio.importe = new BigDecimal("1685").movePointLeft(2);
    	unPrecio.fecha = new Date();
    	unPrecio.comercio = new Comercio();
    	unPrecio.comercio.nombreEmpresa = "COTO";
    	unPrecio.comercio.geolocalizacion = new Geolocalizacion();
    	unPrecio.comercio.geolocalizacion.tipo = "Point";
    	unPrecio.comercio.geolocalizacion.coordenadas.add(-58.395639F);
    	unPrecio.comercio.geolocalizacion.coordenadas.add(-34.726888F);
//    	unPrecio.producto = ;
    	
    	MongoClient mongoClient = new MongoClient("localhost",27017);
    	@SuppressWarnings("deprecation")
		Jongo jongo = new Jongo(mongoClient.getDB("echango"));
    	MongoCollection precios = jongo.getCollection("precios");
    	precios.insert(unPrecio);
    	mongoClient.close();
    	return TODO;
    }

}
