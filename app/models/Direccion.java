package models;

public class Direccion {
	public String calle; 
    public String localidad; 
    public String provincia;
    
    @Override
    public String toString() {
    	return "calle: {"		+calle		+"} "+
    			"localidad: {"	+localidad	+"} "+
    			"provincia: {"	+provincia	+"}"; 
    }
}
