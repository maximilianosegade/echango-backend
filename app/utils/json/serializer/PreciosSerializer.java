package utils.json.serializer;

import java.io.IOException;
import java.util.Map.Entry;

import models.Precio;
import models.User;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.util.ISO8601DateFormat;

public class PreciosSerializer extends JsonSerializer<Precio> {

	@Override
	public void serialize(Precio value, JsonGenerator jgen, SerializerProvider provider)
			throws IOException, JsonProcessingException {
		jgen.writeStartObject();
        jgen.writeStringField("importe", value.importe.toString());
        jgen.writeStringField("ean", value.producto.ean);
        jgen.writeStringField("descripcion", value.producto.descripcion);
        jgen.writeStringField("fecha", ISO8601DateFormat.getDateTimeInstance().format(value.fecha));
        jgen.writeStringField("comercio", value.comercio.id);
        jgen.writeArrayFieldStart("registros");
        for (Entry<String, User> unRegistro : value.registros.entrySet()){
        	jgen.writeStartObject();
        	jgen.writeStringField("timestamp", unRegistro.getKey());
        	jgen.writeStringField("usuario", unRegistro.getValue().username);
        	jgen.writeEndObject();
        }
        jgen.writeEndArray();
        jgen.writeObjectField("ubicacion", value.comercio.geolocalizacion);
        jgen.writeEndObject();	
	}

}
