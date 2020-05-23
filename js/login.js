//var rutaWS = "http://www.meridian.com.pe/AntaresAduanas/Servicio/AntaresAduanas/";
var rutaWS = "http://www.meridian.com.pe/AntaresAduanas/Servicio_TEST/AntaresAduanas/";

$(document).ready(function(e) {
		
		 
		
		//cargarUsuarios();
	
    	$("#ingresar").click(function(e) {
            e.preventDefault();
			
			setTimeout(loginValidar, 100);
        });
		
		
		$("#perfil").change(function(){
			$("#usuario").html("<option value='0'>Cargando...</option>");
			if ( $(this).val() == "VBO" ){
				cargarUsuariosVBO();
			}
			if ( $(this).val() == "OPE" ){
				cargarUsuarios();
			}
			
		});
});

var loginValidar = function(){
		
	if (  $("#perfil").val() == "0" )
		{
			alerta('Seleecionar perfil');
			return;
		} 	
		
	  if ( $("#usuario").val() == "0" ) 
		{
			alerta('Seleecionar usuario');
			return;
		} 
		
	if (  $("#clave").val() == "" )
		{
			alerta('Ingresar clave');
			return;
		} 

	var metodo = ( $("#perfil").val() == "VBO" ? "LoginAuxVB" : "LoginAux" );
	console.log(metodo);
	$.mobile.loading('show');
	$.ajax({
        url : rutaWS + "Autenticacion/Login.asmx/" + metodo,
        type: "POST",
	//crossDomain: true,
        dataType : "json",
        data : '{"usuario" : "' + $("#usuario").val() + '", "clave" : "' + $("#clave").val() + '"}',
        contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
          resultado = $.parseJSON(data.d);
		  //console.log(resultado);
		  if ( resultado.code == 1){			  
			  	var recordar = ( $('input#recordar').is(':checked') ? 1 : 0);
			    window.localStorage.setItem("user", $("#usuario").val());
				window.localStorage.setItem("pass",$("#clave").val());
				window.localStorage.setItem("code", resultado.datos[0].codigo);				
				window.localStorage.setItem("recordar", recordar);
				
				if (metodo == "LoginAuxVB")
					location.href = "vbo.html?user=" + resultado.datos[0].codigo;
				else
					location.href = "ordenes.html?user=" + resultado.datos[0].codigo;
		  }
		  else{
			   $.mobile.loading('hide');
			   var message = resultado.message;
			   alerta(message);
			   //$("#usuario").val("");
			   $("#clave").val("");
			   //$("#usuario").focus();
			   $(".loadLogin").fadeOut("fast");
		  }
        },

        error : function(jqxhr) 
        {
			$.mobile.loading('hide');
			alerta('Error de conexi\u00f3n, contactese con sistemas!'); 
        }

    });	
	

};

function alertDismissed(){
}

function cargarUsuariosVBO(){
		
	//$("#usuario").html("<option value='0'>Seleccionar Usuario</option>");
	$.mobile.loading('show'); 
	$.ajax({
        url : rutaWS + "Autenticacion/Login.asmx/ListarAuxiliarVB",
        type: "POST",
		cache: false,
	//crossDomain: true,
        dataType : "json",
        data : '',//{"Empresa":"'+empresa+'", "IDEstado" : '+idestado+'}',
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
			//console.log(data.d);
			$("#usuario").html("<option value='0'>Seleccionar Usuario</option>");
			resultado = $.parseJSON(data.d);
			$.mobile.loading('hide');			 
			if ( resultado.length > 0 ){				
				for (var i = 0; i<resultado.length;i++){					
					$("#usuario").append("<option value='"+resultado[i].usu_codi+"'>"+resultado[i].USU_ALIAS+"</option>");					
				}
				$("#usuario").selectmenu('refresh', true);
			}
			else{
			}
        },

        error : function(jqxhr) 
        {	
	  console.log(jqxhr);
          alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		 
	
}


function cargarUsuarios(){
		
	//$("#usuario").html("<option value='0'>Seleccionar Usuario</option>");
	$.mobile.loading('show'); 
	$.ajax({
        url : rutaWS + "Autenticacion/Login.asmx/ListarAuxiliar",
        type: "POST",
		cache: false,
		//crossDomain: true,
        dataType : "json",
        data : '',//{"Empresa":"'+empresa+'", "IDEstado" : '+idestado+'}',
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
			//console.log(data.d);
			$("#usuario").html("<option value='0'>Seleccionar Usuario</option>");
			resultado = $.parseJSON(data.d);
			$.mobile.loading('hide');			 
			if ( resultado.length > 0 ){				
				for (var i = 0; i<resultado.length;i++){					
					$("#usuario").append("<option value='"+resultado[i].Nombre+"'>"+resultado[i].Nombre+"</option>");					
				}
				$("#usuario").selectmenu('refresh', true);
			}
			else{
			}
        },

        error : function(jqxhr) 
        {	
	console.log(jqxhr);
          alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		 
	
}

function alerta(mensaje){
	if ( navigator.notification == null ){
		alert(mensaje);
		return;
	}
	 navigator.notification.alert(
            mensaje,  // message
            alertDismissed,         // callback
           'Informaci\u00f3n',            // title
            'Aceptar'                  // buttonName
        	);
	
}
