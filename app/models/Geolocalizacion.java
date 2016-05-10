package models;

import java.util.ArrayList;
import java.util.List;

public class Geolocalizacion {
	public String tipo;
	public List<Float> coordenadas;
	
	public Geolocalizacion() {
		coordenadas = new ArrayList<Float>();
	}
}
