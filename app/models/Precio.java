package models;

import java.math.BigDecimal;
import java.util.Date;

import org.jongo.marshall.jackson.oid.MongoId;
import org.jongo.marshall.jackson.oid.MongoObjectId;

public class Precio {
	@MongoId @MongoObjectId
	public String _id;
	public BigDecimal importe;
	public Date fecha;
    public Producto producto;
    public Comercio comercio;
    public User usuario;
    
    @Override
    public String toString() {
    	return "_id: [" + _id + "] "+
    			"importe: [" + importe.toPlainString() + "] "+
    			"fecha: [" + fecha + "] "+
    			"producto: [" + producto.ean + "] " + 
    			"comercio: [" + comercio._id + "] " +
    			"usuario: [" + usuario._id + "].";
    }
}
