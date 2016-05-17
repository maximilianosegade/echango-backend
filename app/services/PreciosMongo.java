package services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Singleton;

import org.bson.types.ObjectId;
import org.joda.time.DateTime;
import org.jongo.Jongo;
import org.jongo.MongoCursor;
import org.jongo.marshall.jackson.JacksonMapper;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.mongodb.MongoClient;

import models.DistanciaGeoEspacial;
import models.Geolocalizacion;
import models.Precio;
import models.Producto;
import utils.json.serializer.GeolocalizacionSerializer;
import utils.json.serializer.PreciosDeserializer;
import utils.json.serializer.PreciosSerializer;

@Singleton
public class PreciosMongo implements Precios {

	private Jongo mongoClient;  
	
	public PreciosMongo() {
		//TODO: Parametrizar conexion a la DB.
		String host = "ec2-52-36-82-237.us-west-2.compute.amazonaws.com";
		Integer port = 27017;
		String dbName = "echango";
		mongoClient = new Jongo(new MongoClient(host, port).getDB(dbName),
				new JacksonMapper.Builder().registerModule(
						new SimpleModule()
							.addSerializer(Precio.class, new PreciosSerializer())
							.addSerializer(Geolocalizacion.class, new GeolocalizacionSerializer())
							.addDeserializer(Precio.class, new PreciosDeserializer())
				).build()
		);
	}
	
	@Override
	public Precio get(String id) {
		return mongoClient.getCollection("precios").findOne(new ObjectId(id))
				.as(Precio.class);
	}
	
	@Override
	public Map<String, String> add(List<Precio> precios) {
		Map<String, String> idPreciosAgregados = new HashMap<String, String>();
		for (Precio unPrecio: precios){
			mongoClient.getCollection("precios").save(unPrecio);
			idPreciosAgregados.put(unPrecio.producto.ean, unPrecio._id);
		}
		
		return idPreciosAgregados;
	}

	@Override
	public List<Precio> preciosMasBajos(Precio unPrecio, DistanciaGeoEspacial radioCercania) {
		MongoCursor<Precio> cursor = mongoClient.getCollection("precios").find(
				"{" +
					"importe: { $lt: # },"+
					"fecha: { $gt: # },"+
					"ean: #,"+
					"ubicacion: {"+
						"$geoWithin: {"+
							"$centerSphere : [ [#,#] , # ]"+
						"}"+
                  	"}"+
				"}",
				unPrecio.importe.unscaledValue().intValue(),
				//TODO: Definir la ventana horaria de busqueda de precios mas bajos.
				// Por el momento es desde este momento, un dia para atras.
				DateTime.now().minusDays(1).toDate(),
				unPrecio.producto.ean,
				unPrecio.comercio.geolocalizacion.longitud.floatValue(),
				unPrecio.comercio.geolocalizacion.latitud.floatValue(),
				radioCercania.asRadians())
				.as(Precio.class);
		
		List<Precio> preciosMasBajos = new ArrayList<Precio>();
		try{
			while(cursor.hasNext()){
				preciosMasBajos.add(cursor.next());
			}
		}finally{
			try {
				cursor.close();
			} catch (IOException e) {}
		}
		
		return preciosMasBajos;
	}

	@Override
	public void preciosMasBajos(List<Producto> productos,
			List<Geolocalizacion> puntosCompraPreferidos,
			DistanciaGeoEspacial radioCercania) {
		// TODO Auto-generated method stub

	}

}
