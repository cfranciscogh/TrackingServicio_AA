//var rutaWS = "http://www.meridian.com.pe/AntaresAduanas/Servicio/AntaresAduanas/";
var rutaWS = "http://www.meridian.com.pe/AntaresAduanas/Servicio_TEST/AntaresAduanas/";
var code_usuario = "";
var Li = null;

function base64toBlob(base64Data, contentType) {
    contentType = contentType || 'image/jpeg';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function sendImage(src) {
    src = (src == 'library') ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA;
    navigator.camera.getPicture(CamaraSuccess, CamaraFail, { 
        quality: 70,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        sourceType: src,
        encodingType: navigator.camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
    });
}
 
function CamaraSuccess(imageData) {
    $.mobile.loading('show'); 
	$("#imgFoto").attr("src",imageData);
	return;
	
    if (window.FormData !== undefined) {
        var data = new FormData();
        data.append("IDPedido", $("#IDPedido").val());
        var blob = b64toBlob(imageData, 'image/jpeg');
        data.append("file", blob);
        //alert(data);
        $.ajax({
            type: "POST",
			url: dominio_extranet + '/Servicios/UploadImageTracking.ashx?NroOrden=' + NroOrden,
            contentType: false,
            processData: false,
            data: data,
            success: function (result) {
                resp = result.toString().split("|");
                console.log(resp);
                if (resp[0] == 0) {
                    alerta(resp[1]);
                    setFotosPedido($.QueryString["IDPedido"]);
                }
                else {
                    //alerta("Error, no se pudo subir la foto");
                    alerta(resp[1]);
                    //alerta(resp[2]);
                }
                    

                $.mobile.loading('hide');
                $('#fileFoto').val("");
            },
            error: function (xhr, status, p3, p4) {
                var err = "Error " + " " + status + " " + p3 + " " + p4;
                if (xhr.responseText && xhr.responseText[0] == "{")
                    err = JSON.parse(xhr.responseText).Message;

                $('#file').val("");
                console.log(xhr);
                console.log(status);
                alerta("Error, no se pudo subir la foto");
                $.mobile.loading('hide');
            }
        });
    } else {
        alert("This app doesn't support file uploads!");
        $.mobile.loading('show');
    }
    /*
    var url = dominio_extranet + '/Public/Servicios/UploadImageTracking.ashx?IDPedido=' + $("#IDPedido").val();
    var params = { image: imageData };
    // send the data
    $.post(url, params, function (data) {
        console.log(data)
        alert(data);
    });
    */
}

function CamaraFail(message) {
    //alert(message);
}


$(document).ready(function(e) {  
	//getProgramaciones();
	
	$('#btnFoto').click(function () { sendImage("camera"); });   
	$('#btnAlbum').click(function () { sendImage("library"); });   
	
	code_usuario = $.QueryString["user"];
	//code_usuario = window.localStorage.getItem("code");
	$("#actualizar").click(function(e) {
        getOrdenes();
    });
	 $("form").keypress(function(e) {
        if (e.which == 13) {
            return false;
        }
    });
	
	$("#guardar").click(function(e) {
		setValidar();
    });
	
	$("#btnContinuar").click(function(e) {
        setGuardar();
    });
	
	$("#btnCancelar").click(function(e) {
       $(".page2").fadeOut(100,function(){
		   $(".page1").fadeIn();
	   });
    });
	
	 
	cargarDeposito();
 	getOrdenes();
	
	
	
	//$("#irTracking").attr("href","index.html");
	 
	
});	

function cargarDeposito(){
		
	$("#deposito").html("<option value='0'>Seleccionar Depósito</option>");
	//$.mobile.loading('show'); 
	$.ajax({
        url : rutaWS + "Movil/WS_Aux_VB.asmx/CargararDepositosVB",
        type: "POST",
		cache: false,
		//crossDomain: true,
        dataType : "json",
        data : '',//{"Empresa":"'+empresa+'", "IDEstado" : '+idestado+'}',
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
			//console.log(data.d);
			resultado = $.parseJSON(data.d);
			$.mobile.loading('hide');			 
			if ( resultado.length > 0 ){				
				for (var i = 0; i<resultado.length;i++){					
					$("#deposito").append("<option value='"+resultado[i].DEP_ENTIDAD+"'>"+resultado[i].DEP_DESC+"</option>");					
				}
				$("#deposito").selectmenu('refresh', true);
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

function getOrdenes(){
	//alert(code_usuario);
	$.mobile.loading('show'); 
	$("#listProgramacion").html("");
 	
	$.ajax({
        url: rutaWS + "Movil/WS_Aux_VB.asmx/CargararAuxiliarVB",
        type: "POST",
		//crossDomain: true,
        dataType : "json",
        data : '{"usuario":"' + code_usuario + '"}',
        //contentType: "xml",
		contentType: "application/json; charset=utf-8",
        success : function(data, textStatus, jqXHR) {
		resultado = $.parseJSON(data.d);
			console.log(resultado);
			$.mobile.loading('hide');
			$(".panelMensaje").hide();
			$(".panelOrden").fadeIn("fast");
			
			if ( resultado.length > 0 ){
				var count = 0;
				for (var i = 0; i<resultado.length;i++){ 				
					//$("#listProgramacion").append("<li style='position: relative;padding: 0px;' data-previo='"+ $.trim(resultado[i].sprevio)+"' data-orden='"+ $.trim(resultado[i].vbo_orde)+"' data-al='"+ $.trim(resultado[i].al)+"' data-nexp='"+ $.trim(resultado[i].nexp)+"' data-sol='"+ $.trim(resultado[i].sol)+"' data-clie='"+ $.trim(resultado[i].cliente)+"' data-serv='"+ $.trim(resultado[i].servicio)+"'><input type='checkbox' id='check" + i + "' /><label for='check" + i + "'><span style='display:block;'>"+ $.trim(resultado[i].vbo_orde) + " - " + resultado[i].vbo_clien + "</span><span style='display:block;'>" + resultado[i].vbo_enti	+ "</span><span style='display:block;'>" + resultado[i].vbo_fpro + " " + resultado[i].vbo_tpro + "</span><span style='display:block;'>" + resultado[i].cont +"</span><span style='display:block;'>" + (resultado[i].DIR1 != "" ? resultado[i].DIR1 : "") + (resultado[i].DIR2 != "" ? resultado[i].DIR2 : "") + (resultado[i].DIR3 != "" ?  resultado[i].DIR3 : "") + "</span></label></li>");
					//$("#listProgramacion").append("<li style='position: relative;padding: 0px;' data-previo='"+ $.trim(resultado[i].sprevio)+"' data-orden='"+ $.trim(resultado[i].vbo_orde)+"' data-al='"+ $.trim(resultado[i].al)+"' data-nexp='"+ $.trim(resultado[i].nexp)+"' data-sol='"+ $.trim(resultado[i].sol)+"' data-clie='"+ $.trim(resultado[i].cliente)+"' data-serv='"+ $.trim(resultado[i].servicio)+"'><input type='checkbox' id='check" + i + "' /><label for='check" + i + "'><span style='display:block;'>"+ $.trim(resultado[i].vbo_orde) + " | " + resultado[i].vbo_clien + " | " + resultado[i].vbo_enti	+ " | " + resultado[i].vbo_fpro + " | " + resultado[i].vbo_tpro + "</span></label></li>");
					$("#listProgramacion").append("<li style='position: relative;padding: 0px;' data-previo='"+ $.trim(resultado[i].sprevio)+"' data-orden='"+ $.trim(resultado[i].vbo_orde)+"' data-al='"+ $.trim(resultado[i].al)+"' data-nexp='"+ $.trim(resultado[i].nexp)+"' data-sol='"+ $.trim(resultado[i].sol)+"' data-clie='"+ $.trim(resultado[i].cliente)+"' data-serv='"+ $.trim(resultado[i].servicio)+"'><input type='radio' name='orden' id='check" + i + "' /><label for='check" + i + "'><span style='display:block;'>"+ $.trim(resultado[i].PROG) + "</span></label></li>");
				
				}
				$("#listProgramacion").listview("refresh");
				$("#listProgramacion").find("input").each(function(index, element) {
                    $(this).checkboxradio().trigger('create');
                }); 				
			}
			else{
				$(".panelOrden").hide();
				$(".panelMensaje").fadeIn("fast");
			}
        },
        error : function(jqxhr) 
        {
		   console.log(jqxhr);	
           alerta('Error de conexi\u00f3n, contactese con sistemas!');
        }

    });		 
	
}

function setValidar(){
	$("#notificado").val(0);
	$('select#notificado').selectmenu('refresh');
	$(".page2 input[type='text']").val("");
	$(".page2 textarea").val("");
	var FlagCheck = false;
	var FlagSenasa = true;
	$(".DivFecha, .DivObsNoti, .DivNoti").hide();
	
	$("#listProgramacion").find("input").each(function(index, element) {
		if ( $(this).is(":checked") ){
			FlagCheck = true;
			/*
			if ($(this).parent().parent().data("serv") == "SENASA"){
				FlagSenasa = true;
			}
			*/
		}
	});
	
	if (!FlagCheck){
		alerta("Seleccionar una o más ordenes"); 
		return;
	}	
	
		
	if (FlagSenasa){
		$(".DivFecha, .DivNoti").show();
	}
	
	$("#imgFoto").attr("src","");
	//$("#myPopup").popup("open");
	$(".page1").fadeOut(100,function(){
		 $(".page2").fadeIn();
	 });
}

function setValidarNotificado(a){
	$(".DivFecha, .DivObsNoti").hide();
	if (a==0){
		$(".DivFecha").show();
	}
	else{
		$(".DivObsNoti").show();
	}
}
function setGuardar(){
	var FlagCheck = false;
	
	
	
	$("#listProgramacion").find("input").each(function(index, element) {
		if ( $(this).is(":checked") ){
			FlagCheck = true;			
		}
	});
	
	if (!FlagCheck){
		alerta("Seleccionar una o más ordenes"); 
		return;
	}
	
	if ($(".DivFecha").css("display") == "block"){
		if ($("#fecha").val() == ""){
			alerta("Ingresar fecha"); 
			$("#fecha").focus()
			return;
		}
	}
	
	if ($(".DivObsNoti").css("display") == "block"){
		if ($("#observacion2").val() == ""){
			alerta("Ingresar motivo"); 
			$("#observacion2").focus()
			return;
		}
	}


	$("#listProgramacion").find("input").each(function(index, element) {
		if ( $(this).is(":checked") ){
			Li = $(this).parent().parent();
			var parametros = new Object();
			parametros.usu = code_usuario;	
			parametros.orden = $(Li).data("orden");	
			parametros.culmi = 1;//$("#concluido").val();	
			parametros.obs = $("#observacion").val();	
			parametros.servicio = $(Li).data("serv");
			parametros.cheque = $("#cheque").val();
			parametros.nroexp = $(Li).data("nexp");
			parametros.clien = $(Li).data("clie");
			parametros.nrosol = $(Li).data("sol");	
			parametros.contenedor = $(Li).find("span").eq(3).text();
			parametros.AL = $(Li).data("al");	
			parametros.chknotifi = $("#notificado").val();	
			parametros.obsnota = $("#observacion2").val();
			parametros.Sprevio = $(Li).data("previo");
			
			if  ( $(Li).data("serv") == "SENASA" ){				
				var strFecha = $("#fecha").val();	
				if (strFecha!= ""){ 
					  parametros.fecha = strFecha;
				}
				else
					parametros.fecha = "01/01/1900";				 	
			}
			else
				parametros.fecha = "01/01/1900";	
			
			
			console.log(parametros);
			$.mobile.loading('show'); 
			$.ajax({
			url :  rutaWS + "Movil/WS_AuxDespacho.asmx/Grabar2",
			type: "POST",
			//crossDomain: true,
			dataType : "json",
			data : JSON.stringify(parametros),
			contentType: "application/json; charset=utf-8",
			success : function(data, textStatus, jqXHR) {
				//console
				console.log(data.d);
				resultado = $.parseJSON(data.d);
				console.log(resultado);
				$.mobile.loading('hide');
				 if ( resultado.code == 1){
					$("#observacion").val("");
					$("#cheque").val("");
					$("#fecha").val("");	
					$(Li).remove();	
					 
					$(".page2").fadeOut(100,function(){
					   $(".page1").fadeIn();
				   });
					 
					getOrdenes();				
				 }			  
				 alerta(resultado.message);
					 
				},
		
				error : function(jqxhr) 
				{ 
					console.log(jqxhr);
				  alerta('Error de conexi\u00f3n, contactese con sistemas!');
				}
		
			});
			$("#myPopup").popup("close");			
		}			 
	});
 
	
	/*var parametros = new Object();
	parametros.usu = code_usuario;	
	parametros.orden = $("#ordenes").val();	
	parametros.culmi = 1;//$("#concluido").val();	
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

    });	*/	
		
	
}


function alertDismissed(){
}
//

function getProgramaciones(){
	
	$.mobile.loading('show');
 	$("#ordenes").html("<option value='0'>Seleccionar</option>");
	 
	$.ajax({
        url :  rutaWS + "Movil/WS_AuxDespacho.asmx/CargararAuxiliarVB",
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
