package utils.json.serializer;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import models.Geolocalizacion;

public class GeolocalizacionSerializer extends JsonSerializer<Geolocalizacion> {

	@Override
	public void serialize(Geolocalizacion value, JsonGenerator jgen, SerializerProvider provider)
			throws IOException, JsonProcessingException {
		jgen.writeStartObject();
		jgen.writeStringField("type", "Point");
		jgen.writeArrayFieldStart("coordinates");
		jgen.writeNumber(value.longitud);
		jgen.writeNumber(value.latitud);
		jgen.writeEndArray();
        jgen.writeEndObject();	
	}

}
