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
    user = {
        x: 50,
        y: initialY,
        radius: 25,
        initialY: -100,
        currentY: -100,
        offset: 20
    },
    messages = {
        img: document.getElementById('msg'),
        x: 200,
        y: initialY,
        width: 75,
        height: 50,
        offset: 0
    },
    news = {
        img: document.getElementById('news'),
        x: 300,
        y: initialY,
        width: 75,
        height: 40,
        initialY: -100,
        currentY: -100,
        offset: 0
    },

    email = {
        img: document.getElementById('email'),
        x: 400,
        y: initialY,
        width: 75,
        height: 40,
        initialY: -100,
        currentY: -100,
        offset: 0
    },
    icons = [user, messages, news, email],
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
                }, 5000);
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

        icons.forEach(function(icon){
            if (icon.img) {
                // User picture
                context.globalAlpha = 0.75;
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


        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;

            data = context.getImageData(0, 0, canvas.width, canvas.height);
            var pixels = data.data
            var colorOffset  = {red: 0, green: 1, blue: 2, alpha: 3};
            var blueones = [];

            // increment by 16 for better performance
            for (var i = 0; i < pixels.length; i += 4) {
                var r = pixels[i];
                var g = pixels[i + 1];
                var b = pixels[i + 2];

                var brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                //if (prevg < 200)
                //{
                    //pixels[i + colorOffset.red] = prevpixels[i + colorOffset.red];
                    //pixels[i + colorOffset.green] = prevpixels[i + colorOffset.green];
                    //pixels[i + colorOffset.blue] = prevpixels[i + colorOffset.blue];
                    ////pixels[i + colorOffset.alpha] = 1;
                //}
                //if (r > 50 && b > 50 && g < 200) {
                    //pixels[i + colorOffset.red] = 0;
                    //pixels[i + colorOffset.green] = 0;
                    //pixels[i + colorOffset.blue] = 0;
                    ////pixels[i + colorOffset.alpha] = 0;
                //}
                // Light blue bottle cap
                var checkr = 30;
                var checkg = 57;
                var checkb = 115;
                if (
                    ( r > (checkr-25) && r < (checkr+25) ) &&
                    ( g > (checkg-25) && g < (checkg+25) ) &&
                    //( b > (checkb-25) && b < (checkb+25) )
                    ( b > (checkb-25) )
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
                lastPos = pos;
            } else {
                lastPos = null;
            }

            context.fillStyle = 'rgba(255,255,255,255)'
            context.fillRect(pos[0] - 20, pos[1] - 20, 40, 40)
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


init();

// window.fbAsyncInit = function() {
//     FB.init({
//         appId      : '900420250028280',
//         xfbml      : true,
//         version    : 'v2.4'
//     });

//     FB.login(function(authRes){
//         console.log(authRes);
//         // FB.api('me/inbox', 'get',  function(res){
//         //     console.log(res);
//         // });
//     }, {scope: 'email,user_likes,manage_notifications'});
// };

// (function(d, s, id){
//     var js, fjs = d.getElementsByTagName(s)[0];
//     if (d.getElementById(id)) {return;}
//     js = d.createElement(s); js.id = id;
//     js.src = "//connect.facebook.net/en_US/sdk.js";
//     fjs.parentNode.insertBefore(js, fjs);
// }(document, 'script', 'facebook-jssdk'));
