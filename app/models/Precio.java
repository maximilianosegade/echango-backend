package models;

import java.math.BigDecimal;
import java.util.Date;

public class Precio {
	public BigDecimal importe;
	public Date fecha;
    public Producto producto;
    public Comercio comercio;
    public User usuario;
}
