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
    finalY = 100,
    DEBUG = true,
    user = {
        x: 500,
        y: initialY,
        radius: 50
    },
    messages = {
        x: 900,
        y: initialY,
        radius: 50
    },
    email = {
        x: 1100,
        y: initialY,
        radius: 50
    },
    news = {
        x: 1300,
        y: initialY,
        radius: 50
    },
    icons = [user, messages, email, news],
    animationSpeed = 20;

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
        // else if (!lookingUp) {
        //     if (lookingUpTimeout) {
        //         clearTimeout(lookingUpTimeout);
        //     }

        //     lookingUpTimeout = setTimeout(function() {
        //         lookingUp = false;
        //     }, 4000);
        //     currentY = initialY;
        // }

        icons.forEach(function(icon){
            // User picture
            context.beginPath();
            context.arc(icon.x, currentY, icon.radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();
        });


        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            texture.needsUpdate = true;
        }
    }

    requestAnimationFrame(animate);

    update();
    render();
}

var init = function(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
    camera.position.set(0, 15, 0);
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
            // mandatory: {
            //     maxHeight: 1440,
            //     maxWidth: 1280
            // },
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
            video.style.width = '100%';
            video.style.height = '100%';
            video.play();

            canvas = document.createElement('canvas');
            canvas.width = nextPowerOf2(canvas.width);
            canvas.height = nextPowerOf2(canvas.height);

            context = canvas.getContext('2d');
            texture = new THREE.Texture(canvas);
            texture.context = context;

            var cameraPlane = new THREE.PlaneGeometry(1920, 1280);

            cameraMesh = new THREE.Mesh(cameraPlane, new THREE.MeshBasicMaterial({
                color: 0xffffff, opacity: 1, map: texture
            }));

            cameraMesh.position.z = -800;

            scene.add(cameraMesh);

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
