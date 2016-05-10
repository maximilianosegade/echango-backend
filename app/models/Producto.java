package models;

import java.util.List;

import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Producto {
	@MongoObjectId
	public String ean;
    public String descripcion;
    public List<String> categorias;
}
