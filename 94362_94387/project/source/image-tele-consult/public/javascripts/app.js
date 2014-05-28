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
            $.loader({
                className:"blue-with-image-2",
                content:''
            });
        },
        complete: function(xhr, textStatus) {
            $.loader('close')
        }
    });

    $("#form-sign-up").bootstrapValidator();
    $("#form-sign-in").bootstrapValidator();

    $("#form-sign-in").submit(function() {
        self = this
        $.ajax({
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
        self = this
        $.ajax({
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
        self = this
        event.stopPropagation();
        event.preventDefault();
        var fileSelect = $(this).find("#file-select")[0]
        var formData = new FormData();
        console.log(fileSelect.files)
        files = fileSelect.files
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
            processData: false,
            contentType: false,
            success: function(data){
               if (data.status == "OK") {
                    $("#images").load('/api/images');
               }                       
            },
         });
        console.log("prevent-default")
        return false; 
    });

    $("#images").load('/api/images');
})