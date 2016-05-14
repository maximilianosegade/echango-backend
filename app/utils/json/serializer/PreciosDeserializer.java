package utils.json.serializer;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;

import models.Comercio;
import models.Geolocalizacion;
import models.Precio;
import models.Producto;
import models.User;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

public class PreciosDeserializer extends JsonDeserializer<Precio> {
	
	private static final String GMT_DATEFORMAT = "EEE MMM dd HH:mm:ss zzz yyyy";

	@Override
	public Precio deserialize(JsonParser jp, DeserializationContext ctxt)
			throws IOException, JsonProcessingException {
		Precio unPrecio = new Precio();
		
		JsonNode node = jp.getCodec().readTree(jp);
		unPrecio._id = node.get("_id").asText();
		unPrecio.importe = new BigDecimal(node.get("importe").asText()).movePointLeft(2);
    	unPrecio.comercio = new Comercio();
    	unPrecio.comercio._id = node.get("comercio").asText();
    	unPrecio.comercio.geolocalizacion = new Geolocalizacion();
    	unPrecio.comercio.geolocalizacion.longitud = node.get("ubicacion").get("coordinates").get(0).asText();
    	unPrecio.comercio.geolocalizacion.latitud = node.get("ubicacion").get("coordinates").get(1).asText();
    	try {
			unPrecio.fecha = new SimpleDateFormat(GMT_DATEFORMAT,Locale.US).parse(node.get("fecha").asText());
		} catch (ParseException e) {
			throw new RuntimeException(e);
		}
    	unPrecio.producto = new Producto();
    	unPrecio.producto.ean = node.get("ean").asText();
    	unPrecio.producto.descripcion = node.get("descripcion").asText();
    	unPrecio.usuario = new User();
    	unPrecio.usuario._id = node.get("usuario").asText();
    	
		return unPrecio;
	}

}
