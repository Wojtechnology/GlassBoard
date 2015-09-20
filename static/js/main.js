var scene,
    camera,
    renderer,
    element,
    container,
    effect,
    video,
    canvas,
    context,
    detector,
    socket = io(),
    lookingUp = false,
    initialY = -100,
    finalY = 30,
    DEBUG = true,
    profile,
    notifications = [{
        body: 'Yofammmmmm',
        from: '6133848944'
    }],
    detectFaces = false,
    cursor = {
        x: -1,
        y: -1,
        time: 0
    },
    cancel = {
        clickHandler: function(){
            if (openDialog) {
                openDialog = false;
            }
        },
        time: null,
        id: 'cancel',
        x: 10,
        y: initialY,
        width: 75,
        height: 50,
        offset: -5,
        img: document.getElementById('cancel'),
        opacity: 1,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null
    },
    replyOpen = false,
    reply = {
        clickHandler: function(){
            if (!replyOpen) {
                replyOpen = true;
                openDialog = false;
                replyStart();
            }


            if (notifications.length) {
            //if (openDialog) {
                console.log('REPLY');
            }
        },
        text: '',
        time: null,
        id: 'reply',
        x: 10,
        y: initialY,
        width: 75,
        height: 50,
        offset: -5,
        img: document.getElementById('reply'),
        opacity: 1,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null,
    },
    send = {
        clickHandler: function(){
            if (replyOpen) {
                console.log('SEND');
            }
        },
        time: null,
        id: 'send',
        x: 10,
        y: initialY,
        width: 75,
        height: 50,
        offset: -5,
        img: document.getElementById('send'),
        opacity: 1,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null
    },
    user = {
        time: null,
        id: 'user',
        x: 10,
        y: initialY,
        width: 75,
        height: 50,
        offset: -5,
        img: document.getElementById('user'),
        opacity: 1,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null,
        customDraw: function(icon, context, currentY){
            context.save();
            context.scale(1.5, 1);
            context.beginPath();
            context.arc(icon.x + 35, icon.y + 25, 20, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            context.scale(1, 1);
            context.drawImage(icon.img, icon.x, icon.y, icon.width, icon.height);
            context.scale(1.5, 1);

            context.beginPath();
            context.arc(0, 0, 20, 0, Math.PI * 2, true);
            context.clip();
            context.closePath();
            context.restore();
        }
    },
    messages = {
        clickHandler: function(){
            if (notifications.length) {
                openDialog = true;
                for (var i = 0; i < icons.length; i++) {
                    var icon = icons[i];
                    icon.startUpAnimation = false;
                    icon.startDownAnimation = true;
                    icon.lookingUpTimeout = null;
                }
            }
        },
        time: null,
        id: 'messages',
        img: document.getElementById('msg'),
        x: 250,
        y: initialY,
        width: 75,
        height: 50,
        offset: 0,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null
    },
    email = {
        time: null,
        id: 'email',
        img: document.getElementById('email'),
        x: 350,
        y: initialY,
        width: 75,
        height: 40,
        offset: 0,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null
    },
    news = {
        time: null,
        id: 'news',
        img: document.getElementById('news'),
        x: 300,
        y: initialY,
        width: 75,
        height: 40,
        offset: 0,
        startUpAnimation: false,
        startDownAnimation: false,
        lookingUpTimeout: null
    },
    icons = [user, messages, email],
    animationSpeed = 15,
    replyButton = {
        clickHandler: function(){
            replyOpen = true;
            replyStart();
        },
        x: 50,
        y: 50,
        width: 50,
        height: 100,
        time: null
    },
    buttons = [user, messages, email, replyButton, cancel, reply],
    openDialog = false,
    dialogScale = 0,
    replyDialogScale = 1,

    replyDialog = {
        text: "",
        width: 420,
        height: 150,
        x: 50,
        y: 50,
        internalDraw: function(getDim, context, to, text, dialogScale){
            if (dialogScale !== 1.0) {
                return;
            }
            var titleDim = getDim(20, 25);
            context.font = '20px Avenir';
            context.fillStyle = '#333';
            context.font = '15px Avenir';
            var msgDim = getDim(20, 60);

            context.fillText('To: ' + to, titleDim.x, titleDim.y);

            context.fillText(text, msgDim.x, msgDim.y);


            // Add reply and cancel buttons.
            context.globalAlpha = 0.75;

            var sendDim = getDim(355, 5, 40, 20);
            send.width = sendDim.width;
            send.height = sendDim.height;
            send.x = sendDim.x;
            send.y = sendDim.y;
            context.drawImage(send.img, send.x, send.y, send.width, send.height);

            var cancelDim = getDim(355, 35, 40, 20);
            cancel.width = cancelDim.width;
            cancel.height = cancelDim.height;
            cancel.x = cancelDim.x;
            cancel.y = cancelDim.y;
            context.drawImage(cancel.img, cancel.x, cancel.y, cancel.width, cancel.height);

            context.globalAlpha = 1;

        }
    };

    dialog = {
        text: notifications[0],
        width: 420,
        height: 150,
        x: 50,
        y: 50,
        internalDraw: function(getDim, context, from, text, dialogScale){
            if (dialogScale !== 1.0) {
                return;
            }
            var titleDim = getDim(20, 25);
            context.font = '20px Avenir';
            context.fillStyle = '#333';
            context.fillText('From: '+ from, titleDim.x, titleDim.y);
            context.font = '15px Avenir';
            var msgDim = getDim(20, 60);
            context.fillText(text, msgDim.x, msgDim.y);

            // Add reply and cancel buttons.
            context.globalAlpha = 0.75;

            var replyDim = getDim(355, 5, 40, 20);
            reply.width = replyDim.width;
            reply.height = replyDim.height;
            reply.x = replyDim.x;
            reply.y = replyDim.y;
            context.drawImage(reply.img, reply.x, reply.y, reply.width, reply.height);

            var cancelDim = getDim(355, 35, 40, 20);
            cancel.width = cancelDim.width;
            cancel.height = cancelDim.height;
            cancel.x = cancelDim.x;
            cancel.y = cancelDim.y;
            context.drawImage(cancel.img, cancel.x, cancel.y, cancel.width, cancel.height);

            context.globalAlpha = 1;

        }
    };

var replyStart = function(){
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = function(event) { 
        console.log(event.results[0][0].transcript);
        var str = event.results[0][0].transcript;
        replyDialog.text = str;
        return str;
    }
    recognition.start();
};

var nextPowerOf2 = function(x){
    return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
};

var resize = function(){
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}

var show = function(){
    currentY = finalY;
}

var update = function(dt){
    resize();

    camera.updateProjectionMatrix();
}

var render = function(dt){
    effect.render(scene, camera);
}

var fullscreen = function(){
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}

var buttonIntersect = function(button, cursor){
    return (cursor.x && cursor.y && cursor.x > button.x && cursor.x < button.x + button.width
                && cursor.y > button.y && cursor.y < button.y + button.height);
};

var doSetTimeout = function(icon) {
    icon.lookingUpTimeout = setTimeout(function() {
        if (DEBUG)
            console.log('Going up');
        icon.startDownAnimation = true;
    }, 5000);
}

var animate = function(){
    // whether or not we are in the process of an animation.
    if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // image analysis.
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;

            data = context.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = data.data
            var colorOffset  = {red: 0, green: 1, blue: 2, alpha: 3};
            var blueones = [];

            // Go through a the top header area to look for pink areas.
            for (var i = 0; i < 120 * 4 * canvas.width && i < pixels.length; i += 4) {
                var r = pixels[i];
                var g = pixels[i + 1];
                var b = pixels[i + 2];

                var checkr = 215;
                var checkg = 90;
                var checkb = 110;

                if (
                    ( r > (checkr-25) ) &&
                    ( g > (checkg-25) && g < (checkg+25) ) &&
                    ( b > (checkb-25) && b < (checkb+25) )
                ) {
                    blueones.push([(i / 4) % canvas.width, (i / 4) / canvas.width])
                }
            }
            var sum = [0, 0], pos = [0, 0];
            for (var i = 0; i < blueones.length; i++) {
                sum[0] += blueones[i][0];
                sum[1] += blueones[i][1];
            }
            if (blueones.length > 0) {
                pos[0] = sum[0] / blueones.length;
                pos[1] = sum[1] / blueones.length;

                // draw cursor
                context.globalAlpha = 1;
                context.beginPath();
                context.arc(pos[0], pos[1], 10, 0, 2 * Math.PI, false);
                context.fillStyle = 'rgba(100, 100, 255, 255)';
                context.fill();
                context.closePath();
                context.globalAlpha = 1;

                // Keep track of cursor.
                cursor.x = pos[0];
                cursor.y = pos[1];

                lastPos = pos;
            } else {
                lastPos = null;
                cursor.x = null;
                cursor.y = null;
            }

            if (video.videoWidth > 0 && detectFaces) {
                if (!detector) {
                    var width = video.videoWidth;
                    var height = video.videoHeight;
                    detector = new objectdetect.detector(width, height, 1.1, objectdetect.frontalface);
                }

                var coords = detector.detect(video, 1, 8);

                if (coords[0]) {
                    var coord = coords[0];

                    // Rescale coordinates from detector to video coordinate space:
                    coord[0] *= video.videoWidth / detector.canvas.width;
                    coord[1] *= video.videoHeight / detector.canvas.height;
                    coord[2] *= video.videoWidth / detector.canvas.width;
                    coord[3] *= video.videoHeight / detector.canvas.height;

                    // Draw coordinates on video overlay:
                    context.beginPath();
                    context.lineWidth = '2';
                    context.fillStyle = 'rgba(0, 255, 255, 0.5)';
                    context.fillRect(
                        coord[0] / video.videoWidth * canvas.width,
                        coord[1] / video.videoHeight * canvas.height,
                        coord[2] / video.videoWidth * canvas.width,
                        coord[3] / video.videoHeight * canvas.height);
                    context.stroke();
                }
            }
        }

        // icon animations.
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];

            if (icon.startUpAnimation) {
                icon.y += animationSpeed;

                // End of the animation.
                if (icon.y >= finalY) {
                    icon.y = finalY;
                    icon.startUpAnimation = false;
                    // Create a timeout to go back up.
                    if (icon.lookingUpTimeout) {
                        clearTimeout(icon.lookingUpTimeout);
                    }

                    doSetTimeout(icon);
                }
            }
            else if (icon.startDownAnimation) {
                icon.y -= animationSpeed;

                // End.
                if (icon.y <= initialY) {
                    icon.y = initialY;
                    icon.startDownAnimation = false;
                }
            }
        }

        // Draw the icons.
        icons.forEach(function(icon){
            if (icon.customDraw){
                icon.customDraw(icon, context, icon.y);
            }
            else if (icon.img) {
                // User picture
                context.globalAlpha = icon.opacity || 0.75;
                context.drawImage(icon.img, icon.x, icon.y, icon.width, icon.height);
                context.globalAlpha = 1;
            }
            else {
                // User picture
                context.globalAlpha = 0.75;
                context.beginPath();
                context.arc(icon.x, icon.y, icon.radius, 0, 2 * Math.PI, false);
                context.fillStyle = 'white';
                context.fill();
                context.closePath();
                context.globalAlpha = 1;
            }
        });

        if (openDialog && dialog && dialogScale <= 1.0) {
            dialogScale += 0.1;
            if (dialogScale >= 1) {
                dialogScale = 1;
            }
        }
        else if (!openDialog && dialog && dialogScale >= 0) {
            dialogScale -= 0.1;
            if (dialogScale <= 0) {
                dialogScale = 0;
            }
        }

        if (dialogScale > 0 && notifications.length) {
            // context.reset();
            context.globalAlpha = 0.8;
            context.beginPath();
            context.rect(dialog.x, dialog.y,
                    dialog.width * dialogScale, dialog.height * dialogScale);
            context.fillStyle = '#fff';
            context.fill();
            context.closePath();
            context.globalAlpha = 1;

            dialog.internalDraw(function(x, y, width, height){
                var output = {};
                if (typeof x === 'number'){
                    output.x = dialog.x + x;
                }

                if (typeof y === 'number'){
                    output.y = dialog.y + y;
                }

                if (typeof width === 'number') {
                    output.width = width*dialogScale;
                }

                if (typeof height === 'number') {
                    output.height = height * dialogScale;
                }

                return output;
            }, context, notifications[0].from, notifications[0].body, dialogScale);
        }

        if (replyOpen){
           
            context.globalAlpha = 0.8;
            context.beginPath();
            context.rect(replyDialog.x, replyDialog.y,
            replyDialog.width * replyDialogScale, replyDialog.height * replyDialogScale);
            context.fillStyle = '#fff';
            context.fill();
            context.closePath();
            context.globalAlpha = 1;
            replyDialog.internalDraw(function(x, y, width, height){
                var output = {};
                if (typeof x === 'number'){
                    output.x = replyDialog.x + x;
                }

                if (typeof y === 'number'){
                    output.y = replyDialog.y + y;
                }

                if (typeof width === 'number') {
                    output.width = width;
                }

                if (typeof height === 'number') {
                    output.height = height;
                }

                return output;
            }, context, notifications[0].from, replyDialog.text, 1);

        }

        for(var i = 0; i < buttons.length; i++){
            var button = buttons[i];
            // click handlers
            var intersect = buttonIntersect(button, cursor);
            //console.log('Intersect!', intersect);

            if (intersect) {
                if (!button.time) {
                    button.time = new Date();
                }
                else if (new Date() - button.time > 500 && button.clickHandler) {
                    if (DEBUG)
                        console.log('CALLING HANDLER');
                    button.clickHandler();
                    button.time = null;
                }
            }
        }
    }

    requestAnimationFrame(animate);

    update();
    render();
}

