package controllers;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import models.DistanciaGeoEspacial;
import models.Precio;
import play.libs.Json;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Result;
import services.Precios;

import com.fasterxml.jackson.databind.JsonNode;

public class PreciosController extends Controller {

	@Inject
	private Precios precios;

	@BodyParser.Of(BodyParser.Json.class)
    public Result alta() {
		final JsonNode arrayNode = request().body().asJson();
		List<Precio> preciosNuevos = new ArrayList<Precio>();
		for (final JsonNode objNode : arrayNode) {
			preciosNuevos.add(Json.fromJson(objNode, Precio.class));
		}

    	// TODO: Validar el precio ingresado.
    	
    	List<String> idPreciosAgregados = precios.add( preciosNuevos );
    	
    	return ok(Json.toJson(idPreciosAgregados));
    }
    
	/**
	 * Obtiene una lista de precios mas bajos en otros comercios, en un radio
	 * determinado, para el producto solicitado.
	 */
    public Result preciosMasBajos(String id){
    	Precio unPrecio = precios.get(id);
    	
    	//TODO: Validar que el precio ingresado exista.
    	
    	// TODO: La distancia maxima deberia ser configurable.
    	DistanciaGeoEspacial distancia = new DistanciaGeoEspacial();
    	distancia.longitud=Double.valueOf(1);
    	distancia.unidad=DistanciaGeoEspacial.Unidad.KM;
    	
		// TODO: Establecer politica para definir ventana de busqueda de precios
		// desde el momento de la consulta hacia atras.
    	
    	return ok(Json.toJson(precios.preciosMasBajos(unPrecio, distancia)));
    }

}
