package models;

import java.util.ArrayList;
import java.util.List;

import org.jongo.marshall.jackson.oid.MongoId;
import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Producto {
	@MongoId @MongoObjectId
	public String _id;
	public String ean;
    public String descripcion;
    public List<String> categorias;
    
    public Producto() {
    	categorias=new ArrayList<String>();
    }
    
    @Override
    public String toString() {
    	String msg =
    			"_id: {"			+_id+"} "+
    			"ean: {"			+ean+"} "+
    			"descripcion: {"	+descripcion+"} "+
    			"categorias: [";
   				for (String categoria: categorias){
   					msg += categoria + "-";
   				}
   				msg +="]";
   		return msg;
    }
}
