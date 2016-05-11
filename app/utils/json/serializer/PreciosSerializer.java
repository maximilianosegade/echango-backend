package utils.json.serializer;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import models.Precio;

public class PreciosSerializer extends JsonSerializer<Precio> {

	@Override
	public void serialize(Precio value, JsonGenerator jgen, SerializerProvider provider)
			throws IOException, JsonProcessingException {
		jgen.writeStartObject();
        jgen.writeStringField("importe", value.importe.toString());
        jgen.writeStringField("fecha", value.fecha.toString());
        jgen.writeObjectField("ubicacion", value.comercio.geolocalizacion);
        jgen.writeEndObject();	
	}

}
