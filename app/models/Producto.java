package models;

import java.util.List;

import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Producto {
	public String ean;
    public String descripcion;
    public List<String> categorias;
}