var init = function(){

    //remove later

            for (var i = 0; i < icons.length; i++) {
        var icon = icons[i];
        icon.startUpAnimation = true;
        //    var icon = icons[i];
        //    icon.startUpAnimation = icon.startUpAnimation || (evt.gamma < 70
        //        && evt.gamma > 50 && icon.y <= initialY);
    }


    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
    camera.position.set(0, 15, 200);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    element = renderer.domElement;
    container = document.getElementById('webglviewer');
    container.appendChild(element);

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(evt){
        //if (DEBUG)
        //    console.log(evt.gamma, user.y, initialY);

        for (var i = 0; i < icons.length; i++) {
           var icon = icons[i];
           icon.startUpAnimation = icon.startUpAnimation || (evt.gamma < 70
               && evt.gamma > 50 && icon.y <= initialY);
        }

        }.bind(this));
    }

    effect = new THREE.StereoEffect(renderer);

    element.addEventListener('click', fullscreen, false);

    var options = {
        video: {
            mandatory: {
                maxHeight: 640,
                maxWidth: 960
            },
            optional: [{facingMode: "environment"}]
        }
    };

    navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (typeof MediaStreamTrack === 'undefined' && navigator.getUserMedia) {
        alert('This browser doesn\'t support Jarvis :(');
        return;
    }

    MediaStreamTrack.getSources(function(sources){
        for (var i = 0; i !== sources.length; ++i) {
            var source = sources[i];
            if (source.kind === 'video') {
                if (source.facing && source.facing == "environment") {
                    options.video.optional.push({'sourceId': source.id});
                }
            }
        }

        navigator.getUserMedia(options, function(stream){
            // Create video element and play it.
            video = document.createElement('video');
            video.setAttribute('autoplay', true);
            document.body.appendChild(video);
            video.src = URL.createObjectURL(stream);
            video.style.width = '960px';
            video.style.height = '640px';
            video.play();

            canvas = document.createElement('canvas');
            canvas.width = nextPowerOf2(canvas.width);
            canvas.height = nextPowerOf2(canvas.height);

            context = canvas.getContext('2d');
            texture = new THREE.Texture(canvas);
            texture.context = context;

            var cameraPlane = new THREE.PlaneGeometry(960, 640);

            cameraMesh = new THREE.Mesh(cameraPlane, new THREE.MeshBasicMaterial({
                color: 0xffffff, opacity: 1, map: texture
            }));

            cameraMesh.position.z = -600;

            camera.add(cameraMesh);

        }, function(error){
            console.log('Stream error: ', error);
        });
    });

    socket.on('twilioincoming', function(msg){
        messages.startUpAnimation = true;
        notifications[0] = msg;
    });

    var api = new FacePP('0ef14fa726ce34d820c5a44e57fef470', '4Y9YXOMSDvqu1Ompn9NSpNwWQFHs1hYD');
    api.request('detection/detect', {
        url: 'http://www.thenextgreatgeneration.com/wp-content/uploads/2011/07/s2-tbbt-cast-raj-01_595.jpg'
    }, function(err, result) {
        if (err) {
            // TODO handle error
            return;
        }
        // TODO use result
        console.log(JSON.stringify(result, null, 2));
    });

    // socket.emit('twiliooutgoing', {'body' : 'Yofammmmmm', 'to' : '4163170133'});

    animate();
};

window.fbAsyncInit = function() {
    FB.init({
        appId: (window.location.host === 'localhost:3000') ? '900913696645602' : '900420250028280',
        xfbml: true,
        version: 'v2.4'
    });

    FB.login(function(authRes){
        FB.api('me?fields=picture', 'get',  function(res){
            if (res.error) {
                alert('Problem fetching facebook picture.');
                return init();
            }
            profile = res.picture.data.url;

            // Download profile picture locally as canvas blocks
            // cross origin content.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', profile, true);

            xhr.responseType = 'blob';

            xhr.onload = function(e) {
               if (this.status == 200) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var img = document.getElementById('user');
                        img.setAttribute('src', e.target.result);
                        user.img = img;
                        init();
                    };
                    reader.readAsDataURL(this.response);
                }
                else {
                    init();
                }
            }

            xhr.send();
        });
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
