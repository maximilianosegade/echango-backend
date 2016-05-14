package models;

public class DistanciaGeoEspacial {
	public enum Unidad { KM }
	
	public Double longitud;
	public Unidad unidad;
	
	public Double asRadians(){
		return longitud / 6378.1;
	};
	
	@Override
	public String toString() {
		return "longitud: {"	+longitud	+"} "+
				"unidad: {"		+unidad		+"}";
	}
}
