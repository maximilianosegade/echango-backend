package models;

import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Comercio {
	@MongoObjectId
	public String id;
	
	public String nombreEmpresa;
	public String tipo;
	public String telefono;
	public Direccion direccion;
	public Geolocalizacion geolocalizacion;	
}
