package models;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class Precio {
	public BigDecimal importe;
	public Date fecha;
    public Producto producto;
    public Comercio comercio;
    public Map<String, User> registros;
    
    public Precio(){
    	registros = new HashMap<String, User>();
    }
}
