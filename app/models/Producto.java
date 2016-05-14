package models;

import java.util.List;

import org.jongo.marshall.jackson.oid.MongoId;
import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Producto {
	@MongoId @MongoObjectId
	public String _id;
	public String ean;
    public String descripcion;
    public List<String> categorias;
}
