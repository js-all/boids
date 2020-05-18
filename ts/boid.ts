interface BoidData {
    boid: Boid,
    distance: number,
    angle: number,
    vectorTo: Vector,
    behaviour: BoidBehaviour
}

interface BoidTreshold {
    repulsion: number,
    orientation: number,
    attraction: number
}

enum BoidBehaviour {
    repulsion,
    orientation,
    attraction,
    none
}

class Boid {
    pos: Vector;
    velocity: Vector
    fov: number;
    debugDrawStack: Function[] = [];
    static Boids: Boid[] = [];
    static boidTreshold: BoidTreshold = {
        repulsion: 100,
        orientation: 200,
        attraction: 300,
    }
    static BoidSpeed: number = 10;
    constructor() {
        this.pos = new Vector(randomInt(0, cw), randomInt(0, ch));
        this.velocity = Vector.fromAngle(randomFloat(Math.PI * 2), Boid.BoidSpeed)
        Boid.Boids.push(this);
        this.fov = -0.6
    }
    move() {
        this.debugDrawStack.splice(0, this.debugDrawStack.length);
        this.pos = this.pos.add(this.velocity);
        if (this.pos.x > cw) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = cw;
        if (this.pos.y > ch) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = ch;
        const nei = this.getAllVisibleNeighbour(); // explicit
        const repB: BoidData[] = []; // all visible boids that the current object should repulsed
        const oriB: BoidData[] = []; // all visible boids that the current object should follow
        const attB: BoidData[] = []; // all visible boids that the current object should go towards
        const oriV: Vector = Vector.null; // the final dirrection to folow
        const repV: Vector = Vector.null; // the final dirrection to avoid
        const attV: Vector = Vector.null; // the final dirrection to go towards
        for (let i of nei) {
            switch (i.behaviour) {
                case BoidBehaviour.repulsion:
                    repB.push(i);
                    break;
                case BoidBehaviour.orientation:
                    oriB.push(i);
                    break;
                case BoidBehaviour.attraction:
                    attB.push(i);
            }
        }
        const attBW: number[] = [], repBW: number[] = [];
        {
            const attL: number[] = [];
            const repL: number[] = [];
            for (let i of repB) {
                repL.push(i.distance);
            }
            for (let i of attB) {
                attL.push(i.distance);
            }
            const attLMax = Math.max(...attL);
            const attLMin = Math.min(...attL);
            const repLMax = Math.max(...repL);
            const repLMin = Math.min(...repL);
            for (let i of attL) {
                i -= attLMin;
                i = 1 - i / attLMax / attL.length;
                attBW.push(i);
            }
            for (let i of repL) {
                i -= repLMin;
                i = 1 - i / repLMax / repL.length;
                repBW.push(i);
            }
        }
        {

            let attv = Vector.null;
            for (let i = 0; i < attB.length; i++) {
                const b = attB[i];
                const w = attBW[i];
                attv.set(attv.add(b.boid.pos.substract(this.pos)).multiply(w));
            }
            let repv = Vector.null;
            for (let i = 0; i < repB.length; i++) {
                const b = repB[i];
                const w = repBW[i];
                repv.set(repv.add(b.boid.pos.substract(this.pos)).multiply(w));
            }

            attV.set(attv);
            repV.set(repv);
        }
        let oriVtmp = Vector.null;
        for (let i of oriB) {
            oriVtmp = oriVtmp.add(i.boid.velocity.unit());
        }
        oriVtmp = oriVtmp.divide(oriB.length);
        oriV.set(oriVtmp);
        repV.set(repV.multiply(-1)); // negating it because we want to go the opposite dirrection
        const repFac = 1; // the higher the more the boid wants to avoid other when near (can't be 0)
        const oriW = oriB.length < 1 ? 0 : oriB.length / (Math.max(oriB.length, attB.length, repB.length) * repFac);
        const attW = attB.length < 1 ? 0 : attB.length / (Math.max(oriB.length, attB.length, repB.length) * repFac) / 2;
        const repW = repB.length < 1 ? 0 : repB.length / (Math.max(oriB.length, attB.length, repB.length) * repFac) * 2;//(1 - repV.length() / Boid.boidTreshold.repulsion)
        const velW = (1000  /*how much of the original velocity is kept*/) / 100
        const velV = this.velocity; // just the velocity but matching the naminf of the other components
        const finalVec = Vector.null;
        const Vs = [oriV, attV, repV, velV];
        const Ws = [oriW, attW, repW, velW]
        const FVs: Vector[] = [];
        const FWs: number[] = []
        for (let i in Vs) {
            if (Ws[i] !== 0) {
                FVs.push(Vs[i]);
                FWs.push(Ws[i]);
            }
        }
        for (let i of FWs) {
            i /= FWs.length;
        }
        for (let i in FVs) {
            const v = FVs[i];
            const w = FWs[i];
            finalVec.set(finalVec.add(v.multiply(w)));
        }
        this.debugDrawStack.push((ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.moveTo(...this.pos.toArray());
            ctx.lineTo(...this.pos.add(repV.setLength(500)).toArray());
            ctx.strokeStyle = "orange";
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(...this.pos.toArray());
            ctx.lineTo(...this.pos.add(oriV.setLength(500)).toArray());
            ctx.strokeStyle = "yellow";
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(...this.pos.toArray());
            ctx.lineTo(...this.pos.add(attV.setLength(500)).toArray());
            ctx.strokeStyle = "green";
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(...this.pos.toArray());
            ctx.lineTo(...this.pos.add(velV.setLength(500)).toArray());
            ctx.strokeStyle = "blue";
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(...this.pos.toArray());
            ctx.lineTo(...this.pos.add(finalVec.setLength(500)).toArray());
            ctx.strokeStyle = "purple";
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = "orange"
            ctx.font = "50px arial"
            ctx.fillText("REP: " + Math.floor(repW * 100) / 100, 10, 80);
            ctx.fillStyle = "green"
            ctx.font = "50px arial"
            ctx.fillText("ATT: " + Math.floor(attW * 100) / 100, 10, 140);
            ctx.fillStyle = "blue"
            ctx.font = "50px arial"
            ctx.fillText("ORI: " + Math.floor(oriW * 100) / 100, 10, 200);
        });
        this.velocity = finalVec.setLength(Boid.BoidSpeed);
    }

