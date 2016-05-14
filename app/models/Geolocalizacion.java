package models;

import java.math.BigDecimal;


public class Geolocalizacion {
	public BigDecimal longitud;
	public BigDecimal latitud;
	
	@Override
	public String toString() {
		return "longitud: {" 	+(longitud!=null?longitud.toPlainString():"") 	+ "} "+
				"latitud: {"	+(latitud!=null?latitud.toPlainString():"") 	+ "}";
	}
}
