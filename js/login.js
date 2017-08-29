// JavaScript Document
// JavaScript Document
$(document).ready(function(e) {
	
		 cargarUsuarios();
	
    	$("#ingresar").click(function(e) {
            e.preventDefault();
			$.mobile.loading('show');
			setTimeout(loginValidar, 100);
        });
});

var loginValidar = function(){
	
	  if ( $("#usuario").val() == "" && $("#clave").val() == "" )
   	{
		 $.mobile.loading('hide');
		  if ( navigator.notification == null ){
			  alert('Complete los campos');
					return;
				}
	   navigator.notification.alert(
            'Complete los campos',  // message
            alertDismissed,         // callback
            'Informaci\u00f3n',            // title
            'Aceptar'                  // buttonName
        	);
	   return;
   	} 
	 
	$.ajax({
        url : "http://www.meridian.com.pe/ServiciosMovil/AntaresAduanas/Autenticacion/Login.asmx/LoginAux",
        type: "POST",
		crossDomain: true,
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
			  	location.href = "ordenes.html";
		  }
		  else{
			   $.mobile.loading('hide');
			   var message = resultado.message;
			   
			   if ( navigator.notification == null ){
					alert(message);
					return;
				}
				else
			   navigator.notification.alert(
					message,  // message
					alertDismissed,         // callback
					'Informaci\u00f3n',            // title
					'Aceptar'                  // buttonName
				);
			   $("#usuario").val("");
			   $("#clave").val("");
			   $("#usuario").focus();
			   $(".loadLogin").fadeOut("fast");
		  }
        },

        error : function(jqxhr) 
        {
			$.mobile.loading('hide');
           navigator.notification.alert(
            'Error de conexi\u00f3n, contactese con sistemas!',  // message
            alertDismissed,         // callback
            'Informaci\u00f3n',            // title
            'Aceptar'                  // buttonName
        	);
        }

    });	
	

};

function alertDismissed(){
}

function cargarUsuarios(){
		
	$("#usuario").html("<option value='0'>Seleccionar Usuario</option>");
	//$.mobile.loading('show'); 
	$.ajax({
        url : "http://www.meridian.com.pe/ServiciosMovil/AntaresAduanas/Autenticacion/Login.asmx/ListarAuxiliar",
        type: "POST",
		cache: false,
		//crossDomain: true,
        dataType : "json",
        data : '',//{"Empresa":"'+empresa+'", "IDEstado" : '+idestado+'}',
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
			console.log(data.d);
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
          alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		 
	
}