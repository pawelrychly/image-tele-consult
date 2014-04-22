$('document').ready(function() {
    
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            user = sessionStorage.getItem('user');
            if (user) {
                user = JSON.parse(user)
                if (user && user.token) {
                    xhr.setRequestHeader('X-Token', user.token);
                }
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
})