package utils.json.serializer;

import java.io.IOException;

import org.bson.types.ObjectId;

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
		jgen.writeObjectField("fecha", value.fecha);
		jgen.writeStringField("ean", value.producto.ean);
		jgen.writeStringField("descripcion", value.producto.descripcion);
        jgen.writeStringField("importe", value.importe.toString());
        jgen.writeObjectField("comercios", new ObjectId(value.comercio._id));
        jgen.writeObjectField("usuario", new ObjectId(value.usuario._id));
        jgen.writeObjectField("ubicacion", value.comercio.geolocalizacion);
        jgen.writeEndObject();	
	}

}
