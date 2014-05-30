var ajaxWithLoader = function(obj) {
    var settings = {
        beforeSend: function(xhr, settings) {
            $.loader({
                className:"blue-with-image-2",
                content:''
            });
        },
        complete: function(xhr, textStatus) {
            $.loader('close')
        }
    }
    var object = $.extend(obj, settings);
    $.ajax(object)
}

$('document').ready(function() {
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            user = sessionStorage.getItem('user');
            if (user) {
                user = JSON.parse(user)
                if (user && user.token) {
                    xhr.setRequestHeader('X-Token', user.token);
                }
                console.log(user)
            } else {
                console.log("Unknown user")
            }
        },
    });

    $("#form-sign-up").bootstrapValidator();
    $("#form-sign-in").bootstrapValidator();

    $("#form-sign-in").submit(function() {
        var self = this
        ajaxWithLoader({
                type: "POST",   
                url: "/sign-in",
                data: $("#form-sign-in").serialize(),
                success: function(data){
                    if (data.token) {
                        sessionStorage.setItem('user', JSON.stringify({email: data.email, token: data.token}));
                        window.location.replace("/api?token=" + data.token );
                    } else {
                        $(self).find("#messages").html(data)
                    }
                    
                },
             });
        return false; 
    });

    $("#form-sign-up").submit(function() {
        var self = this
        ajaxWithLoader({
                type: "POST",   
                url: "/sign-up",
                data: $("#form-sign-up").serialize(),
                success: function(data){
                    if (data.token) {
                        sessionStorage.setItem('user', JSON.stringify({email: data.email, token: data.token}));
                        window.location.replace("/api?token=" + data.token );
                    } else {
                        $(self).find("#messages").html(data)
                    }
                },
             });
        return false; 
    });

    $("#sign-out-button").click(function() {
        $.ajax({
            type: "GET",   
            url: "/api/sign-out",
            success: function(data){
                if (data.isLoggedOut) {
                    sessionStorage.removeItem('user');
                    window.location.replace("sign-in");
                }
            },
         });
        return false;
    })

    $("#image-upload-form").submit(function(event) {
        var self = this
        event.stopPropagation();
        event.preventDefault();
        var fileSelect = $(this).find("#image-select")[0]
        var formData = new FormData();  
        var files = fileSelect.files
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (file.type.match('image.*') || file.type.match('.*dicom')) {
                formData.append('images', file, file.name);
              }
            } 
            $.ajax({
                type: "POST",   
                url: "/api/images",
                data: formData,
                xhr: function()
                {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentage = Math.round((evt.position / evt.total) * 100)
                            $("#progress-image-upload").val(percentage)
                        }
                    }, false);
                    xhr.upload.addEventListener("load", function(evt) {
                        if (evt.lengthComputable) {
                            $("#progress-image-upload").val(0)
                        }
                    }, false);
                    return xhr;
                },
                processData: false,
                contentType: false,
                success: function(data){
                   if (data.status == "OK") {
                        $("#images").load('/api/images', function(err){
                            $(this).trigger("load")
                        });
                   }                       
                },
             });
        }
        return false; 
    });
    $("#images").on("load", function(event){
        $(this).find(".remove-image").click(function(event){
            
            var id = $(this)[0].getAttribute("data-id").toString()
            $('#delete-confirm').off();
            $('#delete-confirm').click(function(){
                event.stopPropagation();
                event.preventDefault();
                $.ajax({
                    type: "DELETE",   
                    url: "/api/images/" + id,
                    processData: false,
                    contentType: false,
                    success: function(data){
                       if (data.status == "OK") {
                            $("#images").load('/api/images', function(err){
                                $(this).trigger("load")
                            });
                       }                       
                    },
                });
            });
        })
        $(this).find(".download-image").click(function(event){
            
            var id = $(this)[0].getAttribute("data-id").toString()    
            data = JSON.parse(sessionStorage.getItem('user'));
            window.location = "/api/images/" + id + "/download?token=" + data.token
        
        })
    });

    $("#images").load('/api/images', function(err) {
        $(this).trigger("load");
    });

    $("#image-select").on("change", function(){
        var files = this.files;
        if (files.length > 1) {
            $("#selected-image-name").html(files.length + " files selected");
        } else if(files.length == 1) {
            $("#selected-image-name").html(files[0].name);
        } else {
            $("#selected-image-name").html("No file selected");
        }       
    })
    
})