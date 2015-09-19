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
    startAnimation = false,
    detector;

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

        if (startAnimation || lookingUp) {
            startAnimation = true;

        }

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            if (video.videoWidth > 0) {
                if (!detector) {
                    var width = video.videoWidth;
                    var height = video.videoHeight;
                    detector = new objectdetect.detector(width, height, 1.1, objectdetect.handfist);
                }

                // Third parameter is the step, increase for higher performance but lower accuracy
                var coords = detector.detect(video, 1, 4);

                if (coords[0]) {
                    var coord = coords[0];

                    coord[0] *= canvas.width / detector.canvas.width;
                    coord[1] *= canvas.height / detector.canvas.height;
                    coord[2] *= canvas.width / detector.canvas.width;
                    coord[3] *= canvas.height / detector.canvas.height;

                    context.beginPath();
                    context.lineWidth = '2';
                    context.fillStyle = 'rgba(0, 255, 255, 0.5)';
                    context.fillRect(coord[0], coord[1], coord[2], coord[3]);
                    context.stroke();
                }
            }
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
            lookingUp = evt.gamma > 20;

            if (lookingUpTimeout) {
                clearTimeout(lookingUpTimeout);
            }

            lookingUpTimeout = setTimeout(function() {
                lookingUp = false;
            }, 4000);

        }.bind(this));
    }

    effect = new THREE.StereoEffect(renderer);

    element.addEventListener('click', fullscreen, false);

    var options = {
        video: {
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
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
            canvas.width = nextPowerOf2(canvas.width);
            canvas.height = nextPowerOf2(canvas.height);

            context = canvas.getContext('2d');
            texture = new THREE.Texture(canvas);
            texture.context = context;

            var cameraPlane = new THREE.PlaneGeometry(1920, 1280);

            cameraMesh = new THREE.Mesh(cameraPlane, new THREE.MeshBasicMaterial({
                color: 0xffffff, opacity: 1, map: texture
            }));

            cameraMesh.position.z = -600;

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
