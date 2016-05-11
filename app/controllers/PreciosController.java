package controllers;

import java.math.BigDecimal;
import java.util.Date;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;

import models.Comercio;
import models.Geolocalizacion;
import models.Precio;
import play.mvc.Controller;
import play.mvc.Result;
import utils.json.serializer.GeolocalizacionSerializer;
import utils.json.serializer.PreciosSerializer;
import views.html.*;

public class PreciosController extends Controller {

    public Result alta() {
        return TODO;
    }
    
    public Result preciosMasBajos(){
    	// TODO: Validar el precio ingresado.
    	
    	// TODO: Binding desde request.
    	
    	// Solo para test, hardcodeo un precio.
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

    	ObjectMapper mapper = new ObjectMapper().registerModule(
    			new SimpleModule()
    				.addSerializer(Precio.class, new PreciosSerializer())
    				.addSerializer(Geolocalizacion.class, new GeolocalizacionSerializer())
    			);
    	
    	String resultado = "Hola";
    	try {
			resultado = mapper.writeValueAsString(unPrecio);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
//	      );
    	
    	// TODO: Inyectar dependencia de Jongo.
//    	MongoClient mongoClient = new MongoClient("localhost",27017);
//    	@SuppressWarnings("deprecation")
//		Jongo jongo = new Jongo(mongoClient.getDB("echango"), 
//				new JacksonMapper.Builder()
//			      .registerModule(new SimpleModule().addSerializer(new PreciosSerializer()))
//			      .build()
//			      );
    	
//    	MongoCollection precios = jongo.getCollection("precios");
//    	try{
//    		precios.insert(unPrecio);
//    	}catch(Exception e){
//    		// TODO: Definir politica para manejar la excepcion.
//    		// Se el va a mostrar algun mensaje al usuario en caso de error? Tiene sentido?
//    	}finally {
//    		// TODO: Analizar como maneja Mongo Java Driver / Jongo el cierre de recursos, pooling, thread safety, etc.
//    		mongoClient.close();
//		}
    	
    	return ok(resultado);
    }

}
