package models;

import org.jongo.marshall.jackson.oid.MongoId;
import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Comercio {
	@MongoId @MongoObjectId
	public String _id;
	
	public String nombreEmpresa;
	public String tipo;
	public String telefono;
	public Direccion direccion;
	public Geolocalizacion geolocalizacion;	
}
