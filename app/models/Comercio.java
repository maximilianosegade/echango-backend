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
	
	@Override
	public String toString() {
		return "_id: {"					+_id						+"} "+
				"empresa: {"			+nombreEmpresa				+"} "+
				"tipo: {"				+tipo						+"} "+
				"telefono: {"			+telefono					+"} "+
				"direccion: {"			+(direccion!=null?direccion.toString():"null")				+"} "+
				"geolocalizacion: {"	+(geolocalizacion!=null?geolocalizacion.toString():"null")	+"}";
	}
}
