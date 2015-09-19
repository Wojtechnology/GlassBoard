var scene,
    camera,
    renderer,
    element,
    container,
    effect,
    video,
    canvas,
    context,
    themes = ['blackandwhite', 'sepia', 'arcade', 'inverse'],
    currentTheme = 0,
    lookingAtGround = false;

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

        context.font = "48px serif";
        context.fillText("Hello world", 10, 50);

        // if (themes[currentTheme] == 'blackandwhite') {
        //     var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        //     var data = imageData.data;

        //     for (var i = 0; i < data.length; i+=4) {
        //         var red = data[i],
        //                 green = data[i+1],
        //                 blue = data[i+2],
        //                 luminance = ((red * 299) + (green * 587) + (blue * 114)) / 1000; // Gives a value from 0 - 255
        //         if (luminance > 175) {
        //             red = 255;
        //             green = 255;
        //             blue = 255;
        //         } else if (luminance >= 100 && luminance <= 175) {
        //             red = 190;
        //             green = 190;
        //             blue = 190;
        //         } else if (luminance < 100) {
        //             red = 0;
        //             green = 0;
        //             blue = 0;
        //         }

        //         data[i] = red;
        //         data[i+1] = green;
        //         data[i+2] = blue;
        //     }

        //     imageData.data = data;

        //     context.putImageData(imageData, 0, 0);
        // } else if (themes[currentTheme] == 'inverse') {
        //     var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        //     var data = imageData.data;

        //     for (var i = 0; i < data.length; i+=4) {
        //         var red = 255 - data[i],
        //                 green = 255 - data[i+1],
        //                 blue = 255 - data[i+2];

        //         data[i] = red;
        //         data[i+1] = green;
        //         data[i+2] = blue;
        //     }

        //     imageData.data = data;

        //     context.putImageData(imageData, 0, 0);
        // } else if (themes[currentTheme] == 'sepia') {
        //     var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        //     var data = imageData.data;

        //     for (var i = 0; i < data.length; i+=4) {
        //         var red = data[i],
        //                 green = data[i+1],
        //                 blue = data[i+2];

        //         var sepiaRed = (red * 0.393) + (green * 0.769) + (blue * 0.189);
        //         var sepiaGreen = (red * 0.349) + (green * 0.686) + (blue * 0.168);
        //         var sepiaBlue = (red * 0.272) + (green * 0.534) + (blue * 0.131);

        //         var randomNoise = Math.random() * 50;

        //         sepiaRed += randomNoise;
        //         sepiaGreen += randomNoise;
        //         sepiaBlue += randomNoise;

        //         sepiaRed = sepiaRed > 255 ? 255 : sepiaRed;
        //         sepiaGreen = sepiaGreen > 255 ? 255 : sepiaGreen;
        //         sepiaBlue = sepiaBlue > 255 ? 255 : sepiaBlue;

        //         data[i] = sepiaRed;
        //         data[i+1] = sepiaGreen;
        //         data[i+2] = sepiaBlue;
        //     }

        //     imageData.data = data;

        //     context.putImageData(imageData, 0, 0);
        // } else if (themes[currentTheme] == 'arcade') {
        //     ClosePixelation(canvas, context, [
        //         {
        //             resolution: 6
        //         }
        //     ]);
        // }

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

window.fbAsyncInit = function() {
    FB.init({
        appId      : '900420250028280',
        xfbml      : true,
        version    : 'v2.4'
    });

    FB.login(function(){
        FB.api('me/inbox', function(res){
            console.log(res);
        });
    }, {scope: 'email,user_likes,read_mailbox'});
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
