var scene,
    camera,
    renderer,
    element,
    container,
    effect,
    video,
    canvas,
    context,
    socket = io(),
    lookingUp = false,
    initialY = -100,
    finalY = 30,
    DEBUG = true,
    profile,
    notifications = [],
    cursor = {
        x: -1,
        y: -1,
        time: 0
    },
    openDialog = false,
    dialogScale = 0,
    dialog = {
        text: notifications[0],
        width: 420,
        height: 150,
        x: 50,
        y: 50
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
                startDownAnimation = true;
                dialog.text = notifications[0];
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
    animationSpeed = 15;

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

// fail - fn to run if icon doesnt intersect.
var iconIntersect = function(cursor, fail){
    for (var i = 0; i < icons.length; i++) {
        var icon = icons[i];
        // In bounding rectangle of icon.
        if (cursor.x && cursor.y && cursor.x > icon.x && cursor.x < icon.x + icon.width
                && cursor.y > icon.y && cursor.y < icon.y + icon.height) {

            return icon;
        }
        else if (fail) {
            fail(icon);
        }
    }
    return null;
};

var doSetTimeout = function(icon) {
    icon.lookingUpTimeout = setTimeout(function() {
        if (DEBUG)
            console.log('Going up');
        icon.startDownAnimation = true;
    }, 10000);
}

var animate = function(){
    if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;

            data = context.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = data.data
            var colorOffset  = {red: 0, green: 1, blue: 2, alpha: 3};
            var blueones = [];

            // Go through a the top header area to look for pink areas.
            for (var i = 0; i < 120 * 4 * canvas.height && i < pixels.length; i += 4) {
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
        }
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];

            if (icon.startUpAnimation) {
                if (DEBUG) {
                    console.log('GOING DOWN!', icon.y, animationSpeed);
                }
                icon.y += animationSpeed;

                // End of the animation.
                if (icon.y >= finalY) {
                    if (DEBUG) {
                        console.log('ENDING ANIMATION', icon.y, finalY);
                    }
                    icon.y = finalY;
                    icon.startUpAnimation = false;
                    // Create a timeout to go back up.
                    if (icon.lookingUpTimeout) {
                        clearTimeout(icon.lookingUpTimeout);
                    }
                    if (DEBUG)
                        console.log('Set timeout');

                    doSetTimeout(icon);
                }
            }
            else if (icon.startDownAnimation) {
                icon.y -= animationSpeed;
                if (DEBUG) {
                    console.log('GOING UP!', icon.y, animationSpeed);
                }

                // End.
                if (icon.y <= initialY) {
                    icon.y = initialY;
                    icon.startDownAnimation = false;
                }
            }
            // If not animating check if cursor is on icon
            else {
                var intersectIcon = iconIntersect(cursor, function(icon){
                    icon.time = null;
                });

                if (intersectIcon) {
                    if (!icon.time) {
                        icon.time = new Date();
                    }
                    else if (new Date() - icon.time > 500 && icon.clickHandler) {
                        if (DEBUG)
                            console.log('CALLING HANDLER');
                        icon.clickHandler();
                        icon.time = null;
                    }
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

        if (dialogScale > 0) {
            // context.reset();
            context.globalAlpha = 0.8;
            context.beginPath();
            context.rect(dialog.x * dialogScale, dialog.y * dialogScale,
                    dialog.width * dialogScale, dialog.height * dialogScale);
            context.fillStyle = '#fff';
            context.fill();
            context.closePath();
            context.globalAlpha = 1;
        }

    }

    requestAnimationFrame(animate);

    update();
    render();
}

var init = function(){
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

        //for (var i = 0; i < icons.length; i++) {
        //    var icon = icons[i];
        //    icon.startUpAnimation = icon.startUpAnimation || (evt.gamma < 70
        //        && evt.gamma > 50 && icon.y <= initialY);
        //}

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
        notifications.push(msg);
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
