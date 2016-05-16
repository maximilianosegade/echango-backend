package services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.inject.Singleton;

import models.DistanciaGeoEspacial;
import models.Geolocalizacion;
import models.Precio;
import models.Producto;

import org.bson.types.ObjectId;
import org.jongo.Jongo;
import org.jongo.MongoCursor;
import org.jongo.marshall.jackson.JacksonMapper;

import utils.json.serializer.GeolocalizacionSerializer;
import utils.json.serializer.PreciosDeserializer;
import utils.json.serializer.PreciosSerializer;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.mongodb.MongoClient;

@Singleton
public class PreciosMongo implements Precios {

	private Jongo mongoClient;  
	
	public PreciosMongo() {
		//TODO: Parametrizar conexion a la DB.
		String host = "localhost";
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
	public List<String> add(List<Precio> precios) {
		List<String> idPreciosAgregados = new ArrayList<String>();
		for (Precio unPrecio: precios){
			mongoClient.getCollection("precios").save(unPrecio);
			idPreciosAgregados.add(unPrecio._id);
		}
		
		return idPreciosAgregados;
	}

	@Override
	public List<Precio> preciosMasBajos(Precio unPrecio, DistanciaGeoEspacial radioCercania) {
		MongoCursor<Precio> cursor = mongoClient.getCollection("precios").find(
				"{" +
					"importe: { $lt: # },"+
					"ubicacion: {"+
						"$geoWithin: {"+
							"$centerSphere : [ [#,#] , # ]"+
						"}"+
                  	"}"+
				"}",
				unPrecio.importe.unscaledValue().intValue(),
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
