//var rutaWS = "http://www.meridian.com.pe/AntaresAduanas/Servicio/AntaresAduanas/";
var rutaWS = "http://www.meridian.com.pe/AntaresAduanas/Servicio_TEST/AntaresAduanas/";
var rutaUpload = "http://www.meridian.com.pe/AntaresAduanas/Servicio_TEST/";
//var rutaWS = "http://localhost:34927/AntaresAduanas/";
var parametros = null;
var code_usuario = "";
var Li = null;
var imageData64 = "";
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
        quality: 60,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        sourceType: src, 
		//targetWidth: 1240,
		//targetHeight: 1754,
		correctOrientation: true,
        encodingType: navigator.camera.EncodingType.JPEG,
        saveToPhotoAlbum: false
    });
}
 
function CamaraSuccess(imageData) {
    //$.mobile.loading('show'); 
	imageData64 = imageData;
	$("#imgFoto").attr("src", "data:image/jpeg;base64," + imageData);
	//alert(imageData);
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
                //$('#fileFoto').val("");
            },
            error: function (xhr, status, p3, p4) {
                var err = "Error " + " " + status + " " + p3 + " " + p4;
                if (xhr.responseText && xhr.responseText[0] == "{")
                    err = JSON.parse(xhr.responseText).Message;

                //$('#file').val("");
                console.log(xhr);
                console.log(status);
				alerta("Error, no se pudo subir la foto");
                alerta(err);
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
	$("#deposito").html("<option value='0'>Cargando...</option>");
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
			$("#deposito").html("<option value='0'>Seleccionar Depósito</option>");
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
					$("#listProgramacion").append("<li style='position: relative;padding: 0px;' data-orden='"+ $.trim(resultado[i].vbo_orde)+"' data-corr='"+ $.trim(resultado[i].vbo_corr)+"' data-enti='"+ $.trim(resultado[i].vbo_enti)+"' data-clie='"+ $.trim(resultado[i].vbo_clien)+"'><input type='radio' name='orden' id='check" + i + "' /><label for='check" + i + "'><span style='display:block;'>"+ $.trim(resultado[i].PROG) + "</span></label></li>");
				
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
	
	imageData64 = "";
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
	
	if ($(".DivDeposito").css("display") == "block"){
		if ($("#deposito").val() == "0"){
			alerta("Seleccionar depósito"); 
			$("#deposito").focus()
			return;
		}
	}
	
	
	if ( $("#imgFoto").attr("src") == ""){
			alerta("Debe tomar foto al memo"); 
			return;
	}
	
	


	$("#listProgramacion").find("input").each(function(index, element) {
		if ( $(this).is(":checked") ){
			Li = $(this).parent().parent();			
			$.mobile.loading('show'); 
			
			var parametros = new Object();
			parametros.usu = code_usuario;	
			parametros.orden = $(Li).data("orden");	
			parametros.correlativo = $(Li).data("corr");
			parametros.entidad = $(Li).data("enti");
			parametros.tipomemo = "DEFINITIVO";// 0;//$(Li).data("serv");
			parametros.dtdevol = $("#deposito").val();
			parametros.fecsob = $("#fecha").val();
			parametros.ruta = '';//"\\10.93.1.233\Siad\VistoBueno\VistoBueno\Memos\";
			parametros.obs = $("#observacion").val();
			console.log(parametros); 
			
			if (window.FormData !== undefined) {
				//alert(imageData64);
				var data = new FormData();
				data.append("imagen", $(Li).data("orden"));
				data.append("tipo", "vbo");
				var blob = b64toBlob(imageData64, 'image/jpeg');
				data.append("file", blob);
				//alert(data);
				$.ajax({
					type: "POST",
					url: rutaUpload + 'Upload/UploadImage.ashx?tipo=vbo&imagen=' + $(Li).data("orden"),
					contentType: false,
					processData: false,
					data: data,
					success: function (result) {
						resp = result.toString().split("|");
						console.log(resp);
						if (resp[0] == 0) {
							//alerta(resp[1]);
							parametros.ruta = resp[1];  				
							setOrden(parametros);
						}
						else {
							alerta(resp[2]);
						}						

						$.mobile.loading('hide');
						 
					},
					error: function (xhr, status, p3, p4) {
						var err = "Error " + " " + status + " " + p3 + " " + p4;
						if (xhr.responseText && xhr.responseText[0] == "{")
							err = JSON.parse(xhr.responseText).Message;

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
	
			
			
			
			
			 
		}			 
	});
 	
}
 
function setOrden(parametros){
	console.log(parametros);	
	//return;	
	$.mobile.loading('show'); 
	$.ajax({
	url :  rutaWS + "Movil/WS_Aux_VB.asmx/Grabar",
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
			$("#deposito").val("0");
			$("#deposito").selectmenu('refresh', true);
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
