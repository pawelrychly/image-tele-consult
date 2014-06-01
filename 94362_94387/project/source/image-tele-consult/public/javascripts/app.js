var isEmail = function(value) {
    if (value == '') {
        return true;
    }
    var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegExp.test(value);
}

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
  
    $("#cooperators-filter-text").on("change", function(evt){
        $(".search-user-help").removeClass("text-danger")
        if (!isEmail($(this).val())) {
            $("#add-permission").prop('disabled', true)
            $(".search-user-help").addClass("text-danger")
            $(".search-user-help").html("Value is not a correct email addres")
        } else {
            $("#add-permission").prop('disabled', false)
            $(".search-user-help").html("")
        }
    })

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
        $(this).find(".select-cooperators").click(function(event){
            console.log("select-cooperators")
            var id = $(this)[0].getAttribute("data-id").toString() 
            var name = $(this)[0].getAttribute("data-image").toString()   
            $("#modal-file-name").html(name)
            $("#cooperators-list").load("/api/cooperators/" + id)
            $("#add-permission").click(function(evt){
                userInput = $("#cooperators-filter-text")[0]
                email = $(userInput).val()
                if (email.length > 0) {
                    $.ajax({
                        type: "POST",   
                        url: "/api/cooperators/" + id +"/" + email,
                        success: function(data){
                           console.log(data)
                           if (data.iscomplete) {
                            console.log("success")
                            console.log(data)
                                $(".search-user-help").addClass("text-success")
                                $(".search-user-help").html(data.message)
                                $("#cooperators-list").load("/api/cooperators/" + id)
                           } else {
                                $(".search-user-help").addClass("text-danger")
                                $(".search-user-help").html(data.message)
                           }                      
                        },
                    });
                } else {
                    $(".search-user-help").addClass("text-danger")
                    $(".search-user-help").html("Please enter a correct email addres")
                    
                }
                
            })
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

    $("#select-cooperators").ready(function(event){
        console.log("load cooperators")
        $.ajax({
            type: "GET",   
            url: "/api/accounts",
            processData: false,
            contentType: false,
            success: function(data){
               /*$("#images").load('/api/accounts', function(data){
                    console.log(data)
                });*/
                users = data.map(function(user){
                    return(user.email)
                })
                console.log(users)
                $('input.typeahead').typeahead({
                    source: users
                });
                console.log(data)                       
            },
        });
        //var users = $.load("/api/accounts")
        //console.log(users)
        /*$(this).find(".remove-image").click(function(event){
            
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
        })*/
    });
    
})