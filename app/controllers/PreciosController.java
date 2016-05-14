package controllers;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;

import javax.inject.Inject;

import models.Comercio;
import models.DistanciaGeoEspacial;
import models.Geolocalizacion;
import models.Precio;
import models.Producto;
import models.User;
import play.mvc.Controller;
import play.mvc.Result;
import services.Precios;

public class PreciosController extends Controller {

	@Inject
	private Precios precios;
	
    public Result alta() {
    	// TODO: Binding desde request.
    	// Solo para test, hardcodeo un precio.
    	Precio unPrecio = unPrecio();

    	// TODO: Validar el precio ingresado.
    	
    	precios.add( Arrays.asList(new Precio[]{unPrecio}) );
    	
    	return ok("Se agrego: " + unPrecio);
    }
    
    public Result preciosMasBajos(){
    	// TODO: Validar el precio ingresado.
    	
    	// TODO: Binding desde request.
    	
    	// Solo para test, hardcodeo un precio.
    	Precio unPrecio = unPrecio();
    	precios.add( Arrays.asList(unPrecio));
    	
    	// TODO: La distancia maxima deberia ser configurable.
    	DistanciaGeoEspacial distancia = new DistanciaGeoEspacial();
    	distancia.longitud=Double.valueOf(1);
    	distancia.unidad=DistanciaGeoEspacial.Unidad.KM;
    	
    	String respuesta = "";
    	for (Precio precio: precios.preciosMasBajos(unPrecio, distancia)){
    		respuesta += precio + "\n";
    	}
    	return ok("Precios mas baratos que {"+ unPrecio.importe+"} relativos al punto {"+ 
    				unPrecio.comercio.geolocalizacion.toString() + "} con un radio de {"+ 
    				distancia + ":\n\n"+ respuesta);
    }

	private static Precio unPrecio() {
		Precio unPrecio = new Precio();
    	unPrecio.importe = new BigDecimal("40.00");
    	unPrecio.fecha = new Date();
    	unPrecio.comercio = new Comercio();
    	unPrecio.comercio._id = "5735087857249804c5ad91fc";
    	unPrecio.comercio.nombreEmpresa = "COTO";
    	unPrecio.comercio.geolocalizacion = new Geolocalizacion();
    	unPrecio.comercio.geolocalizacion.longitud=new BigDecimal("-58424407").movePointLeft(6);
    	unPrecio.comercio.geolocalizacion.latitud=new BigDecimal("-34745614").movePointLeft(6);
//    	unPrecio.comercio.geolocalizacion.longitud=new BigDecimal("-58425641").movePointLeft(6);
//    	unPrecio.comercio.geolocalizacion.latitud=new BigDecimal("-34739663").movePointLeft(6);
    	unPrecio.producto = new Producto();
    	unPrecio.producto.ean = "573401b762c3640afc481829";
    	unPrecio.producto.descripcion = "Sopa Knorr Quick";
    	unPrecio.producto.categorias = Arrays.asList(new String[]{"sopa","alimento"});
    	unPrecio.usuario=new User();
    	unPrecio.usuario._id="5735087857249804c5ad91fe";
		return unPrecio;
	}

}
