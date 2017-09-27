// JavaScript Document 20100030838
var code_usuario = "";
$(document).ready(function(e) {  
	//getProgramaciones();
	code_usuario = $.QueryString["user"];
	//code_usuario = window.localStorage.getItem("code");
	$("#actualizar").click(function(e) {
        getProgramaciones();
    });
	 $("form").keypress(function(e) {
        if (e.which == 13) {
            return false;
        }
    });
	
	$("#guardar").click(function(e) {
        setGuardar();
    });
	
 	getProgramaciones();
	
	
	//$("#irTracking").attr("href","index.html");
	 
	
});	

function setGuardar(){
	
	if ( $("#ordenes").val() == "" || $("#ordenes").val() == "0" ){
		alerta("Seleccionar orden");
		$("#ordenes").focus();
		return;
	}
	
	if ( $("#concluido").val() == "" ){
		alerta("Seleccionar concluido");
		$("#concluido").focus();
		return;
	}
	
	
	var parametros = new Object();
	parametros.usu = code_usuario;	
	parametros.orden = $("#ordenes").val();	
	parametros.culmi = $("#concluido").val();	
	parametros.obs = $("#observacion").val();	
	parametros.servicio = $("#ordenes option:selected").text();
	parametros.cheque = $("#cheque").val();
	//console.log(parametros);
	//return;
	$.mobile.loading('show'); 
	$.ajax({
        url : "http://www.meridian.com.pe/ServiciosMovil/AntaresAduanas/Movil/WS_AuxDespacho.asmx/Grabar",
        type: "POST",
		//crossDomain: true,
        dataType : "json",
        data : JSON.stringify(parametros),
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
			//console
			resultado = $.parseJSON(data.d);
			$.mobile.loading('hide');
			 if ( resultado.code == 1){
				$("#observacion").val("")
				$("#cheque").val("")
				$("#concluido").val();	
				$("#ordenes").val(0);
				$("#ordenes").selectmenu('refresh', true);
				$("#concluido").selectmenu('refresh', true);
				getProgramaciones();
			 }			  
			 alerta(resultado.message);
			 
        },

        error : function(jqxhr) 
        { 
          alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		
		
	
}


function alertDismissed(){
}
//

function getProgramaciones(){
	
	$.mobile.loading('show');
 	$("#ordenes").html("<option value='0'>Seleccionar</option>");
	 
	$.ajax({
        url : "http://www.meridian.com.pe/ServiciosMovil/AntaresAduanas/Movil/WS_AuxDespacho.asmx/CargararAuxiliar",
        type: "POST",
		//crossDomain: true,
        dataType : "json",
        data : '{"usuario":"' + code_usuario + '"}',
        //contentType: "xml",
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
		resultado = $.parseJSON(data.d);
		
			//console.log(resultado);
			$.mobile.loading('hide');
			if ( resultado.length > 0 ){				
				for (var i = 0; i<resultado.length;i++){
					//var nroOrden = resultado[i].nombre;		
					//nroOrden = nroOrden.toString().substring(0,11);		
					$("#ordenes").append("<option value='"+ $.trim(resultado[i].orden)+"'>"+ $.trim(resultado[i].nombre)+"</option>");					
				}
				$("#ordenes").selectmenu('refresh', true);
			}
			else{
				 alerta('No se encontrarón ordenes');
			}
        },

        error : function(jqxhr) 
        {
		   //console.log(jqxhr);	
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
