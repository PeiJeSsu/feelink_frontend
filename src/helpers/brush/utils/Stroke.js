class Stroke {
    constructor(points = [], width = 1, color = '#000000', opacity = 1) {
        this.points = points;
        this.width = width;
        this.color = color;
        this.opacity = opacity;
    }

    addPoint(point) {
        this.points.push(point);
    }

    draw(ctx) {
        if (this.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = this.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}

export default Stroke;
