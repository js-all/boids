const canvas = <HTMLCanvasElement>document.createElement('canvas');
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
const cw: number = 2000;
const ch: number = cw;
canvas.height = ch;
canvas.width = cw;

document.body.appendChild(canvas)


var pointer = 0;

const Keys: number[] = [];

window.addEventListener('keydown', e => {
    if (e.keyCode === 39) {
        pointer = pointer >= Boid.Boids.length - 1 ? 0 : pointer + 1;
    } else if (e.keyCode === 37) {
        pointer = pointer <= 0 ? Boid.Boids.length - 1 : pointer - 1;
    }
})




for (let i of new Array(80)) {
    new Boid()
}

function draw() {
    ctx.clearRect(0, 0, cw, ch);
    Boid.drawAll(ctx)
    Boid.Boids[pointer].drawDebug(ctx);
    requestAnimationFrame(draw);
}

function play() {
    Boid.moveAll()
    setTimeout(play, 1000 / 10);
}

draw.rate = 30;
play.rate = 60;

draw();
play();

const _$$c: HTMLCanvasElement = canvas;
const _$$cw = _$$c.width;
const _$$ch = _$$c.height;
function _$$adaptSize() {
    let rhl = _$$cw / _$$ch;
    let rlh = _$$ch / _$$cw;
    if (window.innerWidth > window.innerHeight * rhl) {
        _$$c.style.width = 'inherit';
        _$$c.style.height = '100%';
    }
    if (window.innerHeight > window.innerWidth * rlh) {
        _$$c.style.height = 'inherit';
        _$$c.style.width = '100%';
    }
}
_$$adaptSize();

window.addEventListener('resize', _$$adaptSize);


function randomFloat(max: number = 100, min: number = 0) {
    return Math.random() * (max - min) + min;
}

function randomInt(max: number = 100, min: number = 0) {
    return Math.floor(randomFloat(max + 1, min));
}


