package services;

import java.util.List;
import java.util.Map;

import models.DistanciaGeoEspacial;
import models.Geolocalizacion;
import models.Precio;
import models.Producto;

public interface Precios {
	/**
	 * Obtengo un precio por ID
	 */
	Precio get(String id);
	
	/**
	 * Agregar uno o mas precios.
	 */
	Map<String, String> add(List<Precio> precios);

	/**
	 * Bucar precios mas bajos que el solicitado, dentro de un radio
	 * determinado.
	 */
	List<Precio> preciosMasBajos(Precio unPrecio, DistanciaGeoEspacial radioCercania);

	/**
	 * Bucar precios mas bajos de los productos solicitados, contemplando zonas
	 * de compra preferidas dentro de un radio determinado.
	 */
	void preciosMasBajos(List<Producto> productos,
			List<Geolocalizacion> puntosCompraPreferidos,
			DistanciaGeoEspacial radioCercania);
}