    getAllVisibleNeighbour(): BoidData[] {
        const res: BoidData[] = [];
        for (let i of Boid.Boids) {
            const vec = i.pos.substract(this.pos);
            const angle = this.velocity.unit().dot(vec.unit())
            const behaviour = vec.length() < Boid.boidTreshold.repulsion ? BoidBehaviour.repulsion : vec.length() < Boid.boidTreshold.orientation ? BoidBehaviour.orientation : vec.length() < Boid.boidTreshold.attraction ? BoidBehaviour.attraction : BoidBehaviour.none;
            if (angle < this.fov || behaviour === BoidBehaviour.none || i === this) continue;
            res.push({
                boid: i,
                distance: vec.length(),
                angle: angle,
                vectorTo: vec,
                behaviour: behaviour
            })
        }
        return res;
    }
    get id(): number {
        return Boid.Boids.indexOf(this);
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = 3
        const vel = this.velocity.setLength(50);
        const frontVec = this.pos.add(vel)
        ctx.strokeStyle = "black"
        ctx.moveTo(...frontVec.toArray());
        ctx.lineTo(...this.pos.add(vel.multiply(0.2).reverse().multiply(new Vector(1, -1))).add(vel.multiply(-0.2)).toArray())
        ctx.lineTo(...this.pos.add(vel.multiply(0.2).reverse().multiply(new Vector(-1, 1))).add(vel.multiply(-0.2)).toArray())
        ctx.lineTo(...frontVec.toArray());
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        ctx.arc(frontVec.x, frontVec.y, 2, 0, Math.PI * 2)
        ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2)
        ctx.stroke();
        ctx.closePath()
        ctx.beginPath()
        ctx.strokeStyle = 'red';
        ctx.arc(this.pos.add(vel.multiply(-0.2)).x, this.pos.add(vel.multiply(-0.2)).y, 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "red"
        ctx.font = "20px Arial";
        ctx.fillText(this.id.toString(), this.pos.x - 5, this.pos.y - 20);
    }

    drawDebug(ctx: CanvasRenderingContext2D) {
        const o: Boid[] = [];
        for (let i of Boid.Boids) {
            if (i !== this) o.push(i);
        }
        const oPosVec: Vector[] = [];
        for (let i of o) {
            oPosVec.push(i.pos.substract(this.pos));
        }

        ctx.beginPath()
        ctx.moveTo(...this.pos.toArray());
        const fix = this.fov > 0 ? 0.1 : -0.2;
        ctx.arc(this.pos.x, this.pos.y, Boid.boidTreshold.repulsion, Math.abs(1 - this.fov + fix) * (Math.PI / 2) + this.velocity.toAngle(), Math.abs(1 - this.fov + fix) * -(Math.PI / 2) + this.velocity.toAngle(), true)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        ctx.beginPath()
        ctx.moveTo(...this.pos.toArray());
        ctx.arc(this.pos.x, this.pos.y, Boid.boidTreshold.orientation, Math.abs(1 - this.fov + fix) * (Math.PI / 2) + this.velocity.toAngle(), Math.abs(1 - this.fov + fix) * -(Math.PI / 2) + this.velocity.toAngle(), true)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        ctx.beginPath()
        ctx.moveTo(...this.pos.toArray());
        ctx.arc(this.pos.x, this.pos.y, Boid.boidTreshold.attraction, Math.abs(1 - this.fov + fix) * (Math.PI / 2) + this.velocity.toAngle(), Math.abs(1 - this.fov + fix) * -(Math.PI / 2) + this.velocity.toAngle(), true)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();
        ctx.closePath();
        for (let i of oPosVec) {
            const relativeAngle: number = this.velocity.unit().dot(i.unit());
            const relativeDist: number = i.length();
            ctx.beginPath();
            ctx.strokeStyle = relativeAngle >= this.fov ? relativeDist < Boid.boidTreshold.repulsion ? "orange" : relativeDist < Boid.boidTreshold.orientation ? "yellow" : relativeDist < Boid.boidTreshold.attraction ? "green" : "gray" : 'red';
            ctx.lineWidth = 2
            ctx.moveTo(...this.pos.add(i.setLength(50)).toArray());
            ctx.lineTo(...this.pos.add(i).toArray());
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText((Math.floor(relativeAngle * 10) / 10).toString(), this.pos.add(i.multiply(0.5)).x, this.pos.add(i.multiply(0.5)).y)
        }
        for (let i of this.debugDrawStack) {
            i(ctx);
        }

    }

    static drawAll(ctx: CanvasRenderingContext2D) {
        for (let i of Boid.Boids) {
            i.draw(ctx);
        }
    }

    static drawDebugAll(ctx: CanvasRenderingContext2D) {
        for (let i of Boid.Boids) {
            i.drawDebug(ctx);
        }
    }

    static moveAll() {
        for (let i of Boid.Boids) {
            i.move();
        }
    }
}