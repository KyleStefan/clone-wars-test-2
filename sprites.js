(function () {
  window.SPRITES = {
    drawBackground: function (ctx, width, height, time) {
      ctx.save();

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#f08a70');
      sky.addColorStop(0.52, '#f7b46d');
      sky.addColorStop(1, '#f7d58c');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const sunX = width * 0.72;
      const sunY = height * 0.36;
      ctx.fillStyle = '#ffe9a6';
      ctx.beginPath();
      ctx.arc(sunX, sunY, Math.min(width, height) * 0.105, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97870';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.62);
      ctx.lineTo(width * 0.18, height * 0.48);
      ctx.lineTo(width * 0.36, height * 0.61);
      ctx.lineTo(width * 0.55, height * 0.46);
      ctx.lineTo(width * 0.78, height * 0.61);
      ctx.lineTo(width, height * 0.5);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#714d62';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.lineTo(width * 0.2, height * 0.61);
      ctx.lineTo(width * 0.41, height * 0.73);
      ctx.lineTo(width * 0.62, height * 0.59);
      ctx.lineTo(width * 0.83, height * 0.72);
      ctx.lineTo(width, height * 0.63);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(77, 48, 64, 0.55)';
      ctx.lineWidth = 3;
      const shimmer = Math.sin(time * 0.8) * 2;
      for (let i = 0; i < 5; i += 1) {
        const y = height * 0.77 + i * 12 + shimmer;
        ctx.beginPath();
        ctx.moveTo(width * 0.12 + i * 18, y);
        ctx.lineTo(width * 0.35 + i * 14, y);
        ctx.stroke();
      }

      ctx.restore();
    },

    drawGround: function (ctx, width, height, groundHeight, offset) {
      ctx.save();
      const top = height - groundHeight;
      ctx.fillStyle = '#d9b06b';
      ctx.fillRect(0, top, width, groundHeight);
      ctx.fillStyle = '#8d6651';
      ctx.fillRect(0, top, width, 6);

      const tile = 32;
      const shift = -(offset % tile);
      ctx.strokeStyle = '#aa805b';
      ctx.lineWidth = 2;
      for (let x = shift - tile; x < width + tile; x += tile) {
        ctx.beginPath();
        ctx.moveTo(x, top + 6);
        ctx.lineTo(x + tile * 0.5, height);
        ctx.stroke();
      }
      for (let y = top + 25; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    },

    drawBird: function (ctx, x, y, size, velocity) {
      ctx.save();
      const tilt = Math.max(-0.35, Math.min(0.35, velocity / 900));
      ctx.translate(x, y);
      ctx.rotate(tilt);
      const r = size * 0.5;
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.strokeStyle = '#26384a';
      ctx.fillStyle = '#f7f1e3';

      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.72, r * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d9e2e4';
      ctx.beginPath();
      ctx.moveTo(-r * 0.52, 0);
      ctx.quadraticCurveTo(-r * 0.2, -r * 0.72, r * 0.3, -r * 0.16);
      ctx.quadraticCurveTo(-r * 0.12, -r * 0.1, -r * 0.52, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f0a84b';
      ctx.beginPath();
      ctx.moveTo(r * 0.55, -r * 0.08);
      ctx.lineTo(r * 0.98, r * 0.08);
      ctx.lineTo(r * 0.55, r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#26384a';
      ctx.beginPath();
      ctx.arc(r * 0.37, -r * 0.2, Math.max(1.5, size * 0.055), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },

    drawPipe: function (ctx, x, gapTop, gapBottom, pipeWidth, height) {
      ctx.save();
      const trunkWidth = Math.max(10, pipeWidth * 0.25);
      const trunkX = x + (pipeWidth - trunkWidth) / 2;
      const outline = '#26384a';
      const trunk = '#3e7656';
      const frond = '#255b4b';
      const cap = '#70a65b';

      function palmTrunk(top, bottom) {
        ctx.fillStyle = trunk;
        ctx.strokeStyle = outline;
        ctx.lineWidth = Math.max(2, pipeWidth * 0.06);
        ctx.beginPath();
        ctx.moveTo(trunkX, top);
        ctx.lineTo(trunkX + trunkWidth, top);
        ctx.lineTo(trunkX + trunkWidth * 0.9, bottom);
        ctx.lineTo(trunkX + trunkWidth * 0.1, bottom);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      function canopy(cx, cy) {
        ctx.fillStyle = frond;
        ctx.strokeStyle = outline;
        ctx.lineWidth = Math.max(2, pipeWidth * 0.06);
        const leaves = [
          [cx, cy, cx - pipeWidth * 0.42, cy - pipeWidth * 0.18],
          [cx, cy, cx - pipeWidth * 0.34, cy + pipeWidth * 0.08],
          [cx, cy, cx + pipeWidth * 0.42, cy - pipeWidth * 0.2],
          [cx, cy, cx + pipeWidth * 0.38, cy + pipeWidth * 0.1],
          [cx, cy, cx + pipeWidth * 0.06, cy - pipeWidth * 0.44]
        ];
        leaves.forEach(function (leaf) {
          ctx.beginPath();
          ctx.moveTo(leaf[0], leaf[1]);
          ctx.quadraticCurveTo((leaf[0] + leaf[2]) / 2, (leaf[1] + leaf[3]) / 2 - pipeWidth * 0.1, leaf[2], leaf[3]);
          ctx.lineTo(leaf[0] + pipeWidth * 0.04, leaf[1] + pipeWidth * 0.08);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        ctx.fillStyle = cap;
        ctx.beginPath();
        ctx.arc(cx, cy, pipeWidth * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (gapTop > 0) {
        palmTrunk(0, gapTop);
        canopy(x + pipeWidth * 0.5, Math.min(gapTop - pipeWidth * 0.18, pipeWidth * 0.42));
      }
      if (gapBottom < height) {
        palmTrunk(gapBottom, height);
        canopy(x + pipeWidth * 0.5, Math.max(gapBottom + pipeWidth * 0.18, height - pipeWidth * 0.42));
      }
      ctx.restore();
    }
  };
})();
