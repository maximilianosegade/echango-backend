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
    	return "_id: {" 		+ _id 									+ "} "+
    			"importe: {" 	+ (importe!=null?importe.toPlainString():"") 				+ "} "+
    			"fecha: {" 		+ fecha 								+ "} "+
    			"producto: {" 	+ (producto!=null?producto.toString():"") 					+ "} " + 
    			"comercio: {" 	+ (comercio!=null?comercio.toString():"") 					+ "} " +
    			"usuario: {" 	+ (usuario!=null?usuario.toString():"") 					+ "} " +
				"ubicacion: {"	+ (comercio != null && comercio.geolocalizacion != null ? 
										comercio.geolocalizacion.toString() : "") 			+ "}";
    }
}
