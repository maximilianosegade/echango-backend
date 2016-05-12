package controllers;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;

import org.jongo.Jongo;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.JacksonMapper;

import models.Comercio;
import models.Geolocalizacion;
import models.Precio;
import models.Producto;
import models.User;
import play.mvc.Controller;
import play.mvc.Result;
import utils.json.serializer.GeolocalizacionSerializer;
import utils.json.serializer.PreciosSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.mongodb.MongoClient;

public class PreciosController extends Controller {

    public Result alta() {
        return TODO;
    }
    
    public Result preciosMasBajos(){
    	// TODO: Validar el precio ingresado.
    	
    	// TODO: Binding desde request.
    	
    	// Solo para test, hardcodeo un precio.
    	Precio unPrecio = unPrecio();

//    	ObjectMapper mapper = new ObjectMapper().registerModule(
//    			new SimpleModule()
//    				.addSerializer(Precio.class, new PreciosSerializer())
//    				.addSerializer(Geolocalizacion.class, new GeolocalizacionSerializer())
//    			);
    	
    	String resultado = "";
//    	try {
//			resultado = mapper.writeValueAsString(unPrecio);
//		} catch (Exception e) {
//			return badRequest(e.getMessage());
//		}
    	
    	// TODO: Inyectar dependencia de Jongo.
    	MongoClient mongoClient = new MongoClient("ec2-52-39-199-128.us-west-2.compute.amazonaws.com");
    	@SuppressWarnings("deprecation")
		Jongo jongo = new Jongo(mongoClient.getDB("echango"), 
				new JacksonMapper.Builder()
			      .registerModule(new SimpleModule()
			      	.addSerializer(Precio.class, new PreciosSerializer())
			      	.addSerializer(Geolocalizacion.class, new GeolocalizacionSerializer()))
			      .build()
			      );
    	
    	MongoCollection precios = jongo.getCollection("precios");
    	MongoCollection comercios = jongo.getCollection("comercios");
    	try{
    		precios.insert(unPrecio);
    		resultado = comercios.findOne().as(Comercio.class)._id;
    	}catch(Exception e){
    		// TODO: Definir politica para manejar la excepcion.
    		// Se el va a mostrar algun mensaje al usuario en caso de error? Tiene sentido?
    		return badRequest(e.getMessage());
    	}finally {
    		// TODO: Analizar como maneja Mongo Java Driver / Jongo el cierre de recursos, pooling, thread safety, etc.
    		mongoClient.close();
		}
    	
    	return ok(resultado);
    }

	private Precio unPrecio() {
		Precio unPrecio = new Precio();
    	unPrecio.importe = new BigDecimal("1685").movePointLeft(2);
    	unPrecio.fecha = new Date();
    	unPrecio.comercio = new Comercio();
    	unPrecio.comercio._id = "5735087857249804c5ad91fc";
    	unPrecio.comercio.nombreEmpresa = "COTO";
    	unPrecio.comercio.geolocalizacion = new Geolocalizacion();
    	unPrecio.comercio.geolocalizacion.longitud="-58.395639";
    	unPrecio.comercio.geolocalizacion.latitud="-34.726888";
    	unPrecio.producto = new Producto();
    	unPrecio.producto.ean = "573401b762c3640afc481829";
    	unPrecio.producto.descripcion = "Sopa Knorr Quick";
    	unPrecio.producto.categorias = Arrays.asList(new String[]{"sopa","alimento"});
    	unPrecio.usuario=new User();
    	unPrecio.usuario._id="5735087857249804c5ad91fe";
		return unPrecio;
	}

}
