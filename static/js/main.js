var scene,
    camera,
    renderer,
    element,
    container,
    effect,
    video,
    canvas,
    context,
    lookingUp = false,
    lookingUpTimeout,
    startUpAnimation = false,
    startDownAnimation = false,
    initialY = -100,
    currentY = initialY,
    finalY = 30,
    DEBUG = true,
    profile,
    notifications = ['TESTING'],
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
        customDraw: function(icon, context, currentY){
            context.save();
            context.scale(1.5, 1);
            context.beginPath();
            context.arc(icon.x + 35, currentY + 25 + icon.offset, 20, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            context.scale(1, 1);
            context.drawImage(icon.img, icon.x, currentY + icon.offset, icon.width, icon.height);
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
                dialog = {
                    text: notifications[0],
                    width: 100,
                    height: 100
                };
                openDialog = true;
            }
        },
        time: null,
        id: 'messages',
        img: document.getElementById('msg'),
        x: 250,
        y: initialY,
        width: 75,
        height: 50,
        offset: 0
    },
    email = {
        time: null,
        id: 'email',
        img: document.getElementById('email'),
        x: 350,
        y: initialY,
        width: 75,
        height: 40,
        offset: 0
    },
    news = {
        time: null,
        id: 'news',
        img: document.getElementById('news'),
        x: 300,
        y: initialY,
        width: 75,
        height: 40,
        initialY: -100,
        currentY: -100,
        offset: 0
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

var animate = function(){
    if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;

            data = context.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = data.data
            var colorOffset  = {red: 0, green: 1, blue: 2, alpha: 3};
            var blueones = [];

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
                    if (DEBUG)
                        console.log('PINK PIXEL!');
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

        if (startUpAnimation) {
            if (DEBUG) {
                console.log('GOING DOWN!', currentY, animationSpeed);
            }
            currentY += animationSpeed;

            // End of the animation.
            if (currentY >= finalY) {
                if (DEBUG) {
                    console.log('ENDING ANIMATION', currentY, finalY);
                }
                currentY = finalY;
                startUpAnimation = false;
                // Create a timeout to go back up.
                if (lookingUpTimeout) {
                    clearTimeout(lookingUpTimeout);
                }

                if (DEBUG)
                    console.log('Set timeout');

                lookingUpTimeout = setTimeout(function() {
                    startDownAnimation = true;
                }, 10000);
            }
        }
        else if (startDownAnimation) {
            currentY -= animationSpeed;

            // End.
            if (currentY <= initialY) {
                currentY = initialY;
                startDownAnimation = false;
            }
        }
        // If not animating check if cursor is on icon
        else {
            for (var i = 0; i < icons.length; i++) {
                var icon = icons[i];
                // In bounding rectangle of icon.
                if (cursor.x && cursor.y && cursor.x > icon.x && cursor.x < icon.x + icon.width
                        && cursor.y > currentY + icon.offset && cursor.y < currentY + icon.offset
                        + icon.height) {
                    if (DEBUG)
                        console.log('OVER ICON', icon.id, new Date() - (icon.time || new Date()));

                    if (!icon.time) {
                        icon.time = new Date();
                    }
                    else if (new Date() - icon.time > 3000 && icon.clickHandler) {
                        if (DEBUG)
                            console.log('CALLING HANDLER');
                        icon.clickHandler();
                        icon.time = null;
                    }
                }
                else {
                    icon.time = null;
                }
            }
        }

        icons.forEach(function(icon){
            if (icon.customDraw){
                icon.customDraw(icon, context, currentY);
            }
            else if (icon.img) {
                // User picture
                context.globalAlpha = icon.opacity || 0.75;
                context.drawImage(icon.img, icon.x, currentY + icon.offset, icon.width, icon.height);
                context.globalAlpha = 1;
            }
            else {
                // User picture
                context.globalAlpha = 0.75;
                context.beginPath();
                context.arc(icon.x, currentY + icon.offset, icon.radius, 0, 2 * Math.PI, false);
                context.fillStyle = 'white';
                context.fill();
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
            context.rect(dialog.x * dialogScale, dialog.y * dialogScale,
                    dialog.width * dialogScale, dialog.height * dialogScale);
            context.fillStyle = '#fff';
            context.fill();
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
            if (DEBUG)
                console.log(evt.gamma, currentY, initialY);

            startUpAnimation = startUpAnimation || (evt.gamma < 70
                    && evt.gamma > 50 && currentY <= initialY);

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

    animate();
};


// init();

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
