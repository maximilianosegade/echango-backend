var allComercios = []						
jQuery('.storelocator_result.col2-set').each(function(){
	parsed = {}
	
	parsed.id_suc = jQuery(this).find('.name a').text().split('\-')[0].trim() //id_suc
	parsed.tel = jQuery(this).find('.tel').text().trim() //id_suc
	parsed.tipo = jQuery(this).next().find('.type').text() //
	parsed.direccion = jQuery(this).next().next().find('.address').text() // direccion
	parsed.nombre = jQuery(this).find('.name a').text().split('\-')[1].trim()
	parsed.coords = [jQuery(this).next().find('.geodata').attr('data-lat'), jQuery(this).next().find('.geodata').attr('data-lng')]	
	parsed.horario = []
	jQuery(this).next().next().find('.timetable tr').each(function(){
		var h = {}
		h.dia = jQuery(this).find('.day').text()
		h.horario = jQuery(this).find('.hour').text() 
		parsed.horario.push(h)
	})
	
	var comercio = {
	  _id: '10-' + (parsed.tipo === 'hiper' ? '1' : (parsed.tipo === 'market' ? '2' : '3')) + '-' + parsed.id_suc,
	  direccion: parsed.direccion,
	  horario: parsed.horario,
	  id_sucursal: parsed.id_suc,
	  id_cadena: '10',
	  nombre: parsed.nombre,
	  provincia: 'BUENOS AIRES',
	  telefonos: parsed.tel,
	  tipo: parsed.tipo,
	  ubicacion: {
		type: 'Point',
		coordinates: [parseFloat(parsed.coords[0]), parseFloat(parsed.coords[1])]
	  },
	  zona: 'CAPITAL FEDERAL',
	  cadena: 'CARREFOUR'
	}
	allComercios.push(comercio)
	
	if(allComercios.length == 334)
		console.log(JSON.stringify(allComercios))
})